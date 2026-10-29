import io
import zipfile
from datetime import datetime, timedelta
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_auth_flows():
    email = f"mba_student_{datetime.utcnow().timestamp()}@university.edu"
    password = "SecurePassword123!"

    # 1. Register
    reg_payload = {
        "email": email,
        "password": password,
        "full_name": "Aabha Agrawal",
        "program": "Master of Business Administration (MBA)",
        "academic_year": "Year 1",
        "semester": "Semester 1",
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 200, reg_res.text
    user_data = reg_res.json()
    assert user_data["email"] == email
    assert user_data["full_name"] == "Aabha Agrawal"
    assert "id" in user_data

    # Session cookie should be set
    assert "mylearninghub_session" in reg_res.cookies

    # 2. Get current user
    me_res = client.get("/api/auth/me", cookies=reg_res.cookies)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == email

    # 3. Update Profile
    update_res = client.put(
        "/api/auth/profile",
        json={"full_name": "Aabha Agrawal, MBA", "semester": "Semester 2"},
        cookies=reg_res.cookies,
    )
    assert update_res.status_code == 200
    assert update_res.json()["full_name"] == "Aabha Agrawal, MBA"
    assert update_res.json()["semester"] == "Semester 2"

    # 4. Logout
    logout_res = client.post("/api/auth/logout", cookies=reg_res.cookies)
    assert logout_res.status_code == 200

    # 5. Accessing protected endpoint without cookie should fail
    unauth_res = client.get("/api/auth/me")
    assert unauth_res.status_code == 401

    # 6. Login back
    login_res = client.post("/api/auth/login", json={"email": email, "password": password})
    assert login_res.status_code == 200
    assert "mylearninghub_session" in login_res.cookies


def test_course_and_resource_lifecycle():
    # Setup test user
    email = f"curriculum_user_{datetime.utcnow().timestamp()}@mba.edu"
    reg_res = client.post("/api/auth/register", json={
        "email": email,
        "password": "Password123!",
        "full_name": "Curriculum Tester",
        "program": "MBA",
    })
    cookies = reg_res.cookies

    # 1. Create Course
    course_payload = {
        "name": "Managerial Economics & Strategy",
        "code": "MBA601",
        "description": "Core microeconomic and game-theoretic framework course.",
        "instructor": "Prof. Henderson",
        "academic_year": "Year 1",
        "semester": "Semester 1",
        "color": "#2563eb",
    }
    course_res = client.post("/api/courses", json=course_payload, cookies=cookies)
    assert course_res.status_code == 201
    course = course_res.json()
    course_id = course["id"]
    assert course["name"] == course_payload["name"]
    assert course["resource_count"] == 0
    assert course["completed_topics"] == 0

    # 2. Add Unit and Topics
    topic1_res = client.post(f"/api/courses/{course_id}/units", json={
        "unit_number": 1,
        "unit_title": "Unit 1: Microeconomic Foundations",
        "topic_title": "Demand Elasticity & Consumer Surplus",
        "status": "In Progress"
    }, cookies=cookies)
    assert topic1_res.status_code == 201
    topic1 = topic1_res.json()
    topic1_id = topic1["id"]

    topic2_res = client.post(f"/api/courses/{course_id}/units", json={
        "unit_number": 1,
        "unit_title": "Unit 1: Microeconomic Foundations",
        "topic_title": "Oligopoly & Cournot Duopoly Competition",
        "status": "Not Started"
    }, cookies=cookies)
    assert topic2_res.status_code == 201
    topic2_id = topic2_res.json()["id"]

    # 3. Verify Course Detail & Progress
    c_detail_res = client.get(f"/api/courses/{course_id}", cookies=cookies)
    assert c_detail_res.status_code == 200
    c_detail = c_detail_res.json()
    assert len(c_detail["unit_topics"]) == 2
    assert c_detail["total_topics"] == 2
    assert c_detail["completed_topics"] == 0
    assert c_detail["progress_pct"] == 0.0

    # 4. Mark topic 1 as Completed
    status_update_res = client.patch(
        f"/api/courses/units/{topic1_id}/status",
        json={"status": "Completed"},
        cookies=cookies
    )
    assert status_update_res.status_code == 200
    assert status_update_res.json()["status"] == "Completed"

    # Re-verify course progress
    c_detail_res2 = client.get(f"/api/courses/{course_id}", cookies=cookies)
    assert c_detail_res2.json()["completed_topics"] == 1
    assert c_detail_res2.json()["progress_pct"] == 50.0

    # 5. Upload File (PDF)
    pdf_content = b"%PDF-1.4 Mock PDF Content for MBA Case Study on Pricing Strategy"
    upload_res = client.post(
        "/api/resources/upload",
        data={
            "course_id": course_id,
            "unit_topic_id": topic1_id,
            "title": "Airline Dynamic Pricing Case Study",
            "description": "HBS Case Study on revenue management.",
            "tags": "case-study, pricing, midterms",
        },
        files={"file": ("case_study.pdf", pdf_content, "application/pdf")},
        cookies=cookies
    )
    assert upload_res.status_code == 201, upload_res.text
    resource = upload_res.json()
    resource_id = resource["id"]
    assert resource["resource_type"] == "PDF"
    assert resource["file_size"] == len(pdf_content)

    # 6. Test Duplicate Upload Detection (same file in same course)
    dup_res = client.post(
        "/api/resources/upload",
        data={"course_id": course_id, "title": "Duplicate File Attempt"},
        files={"file": ("case_study_duplicate.pdf", pdf_content, "application/pdf")},
        cookies=cookies
    )
    assert dup_res.status_code == 409  # Conflict - Duplicate caught
    assert "Duplicate file" in dup_res.json()["detail"]

    # 7. Download Resource
    dl_res = client.get(f"/api/resources/{resource_id}/download", cookies=cookies)
    assert dl_res.status_code == 200
    assert dl_res.content == pdf_content

    # 8. View Resource (in-browser stream)
    view_res = client.get(f"/api/resources/{resource_id}/view", cookies=cookies)
    assert view_res.status_code == 200
    assert view_res.headers["content-type"] == "application/pdf"

    # 9. Toggle Bookmark
    bm_res = client.post(f"/api/bookmarks/{resource_id}", cookies=cookies)
    assert bm_res.status_code == 200
    assert bm_res.json()["bookmarked"] is True

    bm_list_res = client.get("/api/bookmarks", cookies=cookies)
    assert len(bm_list_res.json()) == 1
    assert bm_list_res.json()[0]["id"] == resource_id

    # 10. Create Linked Personal Note
    note_payload = {
        "title": "Key Notes on Airline Pricing Mechanics",
        "content": "Price elasticity shifts with booking lead time. Peak vs off-peak flight yield curves.",
        "course_id": course_id,
        "unit_topic_id": topic1_id,
        "resource_id": resource_id,
        "tags": "revision, formula, notes",
    }
    note_res = client.post("/api/notes", json=note_payload, cookies=cookies)
    assert note_res.status_code == 201
    note = note_res.json()
    assert note["resource_id"] == resource_id

    # Search notes
    search_notes_res = client.get("/api/notes?search=elasticity", cookies=cookies)
    assert len(search_notes_res.json()) >= 1

    # 11. Create Task / Deadline
    due_date = (datetime.utcnow() + timedelta(days=3)).isoformat()
    task_res = client.post("/api/tasks", json={
        "title": "Submit Airline Pricing Case Analysis",
        "course_id": course_id,
        "due_date": due_date,
        "priority": "High",
        "task_type": "Assignment",
        "status": "In Progress"
    }, cookies=cookies)
    assert task_res.status_code == 201
    task = task_res.json()
    assert task["priority"] == "High"
    assert task["is_overdue"] is False

    # 12. Dashboard Verification
    dash_res = client.get("/api/dashboard", cookies=cookies)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["total_courses"] == 1
    assert dash_data["total_resources"] == 1
    assert dash_data["completed_topics"] == 1
    assert dash_data["total_topics"] == 2
    assert dash_data["overall_progress_pct"] == 50.0
    assert len(dash_data["recent_resources"]) == 1
    assert len(dash_data["recent_accessed"]) >= 1  # From download / view calls
    assert len(dash_data["bookmarked_resources"]) == 1
    assert len(dash_data["upcoming_tasks"]) == 1

    # 13. System Backup Verification
    backup_res = client.get("/api/system/backup", cookies=cookies)
    assert backup_res.status_code == 200
    assert backup_res.headers["content-type"] == "application/zip"

    # Verify backup contains sqlite db and uploaded file
    with zipfile.ZipFile(io.BytesIO(backup_res.content), "r") as z:
        names = z.namelist()
        assert any(n.startswith("database/") for n in names)
        assert any(n.startswith("uploads/") for n in names)

    # 14. Delete Resource Cleanup
    del_res = client.delete(f"/api/resources/{resource_id}", cookies=cookies)
    assert del_res.status_code == 200
    # Verify file is deleted
    res_check = client.get(f"/api/resources/{resource_id}", cookies=cookies)
    assert res_check.status_code == 404


def test_user_data_isolation():
    # User 1
    u1 = client.post("/api/auth/register", json={
        "email": f"user1_{datetime.utcnow().timestamp()}@mba.edu",
        "password": "Password123!",
        "full_name": "Student One",
    }).cookies

    # User 2
    u2 = client.post("/api/auth/register", json={
        "email": f"user2_{datetime.utcnow().timestamp()}@mba.edu",
        "password": "Password123!",
        "full_name": "Student Two",
    }).cookies

    # User 1 creates a course
    c1 = client.post("/api/courses", json={"name": "Confidential Research"}, cookies=u1).json()

    # User 2 should NOT see User 1's course
    u2_courses = client.get("/api/courses", cookies=u2).json()
    assert not any(c["id"] == c1["id"] for c in u2_courses)

    # User 2 cannot access or delete User 1's course
    del_forbidden = client.delete(f"/api/courses/{c1['id']}", cookies=u2)
    assert del_forbidden.status_code == 404
