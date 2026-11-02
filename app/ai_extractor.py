import re
from pathlib import Path
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import Resource, DocumentChunk
from app.storage import get_safe_file_path


def clean_text(text: str) -> str:
    """Normalizes whitespace and strips empty lines."""
    if not text:
        return ""
    text = re.sub(r"[ \t]+", " ", text)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return "\n".join(lines)


def extract_from_pptx(file_path: Path, original_filename: str) -> List[Dict[str, Any]]:
    """Extracts slide titles, body bullets, tables, and notes from PPTX."""
    chunks = []
    try:
        from pptx import Presentation
        prs = Presentation(str(file_path))
        
        for idx, slide in enumerate(prs.slides, 1):
            slide_title = ""
            slide_texts = []
            
            # Check for title shape
            if slide.shapes.title and slide.shapes.title.has_text_frame:
                slide_title = slide.shapes.title.text.strip()
                
            # Extract text from shapes
            for shape in slide.shapes:
                if shape.has_text_frame and shape != slide.shapes.title:
                    shape_text = shape.text.strip()
                    if shape_text:
                        slide_texts.append(shape_text)
                elif shape.has_table:
                    # Extract table cell contents
                    table_rows = []
                    for row in shape.table.rows:
                        row_vals = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                        if row_vals:
                            table_rows.append(" | ".join(row_vals))
                    if table_rows:
                        slide_texts.append("Table Data:\n" + "\n".join(table_rows))
            
            # Extract presenter notes if available
            try:
                if slide.has_notes_slide and slide.notes_slide.notes_text_frame:
                    notes = slide.notes_slide.notes_text_frame.text.strip()
                    if notes:
                        slide_texts.append(f"Notes: {notes}")
            except Exception:
                pass

            combined_body = "\n".join(slide_texts)
            if not slide_title and slide_texts:
                # Use first line as title fallback
                first_line = slide_texts[0].split("\n")[0]
                slide_title = first_line[:80]
            
            if not slide_title:
                slide_title = f"Slide {idx}"

            full_content = f"{slide_title}\n{combined_body}".strip() if combined_body else slide_title

            if full_content:
                chunks.append({
                    "chunk_type": "slide",
                    "chunk_number": idx,
                    "title": slide_title,
                    "content": clean_text(full_content)
                })
    except Exception as e:
        print(f"Error parsing PPTX {file_path.name}: {e}")

    return chunks


def extract_from_pdf(file_path: Path, original_filename: str) -> List[Dict[str, Any]]:
    """Extracts text page by page from PDF using pypdf with fallback."""
    chunks = []
    try:
        from pypdf import PdfReader
        reader = PdfReader(str(file_path))
        for idx, page in enumerate(reader.pages, 1):
            page_text = page.extract_text() or ""
            page_text = clean_text(page_text)
            if page_text:
                first_line = page_text.split("\n")[0]
                page_title = first_line[:80] if len(first_line) > 3 else f"Page {idx}"
                chunks.append({
                    "chunk_type": "page",
                    "chunk_number": idx,
                    "title": page_title,
                    "content": page_text
                })
    except Exception as e:
        # Fallback for plain text mock PDFs or damaged headers
        try:
            raw_bytes = file_path.read_bytes()
            text_candidate = raw_bytes.decode("utf-8", errors="ignore")
            cleaned = clean_text(text_candidate)
            if len(cleaned) > 20:
                chunks.append({
                    "chunk_type": "page",
                    "chunk_number": 1,
                    "title": original_filename,
                    "content": cleaned
                })
        except Exception:
            pass

    return chunks


def extract_from_text(file_path: Path, original_filename: str) -> List[Dict[str, Any]]:
    """Extracts paragraphs or sections from text/CSV files."""
    chunks = []
    try:
        content = file_path.read_text(encoding="utf-8", errors="ignore")
        sections = [s.strip() for s in content.split("\n\n") if s.strip()]
        if not sections:
            sections = [content.strip()]
        
        for idx, sec in enumerate(sections, 1):
            first_line = sec.split("\n")[0][:80]
            chunks.append({
                "chunk_type": "section",
                "chunk_number": idx,
                "title": first_line or f"Section {idx}",
                "content": clean_text(sec)
            })
    except Exception as e:
        print(f"Error reading text file {file_path.name}: {e}")
    return chunks


def extract_chunks_from_file(file_path: Path, file_extension: str, original_filename: str) -> List[Dict[str, Any]]:
    """Dispatches to the proper extractor based on extension."""
    ext = file_extension.lower()
    if ext in [".pptx", ".ppt"]:
        return extract_from_pptx(file_path, original_filename)
    elif ext == ".pdf":
        return extract_from_pdf(file_path, original_filename)
    elif ext in [".txt", ".csv"]:
        return extract_from_text(file_path, original_filename)
    return []


def index_resource_document(db: Session, resource: Resource) -> int:
    """
    Parses an uploaded resource document, extracts slides/pages,
    and indexes them into document_chunks. Returns total chunks indexed.
    """
    try:
        safe_path = get_safe_file_path(resource.file_path)
    except Exception:
        return 0

    # Clear existing chunks for this resource
    db.query(DocumentChunk).filter(DocumentChunk.resource_id == resource.id).delete()
    db.flush()

    chunks_data = extract_chunks_from_file(safe_path, resource.file_extension, resource.original_filename)
    
    indexed_count = 0
    for c in chunks_data:
        chunk = DocumentChunk(
            user_id=resource.user_id,
            course_id=resource.course_id,
            resource_id=resource.id,
            chunk_type=c["chunk_type"],
            chunk_number=c["chunk_number"],
            title=c["title"],
            content=c["content"]
        )
        db.add(chunk)
        indexed_count += 1

    db.commit()
    return indexed_count
