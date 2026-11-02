import os
import json
import re
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models import User, Resource, Course, DocumentChunk, AiConversation, AiMessage
from app.ai_extractor import index_resource_document


def get_active_openai_key(user: User) -> Optional[str]:
    """Retrieves user's custom API key or server-wide environment key."""
    if user and user.openai_api_key and user.openai_api_key.strip():
        return user.openai_api_key.strip()
    env_key = os.getenv("OPENAI_API_KEY", "")
    return env_key.strip() if env_key else None


def search_document_chunks(
    db: Session,
    user_id: int,
    query: str,
    course_id: Optional[int] = None,
    resource_id: Optional[int] = None,
    limit: int = 6
) -> List[Dict[str, Any]]:
    """
    Retrieves the most relevant document chunks based on keywords and query terms.
    Preserves exact course and slide/page citations.
    """
    base_query = db.query(DocumentChunk).filter(DocumentChunk.user_id == user_id)
    if course_id:
        base_query = base_query.filter(DocumentChunk.course_id == course_id)
    if resource_id:
        base_query = base_query.filter(DocumentChunk.resource_id == resource_id)

    # Clean query tokens
    tokens = [t.lower() for t in re.findall(r"\b[a-zA-Z0-9_\-]{3,}\b", query)]
    
    # If no tokens or very short query, get latest chunks for the resource/course
    if not tokens:
        results = base_query.order_by(DocumentChunk.chunk_number.asc()).limit(limit).all()
    else:
        # Build OR filters across content and title
        filters = []
        for t in tokens[:6]:
            filters.append(DocumentChunk.content.ilike(f"%{t}%"))
            filters.append(DocumentChunk.title.ilike(f"%{t}%"))
        
        results = base_query.filter(or_(*filters)).limit(limit).all()
        
        # If no direct keyword hits, fallback to sample chunks of that resource
        if not results and resource_id:
            results = base_query.order_by(DocumentChunk.chunk_number.asc()).limit(limit).all()

    chunks_out = []
    for chunk in results:
        res = chunk.resource
        course = res.course if res else None
        chunks_out.append({
            "chunk_id": chunk.id,
            "resource_id": chunk.resource_id,
            "resource_title": res.title if res else "Course Document",
            "course_name": course.name if course else "General",
            "chunk_type": chunk.chunk_type,  # "slide" or "page"
            "chunk_number": chunk.chunk_number,
            "title": chunk.title,
            "content": chunk.content
        })
    return chunks_out


def build_system_prompt_for_mode(mode: str) -> str:
    """Creates an MBA faculty-grade pedagogical persona tailored to the chosen mode."""
    base = (
        "You are 'MBA Learning Assistant', a world-class personal MBA tutor and executive faculty advisor. "
        "Your mission is to help an MBA student deeply understand, analyze, and apply business concepts. "
        "Strictly prioritize the provided classroom study material (lecture presentations, slides, and notes). "
        "Always cite relevant sources with slide numbers (e.g. '[Tech-Stacks-Guide.pptx, Slide 4]'). "
        "If an answer is based on general management theory rather than their uploaded slides, clearly state: "
        "'[Additional MBA Context: Not explicitly covered in uploaded slides]'.\n\n"
    )

    if mode == "learn":
        return base + (
            "MODE: LEARN FROM BASICS\n"
            "- Start with an intuitive, jargon-free explanation.\n"
            "- Transition into rigorous MBA-level business definitions and core mechanics.\n"
            "- Provide a clear real-world business analogy."
        )
    elif mode == "quick_revision":
        return base + (
            "MODE: QUICK REVISION & EXECUTIVE SUMMARY\n"
            "- Deliver high-yield bullet points and key takeaways.\n"
            "- Highlight critical formulas, rules of thumb, and decision criteria.\n"
            "- Ideal for rapid pre-class or pre-exam revision."
        )
    elif mode == "exam":
        return base + (
            "MODE: MBA EXAM & CASE ANSWER\n"
            "Structure your answer as an honors MBA exam response:\n"
            "1. Formal Academic Definition\n"
            "2. Underlying Theoretical Framework / Mechanics\n"
            "3. Strategic Corporate Execution (with specific trade-offs)\n"
            "4. Critical Evaluation & Limitations"
        )
    elif mode == "business":
        return base + (
            "MODE: REAL-WORLD CORPORATE APPLICATION\n"
            "- Focus directly on how top enterprises (e.g., Apple, Amazon, Stripe, Netflix, Zara, Tesla, Google) implement this concept.\n"
            "- Detail the strategic business trade-offs, metrics (ROI, CAC, LTV, Margin), and competitive advantage gained."
        )
    else:  # ask_anything
        return base + (
            "MODE: INTERACTIVE MBA DIALOGUE\n"
            "- Answer directly, intelligently, and conversationally.\n"
            "- Invite follow-up exploration and challenge assumptions where helpful."
        )


async def execute_ai_query(
    user: User,
    db: Session,
    prompt: str,
    mode: str = "learn",
    course_id: Optional[int] = None,
    resource_id: Optional[int] = None,
    conversation_history: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    """
    Executes an AI study request grounded in the student's classroom materials.
    Uses OpenAI if an API key is available; otherwise provides grounded local synthesis.
    """
    # 1. Retrieve grounded context chunks
    relevant_chunks = search_document_chunks(db, user.id, prompt, course_id, resource_id, limit=5)
    
    # Format context for citations
    context_text = ""
    sources_list = []
    if relevant_chunks:
        context_parts = []
        for c in relevant_chunks:
            source_label = f"{c['resource_title']} (Slide/Page {c['chunk_number']})"
            sources_list.append({
                "resource_id": c["resource_id"],
                "resource_title": c["resource_title"],
                "chunk_type": c["chunk_type"],
                "chunk_number": c["chunk_number"],
                "title": c["title"]
            })
            context_parts.append(f"--- SOURCE: {source_label} ---\nTitle: {c['title']}\n{c['content']}\n")
        context_text = "\n".join(context_parts)

    api_key = get_active_openai_key(user)

    if api_key:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)

            system_instruction = build_system_prompt_for_mode(mode)
            if context_text:
                system_instruction += (
                    f"\n\nHERE ARE THE EXCERPTS FROM THE STUDENT'S UPLOADED LECTURE SLIDES / NOTES:\n{context_text}\n"
                    "Ground your explanation in these excerpts and cite them precisely."
                )
            else:
                system_instruction += "\n\nNote: No specific matching classroom slides found for this prompt. Provide executive MBA guidance."

            messages = [{"role": "system", "content": system_instruction}]

            # Add previous conversation history if available
            if conversation_history:
                for msg in conversation_history[-6:]:  # last 3 turns
                    if msg.get("role") in ["user", "assistant"] and msg.get("content"):
                        messages.append({"role": msg["role"], "content": msg["content"]})

            messages.append({"role": "user", "content": prompt})

            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.4,
                max_tokens=1500,
            )

            response_content = completion.choices[0].message.content or ""
            return {
                "response": response_content,
                "sources": sources_list,
                "provider": "openai",
                "mode": mode,
                "is_configured": True
            }
        except Exception as e:
            return {
                "response": f"Error communicating with OpenAI API: {str(e)}\n\nPlease verify your API key in Settings & Backup.",
                "sources": sources_list,
                "provider": "openai_error",
                "mode": mode,
                "is_configured": False
            }

    # If no API key configured, generate a structured, grounded local knowledge card
    return generate_local_grounded_response(prompt, mode, relevant_chunks, sources_list)


def generate_local_grounded_response(
    prompt: str,
    mode: str,
    chunks: List[Dict[str, Any]],
    sources: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Transparent local document synthesis when an external LLM API key has not yet been set.
    Directly extracts and synthesizes slide facts, definitions, and citations without hallucination.
    """
    if not chunks:
        msg = (
            f"### 📚 MBA Learning Assistant\n\n"
            f"**No direct classroom notes matched your query for:** *\"{prompt}\"*\n\n"
            f"> 💡 **To enable full AI generative explanations**, add your OpenAI API Key in **Settings & Backup &rarr; AI Configuration**, or configure `OPENAI_API_KEY` in your environment.\n\n"
            f"**Recommended Action:**\n"
            f"- Select a specific uploaded course or presentation from the dropdown on the left.\n"
            f"- Browse your slides in the **Resource Library** to ensure your lecture files are indexed."
        )
        return {
            "response": msg,
            "sources": [],
            "provider": "local_synthesizer",
            "mode": mode,
            "is_configured": False
        }

    first_chunk = chunks[0]
    extracted_bullets = []
    for c in chunks[:3]:
        lines = [line.strip("- *• ") for line in c["content"].splitlines() if len(line.strip()) > 8]
        for line in lines[:3]:
            extracted_bullets.append(f"- **[{c['resource_title']} · Slide/Page {c['chunk_number']}]:** {line}")

    bullets_text = "\n".join(extracted_bullets)

    explanation = (
        f"### 🎓 Classroom Insight: Grounded in Your Study Material\n\n"
        f"**Source Document:** `{first_chunk['resource_title']}` ({first_chunk['chunk_type'].capitalize()} {first_chunk['chunk_number']})\n\n"
        f"#### Key Concepts Found in Your Slides:\n"
        f"{bullets_text}\n\n"
        f"#### 💼 MBA Strategic Context:\n"
        f"In Product Management and business strategy, mastering these concepts allows managers to evaluate architectural trade-offs, align technical roadmaps with revenue goals, and eliminate friction between engineering and business stakeholders.\n\n"
        f"---\n"
        f"💡 *Note: Running in **Local Document Extraction Mode**. For interactive open-ended generation, reasoning, and automated quiz creation, set your **OpenAI API Key** in [Settings & Backup](#settings).*"
    )

    return {
        "response": explanation,
        "sources": sources,
        "provider": "local_synthesizer",
        "mode": mode,
        "is_configured": False
    }


async def explain_concept_5part(
    user: User,
    db: Session,
    concept: str,
    course_id: Optional[int] = None,
    resource_id: Optional[int] = None
) -> Dict[str, Any]:
    """Generates the universal 5-part MBA concept breakdown."""
    prompt = (
        f"Provide a structured 5-part MBA breakdown for the concept: '{concept}'.\n"
        f"Format strictly with these 5 markdown headings:\n"
        f"1. Simple Meaning (Plain English intuitive definition)\n"
        f"2. MBA-Level Explanation (Formal business terminology, mechanisms, and framework)\n"
        f"3. Practical Business Example (Real brand implementation: e.g. Apple, Amazon, Stripe, Netflix, Zara)\n"
        f"4. Key Terminology & Related Formulas\n"
        f"5. Application in MBA Exams & Class Discussions"
    )
    res = await execute_ai_query(user, db, prompt=prompt, mode="exam", course_id=course_id, resource_id=resource_id)
    full_text = res.get("response", "")
    sources = res.get("sources", [])
    citations = [s.get("source", "") for s in sources]

    # Default fallback values for structured 5-part breakdown
    simple_meaning = f"{concept} refers to a core foundational methodology and architecture in modern business and technical operations."
    mba_level = f"At an enterprise executive level, {concept} governs operational efficiency, scalable workflows, and structural resource allocation."
    business_ex = f"Leading digital enterprises (such as Stripe, Amazon Web Services, and Netflix) apply {concept} to decouple systems and scale high-concurrency transactions."
    terminology = f"Core vocabulary includes System Decoupling, Latency SLAs, Scalability, Modularity, and Lifecycle Governance."
    exam_tips = f"In an examination or classroom discussion, define {concept} using a 3-tier framework: definition, architectural trade-offs, and ROI/business metrics."

    # Parse sections from full_text if generated
    import re
    p1 = re.search(r'(?:1\.\s*Simple Meaning|### 1\.)[:\s]*(.*?)(?=(?:2\.\s*MBA|### 2\.)|\Z)', full_text, re.DOTALL | re.IGNORECASE)
    if p1 and len(p1.group(1).strip()) > 10:
        simple_meaning = p1.group(1).strip()

    p2 = re.search(r'(?:2\.\s*MBA|### 2\.)[:\s]*(.*?)(?=(?:3\.\s*Practical|### 3\.)|\Z)', full_text, re.DOTALL | re.IGNORECASE)
    if p2 and len(p2.group(1).strip()) > 10:
        mba_level = p2.group(1).strip()

    p3 = re.search(r'(?:3\.\s*Practical|### 3\.)[:\s]*(.*?)(?=(?:4\.\s*Key Terminology|### 4\.)|\Z)', full_text, re.DOTALL | re.IGNORECASE)
    if p3 and len(p3.group(1).strip()) > 10:
        business_ex = p3.group(1).strip()

    p4 = re.search(r'(?:4\.\s*Key Terminology|### 4\.)[:\s]*(.*?)(?=(?:5\.\s*Application|### 5\.)|\Z)', full_text, re.DOTALL | re.IGNORECASE)
    if p4 and len(p4.group(1).strip()) > 10:
        terminology = p4.group(1).strip()

    p5 = re.search(r'(?:5\.\s*Application|### 5\.)[:\s]*(.*?)(?=\Z|---|\Z)', full_text, re.DOTALL | re.IGNORECASE)
    if p5 and len(p5.group(1).strip()) > 10:
        exam_tips = p5.group(1).strip()

    return {
        "concept": concept,
        "simple_meaning": simple_meaning,
        "mba_level_explanation": mba_level,
        "practical_business_example": business_ex,
        "important_terminology": terminology,
        "exam_and_discussion_tips": exam_tips,
        "citations": citations,
        "sources": sources,
        "response": full_text,
        "is_configured": res.get("is_configured", False)
    }


async def generate_study_notes_from_deck(
    user: User,
    db: Session,
    resource: Resource
) -> str:
    """Converts an uploaded presentation deck into executive study notes."""
    chunks = db.query(DocumentChunk).filter(
        DocumentChunk.resource_id == resource.id,
        DocumentChunk.user_id == user.id
    ).order_by(DocumentChunk.chunk_number.asc()).all()

    if not chunks:
        index_resource_document(db, resource)
        chunks = db.query(DocumentChunk).filter(
            DocumentChunk.resource_id == resource.id,
            DocumentChunk.user_id == user.id
        ).order_by(DocumentChunk.chunk_number.asc()).all()

    deck_text = ""
    for c in chunks:
        deck_text += f"\n[Slide {c.chunk_number}: {c.title}]\n{c.content}\n"

    api_key = get_active_openai_key(user)
    if api_key:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)
            prompt = (
                f"You are an MBA faculty tutor. Convert the following presentation slides from '{resource.title}' "
                f"into comprehensive, structured personal study notes in Markdown format.\n\n"
                f"Include:\n"
                f"1. Executive Overview & Core Purpose\n"
                f"2. Key Frameworks, Stacks & Mechanics (with slide references)\n"
                f"3. Strategic Decision Points & Trade-offs\n"
                f"4. Important MBA Glossary / Definitions\n"
                f"5. Potential Examination / Interview Questions\n\n"
                f"SLIDES DATA:\n{deck_text[:12000]}"
            )
            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=2000,
            )
            return completion.choices[0].message.content or "Notes generation completed."
        except Exception as e:
            pass

    # High quality local synthesizer fallback
    sections = []
    sections.append(f"# Executive Study Notes: {resource.title}\n")
    sections.append(f"**Course:** {resource.course.name if resource.course else 'General'} | **Slides Total:** {len(chunks)} slides\n")
    sections.append("## 1. Lecture Overview & Core Themes\n")
    sections.append(f"This session covers core principles from `{resource.original_filename}`. Below is the systematic slide-by-slide synthesis:\n")

    sections.append("## 2. Key Frameworks & Detailed Slide Breakdown\n")
    for c in chunks[:15]:
        content_lines = [l for l in c.content.splitlines() if len(l.strip()) > 3]
        bullets = "\n".join([f"- {l.strip('- *')}" for l in content_lines[:4]])
        sections.append(f"### Slide {c.chunk_number}: {c.title}\n{bullets}\n")

    sections.append("## 3. MBA Examination & Interview Revision Questions\n")
    sections.append(f"- How does the architecture in `{resource.title}` drive organizational scalability and unit economics?")
    sections.append(f"- What are the primary trade-offs a Product Manager must evaluate when selecting these systems?")

    return "\n".join(sections)
