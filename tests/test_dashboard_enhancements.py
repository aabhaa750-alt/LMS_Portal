from datetime import datetime, timedelta
import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_auth_client(prefix="dash_student"):
    email = f"{prefix}_{datetime.utcnow().timestamp()}@mba.edu"
    password = "SecurePassword123!"
    reg_payload = {
        "email": email,
        "password": password,
        "full_name": "Aabha Agrawal",
        "program": "MBA in Technology Management",
        "academic_year": "Year 1",
        "semester": "Semester 2",
    }
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 200, res.text
    session_id = res.cookies["mylearninghub_session"]
    return client, {"mylearninghub_session": session_id}


def test_continue_learning_lifecycle():
    c, cookies = get_auth_client("continue_user")

    # 1. Fresh user dashboard should have continue_learning = None
    dash_res = c.get("/api/dashboard", cookies=cookies)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["continue_learning"] is None

    # 2. Create course and resource
    course_res = c.post(
        "/api/courses",
        json={
            "name": "Managerial Economics",
            "code": "MBA-ECON",
            "color": "#2563eb",
            "academic_year": "Year 1",
            "semester": "Semester 2"
        },
        cookies=cookies
    )
    assert course_res.status_code == 201
    course_id = course_res.json()["id"]

    # Upload test resource
    file_bytes = io.BytesIO(b"%PDF-1.4 Mock Pricing Strategy Document")
    file_bytes.name = "pricing_strategy.pdf"
    upload_res = c.post(
        "/api/resources/upload",
        data={"course_id": course_id, "title": "Pricing & Market Structures Deck"},
        files={"file": ("pricing_strategy.pdf", file_bytes, "application/pdf")},
        cookies=cookies
    )
    assert upload_res.status_code == 201
    res_id = upload_res.json()["id"]

    # 3. Record progress (page 4)
    prog_res = c.post(
        f"/api/resources/{res_id}/progress",
        json={"page_number": 4, "slide_number": 4, "position_label": "Page 4 of 28"},
        cookies=cookies
    )
    assert prog_res.status_code == 200
    prog_data = prog_res.json()
    assert prog_data["page_number"] == 4
    assert prog_data["position_label"] == "Page 4 of 28"

    # 4. Check dashboard now reflects continue_learning
    dash_res2 = c.get("/api/dashboard", cookies=cookies)
    assert dash_res2.status_code == 200
    dash_data2 = dash_res2.json()
    cl = dash_data2["continue_learning"]
    assert cl is not None
    assert cl["id"] == res_id
    assert cl["title"] == "Pricing & Market Structures Deck"
    assert cl["last_page_number"] == 4
    assert cl["last_position"] == "Page 4 of 28"
    assert "Accessed" in cl["relative_time"] or "Just now" in cl["relative_time"]


def test_daily_study_plan_generation_and_toggle():
    c, cookies = get_auth_client("plan_user")

    # 1. Create a course and incomplete unit topic
    course_res = c.post(
        "/api/courses",
        json={
            "name": "Product Strategy & Management",
            "code": "MBA-PROD",
            "color": "#7c3aed"
        },
        cookies=cookies
    )
    assert course_res.status_code == 201
    course_id = course_res.json()["id"]

    topic_res = c.post(
        f"/api/courses/{course_id}/units",
        json={
            "unit_number": 1,
            "unit_title": "Unit 1: Market Fit & Moats",
            "topic_title": "Developer Moats & Network Effects",
            "description": "Understanding switching costs in platform products."
        },
        cookies=cookies
    )
    assert topic_res.status_code == 201
    topic_id = topic_res.json()["id"]

    # 2. Create upcoming task
    due = (datetime.utcnow() + timedelta(days=3)).isoformat()
    task_res = c.post(
        "/api/tasks",
        json={
            "course_id": course_id,
            "title": "Stripe Business Model Tear-Down",
            "task_type": "Assignment",
            "due_date": due,
            "priority": "High"
        },
        cookies=cookies
    )
    assert task_res.status_code == 201
    task_id = task_res.json()["id"]

    # 3. Fetch daily study plan
    plan_res = c.get("/api/dashboard/daily-plan", cookies=cookies)
    assert plan_res.status_code == 200
    plan_data = plan_res.json()
    assert plan_data["total_items"] >= 2
    assert plan_data["completed_items"] == 0

    item_keys = [item["id"] for item in plan_data["items"]]
    assert f"topic_{topic_id}" in item_keys
    assert f"task_{task_id}" in item_keys

    # Verify item contents match stored data
    topic_item = next(it for it in plan_data["items"] if it["id"] == f"topic_{topic_id}")
    assert topic_item["subject"] == "Product Strategy & Management"
    assert "Developer Moats" in topic_item["title"]
    assert topic_item["is_completed"] is False

    # 4. Toggle completion for topic item
    toggle_res = c.post(
        "/api/dashboard/daily-plan/toggle",
        json={"item_key": f"topic_{topic_id}"},
        cookies=cookies
    )
    assert toggle_res.status_code == 200
    toggle_data = toggle_res.json()
    assert toggle_data["item_key"] == f"topic_{topic_id}"
    assert toggle_data["completed"] is True
    assert toggle_data["completed_count"] == 1

    # 5. Fetch daily plan again and verify persistence
    plan_res2 = c.get("/api/dashboard/daily-plan", cookies=cookies)
    assert plan_res2.status_code == 200
    plan_data2 = plan_res2.json()
    assert plan_data2["completed_items"] == 1
    updated_topic_item = next(it for it in plan_data2["items"] if it["id"] == f"topic_{topic_id}")
    assert updated_topic_item["is_completed"] is True

    # 6. Toggle again to unmark
    toggle_res2 = c.post(
        "/api/dashboard/daily-plan/toggle",
        json={"item_key": f"topic_{topic_id}"},
        cookies=cookies
    )
    assert toggle_res2.status_code == 200
    assert toggle_res2.json()["completed"] is False
