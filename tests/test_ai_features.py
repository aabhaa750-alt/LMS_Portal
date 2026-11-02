from datetime import datetime
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import Resource, DocumentChunk

client = TestClient(app)


def get_auth_client(prefix="ai_student"):
    email = f"{prefix}_{datetime.utcnow().timestamp()}@university.edu"
    password = "SecurePassword123!"
    reg_payload = {
        "email": email,
        "password": password,
        "full_name": "MBA Test Scholar",
        "program": "MBA in Product Management",
        "academic_year": "Year 2",
        "semester": "Semester 3",
    }
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 200, res.text
    session_id = res.cookies["mylearninghub_session"]
    return client, {"mylearninghub_session": session_id}


def test_ai_status_and_api_key_lifecycle():
    c, cookies = get_auth_client("status_user")

    # 1. AI Status
    status_res = c.get("/api/ai/status", cookies=cookies)
    assert status_res.status_code == 200
    data = status_res.json()
    assert "openai_configured" in data
    assert "indexed_chunks_count" in data
    assert data["openai_configured"] is False

    # 2. Update API Key
    update_res = c.post(
        "/api/ai/api-key",
        json={"openai_api_key": "sk-proj-test1234567890abcdef"},
        cookies=cookies,
    )
    assert update_res.status_code == 200
    assert "updated" in update_res.json()["message"].lower()

    # 3. Check status reflects updated key
    status_res2 = c.get("/api/ai/status", cookies=cookies)
    assert status_res2.status_code == 200
    data2 = status_res2.json()
    assert data2["openai_configured"] is True
    assert "..." in data2["masked_key"] or "••••" in data2["masked_key"]

    # 4. Clear API Key
    clear_res = c.post(
        "/api/ai/api-key",
        json={"openai_api_key": None},
        cookies=cookies,
    )
    assert clear_res.status_code == 200
    status_res3 = c.get("/api/ai/status", cookies=cookies)
    assert status_res3.json()["openai_configured"] is False


def test_ai_explain_concept_5part():
    c, cookies = get_auth_client("explain_user")

    payload = {
        "concept": "Relational Databases vs NoSQL",
    }
    res = c.post("/api/ai/explain-concept", json=payload, cookies=cookies)
    assert res.status_code == 200, res.text
    data = res.json()

    assert data["concept"] == "Relational Databases vs NoSQL"
    assert len(data["simple_meaning"]) > 0
    assert len(data["mba_level_explanation"]) > 0
    assert len(data["practical_business_example"]) > 0
    assert len(data["important_terminology"]) > 0
    assert len(data["exam_and_discussion_tips"]) > 0
    assert isinstance(data["citations"], list)


def test_ai_chat_flow_and_conversations():
    c, cookies = get_auth_client("chat_user")

    # 1. Start a new chat message
    chat_payload = {
        "message": "Explain how APIs create business value in modern product management.",
        "study_mode": "learn",
    }
    res = c.post("/api/ai/chat", json=chat_payload, cookies=cookies)
    assert res.status_code == 200, res.text
    chat_data = res.json()

    assert "reply" in chat_data
    assert len(chat_data["reply"]) > 0
    assert "conversation_id" in chat_data
    conv_id = chat_data["conversation_id"]

    # 2. Follow-up in the same conversation
    follow_payload = {
        "message": "Give me a real brand example of an open API strategy.",
        "study_mode": "business",
        "conversation_id": conv_id,
    }
    res2 = c.post("/api/ai/chat", json=follow_payload, cookies=cookies)
    assert res2.status_code == 200
    assert res2.json()["conversation_id"] == conv_id

    # 3. List conversations
    list_res = c.get("/api/ai/conversations", cookies=cookies)
    assert list_res.status_code == 200
    convs = list_res.json()
    assert any(item["id"] == conv_id for item in convs)

    # 4. Get conversation detail
    detail_res = c.get(f"/api/ai/conversations/{conv_id}", cookies=cookies)
    assert detail_res.status_code == 200
    conv_detail = detail_res.json()
    assert len(conv_detail["messages"]) >= 4  # 2 user + 2 assistant messages

    # 5. Delete conversation
    del_res = c.delete(f"/api/ai/conversations/{conv_id}", cookies=cookies)
    assert del_res.status_code == 200

    # 6. Verify gone
    del_verify = c.get(f"/api/ai/conversations/{conv_id}", cookies=cookies)
    assert del_verify.status_code == 404


def test_ai_deck_notes_generation():
    c, cookies = get_auth_client("notes_user")

    # 1. Create a Course
    course_res = c.post(
        "/api/courses",
        json={
            "name": "Product Strategy & Architecture",
            "code": "MBA-TECH",
            "academic_year": "Year 2",
            "semester": "Semester 3",
        },
        cookies=cookies,
    )
    assert course_res.status_code == 201
    course_id = course_res.json()["id"]

    # 2. Upload a lecture resource file
    file_content = b"# Slide 1: Python Architecture\nPython is widely used in AI/ML services and rapid backend prototyping.\n\n# Slide 2: APIs & Microservices\nREST APIs decouple client applications from database backends with standard HTTP verbs."
    upload_res = c.post(
        "/api/resources/upload",
        data={
            "course_id": course_id,
            "title": "Technical Architecture Guide",
            "description": "Lecture slides on system architecture and Python stacks",
            "tags": "python, apis, architecture",
        },
        files={
            "file": ("tech_architecture.txt", file_content, "text/plain")
        },
        cookies=cookies,
    )
    assert upload_res.status_code == 201
    res_id = upload_res.json()["id"]

    # 3. Generate study notes from deck
    gen_res = c.post(f"/api/ai/generate-notes/{res_id}?save_as_note=true", cookies=cookies)
    assert gen_res.status_code == 200, gen_res.text
    data = gen_res.json()
    assert "study_notes" in data
    assert data["note_id"] is not None

    # 4. Verify chunks endpoint
    chunks_res = c.get(f"/api/ai/resource-chunks/{res_id}", cookies=cookies)
    assert chunks_res.status_code == 200
    chunks = chunks_res.json()
    assert len(chunks) > 0
    assert "content" in chunks[0]

