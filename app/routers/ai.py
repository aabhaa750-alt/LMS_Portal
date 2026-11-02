import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Resource, Course, DocumentChunk, AiConversation, AiMessage, PersonalNote
from app.auth import get_current_user
from app.schemas import (
    AiChatRequest,
    AiChatResponse,
    AiExplainRequest,
    AiKeyUpdateRequest,
    DocumentChunkOut
)
from app.ai_service import (
    execute_ai_query,
    explain_concept_5part,
    generate_study_notes_from_deck,
    get_active_openai_key
)
from app.ai_extractor import index_resource_document

router = APIRouter(prefix="/api/ai", tags=["AI Learning Assistant"])


@router.get("/status")
def get_ai_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    api_key = get_active_openai_key(current_user)
    has_key = bool(api_key and len(api_key) > 5)
    
    total_resources = db.query(Resource).filter(Resource.user_id == current_user.id).count()
    indexed_resources = db.query(DocumentChunk.resource_id).filter(
        DocumentChunk.user_id == current_user.id
    ).distinct().count()
    total_chunks = db.query(DocumentChunk).filter(DocumentChunk.user_id == current_user.id).count()

    masked_key = ""
    if has_key:
        masked_key = api_key[:7] + "..." + api_key[-4:] if len(api_key) > 12 else "********"

    return {
        "is_configured": has_key,
        "openai_configured": has_key,
        "provider": current_user.ai_provider or "openai",
        "masked_key": masked_key,
        "total_resources": total_resources,
        "indexed_resources": indexed_resources,
        "total_chunks": total_chunks,
        "indexed_chunks_count": total_chunks,
        "needs_indexing": (total_resources - indexed_resources) > 0,
        "model_name": "GPT-4o-mini" if has_key else "Local Grounding Engine"
    }


@router.put("/api-key")
@router.post("/api-key")
def update_api_key(
    req: AiKeyUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    clean_key = req.openai_api_key.strip() if (req.openai_api_key and req.openai_api_key.strip()) else None
    current_user.openai_api_key = clean_key
    if req.ai_provider:
        current_user.ai_provider = req.ai_provider.strip()
    db.commit()
    db.refresh(current_user)
    return {
        "message": "AI credentials updated successfully.",
        "is_configured": bool(current_user.openai_api_key),
        "openai_configured": bool(current_user.openai_api_key)
    }


@router.post("/index-all")
def index_all_resources(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Indexes all uploaded PPTX, PDF, and text documents into slide/page chunks."""
    resources = db.query(Resource).filter(Resource.user_id == current_user.id).all()
    total_indexed_chunks = 0
    indexed_files = 0

    for res in resources:
        chunks_count = index_resource_document(db, res)
        if chunks_count > 0:
            total_indexed_chunks += chunks_count
            indexed_files += 1

    return {
        "message": f"Successfully indexed {indexed_files} presentations/documents into {total_indexed_chunks} searchable slide & page units.",
        "indexed_files": indexed_files,
        "total_chunks": total_indexed_chunks
    }


@router.get("/conversations")
def get_conversations(
    course_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(AiConversation).filter(AiConversation.user_id == current_user.id)
    if course_id:
        query = query.filter(AiConversation.course_id == course_id)
    convos = query.order_by(AiConversation.updated_at.desc()).limit(20).all()

    return [
        {
            "id": c.id,
            "title": c.title,
            "mode": c.mode,
            "course_id": c.course_id,
            "resource_id": c.resource_id,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
            "message_count": len(c.messages)
        }
        for c in convos
    ]


@router.get("/conversations/{conversation_id}")
def get_conversation_detail(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    convo = db.query(AiConversation).filter(
        AiConversation.id == conversation_id,
        AiConversation.user_id == current_user.id
    ).first()
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = []
    for m in convo.messages:
        sources = []
        if m.sources_json:
            try:
                sources = json.loads(m.sources_json)
            except Exception:
                sources = []
        messages.append({
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "sources": sources,
            "created_at": m.created_at
        })

    return {
        "id": convo.id,
        "title": convo.title,
        "mode": convo.mode,
        "course_id": convo.course_id,
        "resource_id": convo.resource_id,
        "messages": messages
    }


@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    convo = db.query(AiConversation).filter(
        AiConversation.id == conversation_id,
        AiConversation.user_id == current_user.id
    ).first()
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(convo)
    db.commit()
    return {"message": "Conversation deleted successfully."}


@router.post("/chat", response_model=AiChatResponse)
async def chat_with_ai(
    req: AiChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    actual_prompt = req.prompt or req.message or ""
    if not actual_prompt.strip():
        raise HTTPException(status_code=422, detail="Prompt or message is required")
    actual_mode = req.study_mode or req.mode or "learn"

    # Retrieve or create conversation
    convo = None
    if req.conversation_id:
        convo = db.query(AiConversation).filter(
            AiConversation.id == req.conversation_id,
            AiConversation.user_id == current_user.id
        ).first()

    if not convo:
        # Title from first 50 chars of prompt
        first_line = actual_prompt.splitlines()[0]
        convo_title = first_line[:50] if len(first_line) > 3 else "MBA Study Session"
        convo = AiConversation(
            user_id=current_user.id,
            course_id=req.course_id,
            resource_id=req.resource_id,
            title=convo_title,
            mode=actual_mode
        )
        db.add(convo)
        db.commit()
        db.refresh(convo)

    # Save user message
    user_msg = AiMessage(
        conversation_id=convo.id,
        user_id=current_user.id,
        role="user",
        content=actual_prompt
    )
    db.add(user_msg)
    convo.updated_at = datetime.utcnow()
    db.commit()

    # Format previous history for multi-turn conversational context
    history = []
    for m in convo.messages:
        history.append({"role": m.role, "content": m.content})

    # Execute AI query (grounded with student's slides)
    ai_result = await execute_ai_query(
        user=current_user,
        db=db,
        prompt=actual_prompt,
        mode=actual_mode,
        course_id=req.course_id,
        resource_id=req.resource_id,
        conversation_history=history
    )

    # Save assistant message
    sources_json = json.dumps(ai_result.get("sources", [])) if ai_result.get("sources") else None
    asst_msg = AiMessage(
        conversation_id=convo.id,
        user_id=current_user.id,
        role="assistant",
        content=ai_result["response"],
        sources_json=sources_json
    )
    db.add(asst_msg)
    db.commit()
    db.refresh(asst_msg)

    citations = [s.get("source", "") for s in ai_result.get("sources", [])]

    return AiChatResponse(
        conversation_id=convo.id,
        message_id=asst_msg.id,
        response=ai_result["response"],
        reply=ai_result["response"],
        sources=ai_result.get("sources", []),
        citations=citations,
        provider=ai_result["provider"],
        mode=actual_mode,
        is_configured=ai_result["is_configured"]
    )


@router.post("/explain-concept")
async def explain_concept(
    req: AiExplainRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await explain_concept_5part(current_user, db, req.concept, req.course_id, req.resource_id)
    return result


@router.post("/generate-notes/{resource_id}")
async def generate_deck_notes(
    resource_id: int,
    save_as_note: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resource = db.query(Resource).filter(
        Resource.id == resource_id,
        Resource.user_id == current_user.id
    ).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    notes_markdown = await generate_study_notes_from_deck(current_user, db, resource)

    saved_note_id = None
    if save_as_note:
        note = PersonalNote(
            user_id=current_user.id,
            course_id=resource.course_id,
            unit_topic_id=resource.unit_topic_id,
            resource_id=resource.id,
            title=f"AI Study Notes: {resource.title}",
            content=notes_markdown,
            tags="ai-generated, lecture-notes, revision"
        )
        db.add(note)
        db.commit()
        db.refresh(note)
        saved_note_id = note.id

    return {
        "resource_id": resource.id,
        "resource_title": resource.title,
        "notes": notes_markdown,
        "study_notes": notes_markdown,
        "saved_note_id": saved_note_id,
        "note_id": saved_note_id
    }


@router.get("/resource-chunks/{resource_id}", response_model=List[DocumentChunkOut])
def get_resource_chunks(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chunks = db.query(DocumentChunk).filter(
        DocumentChunk.resource_id == resource_id,
        DocumentChunk.user_id == current_user.id
    ).order_by(DocumentChunk.chunk_number.asc()).all()

    # If not indexed yet, auto-index on first view
    if not chunks:
        res = db.query(Resource).filter(Resource.id == resource_id, Resource.user_id == current_user.id).first()
        if res:
            index_resource_document(db, res)
            chunks = db.query(DocumentChunk).filter(
                DocumentChunk.resource_id == resource_id,
                DocumentChunk.user_id == current_user.id
            ).order_by(DocumentChunk.chunk_number.asc()).all()

    output_chunks = []
    for c in chunks:
        output_chunks.append(
            DocumentChunkOut(
                id=c.id,
                resource_id=c.resource_id,
                chunk_type=c.chunk_type,
                chunk_number=c.chunk_number,
                slide_number=c.chunk_number,
                title=c.title,
                section_title=c.title,
                content=c.content,
                token_count=len(c.content) // 4,
                created_at=c.created_at
            )
        )
    return output_chunks

