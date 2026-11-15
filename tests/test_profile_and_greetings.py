import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.routers.dashboard import get_greeting

client = TestClient(app)


def test_hourly_greeting_logic():
    """Verify time-based greeting logic across 24 hours."""
    # Morning: 5 AM - 11:59 AM
    assert get_greeting(5) == "Good morning"
    assert get_greeting(9) == "Good morning"
    assert get_greeting(11) == "Good morning"

    # Afternoon: 12 PM - 4:59 PM
    assert get_greeting(12) == "Good afternoon"
    assert get_greeting(14) == "Good afternoon"
    assert get_greeting(16) == "Good afternoon"

    # Evening: 5 PM - 8:59 PM
    assert get_greeting(17) == "Good evening"
    assert get_greeting(19) == "Good evening"
    assert get_greeting(20) == "Good evening"

    # Late Night / Early Morning: 9 PM - 4:59 AM
    assert get_greeting(21) == "Working late"
    assert get_greeting(23) == "Working late"
    assert get_greeting(0) == "Working late"
    assert get_greeting(3) == "Working late"
    assert get_greeting(4) == "Working late"


def test_profile_update_and_dashboard_reflection():
    """Verify that updating full_name immediately reflects in auth/me and dashboard API."""
    # 1. Update student name to a personalized identity (e.g. Rahul Sharma)
    update_res = client.put(
        "/api/auth/profile",
        json={"full_name": "Rahul Sharma", "program": "MBA Executive", "semester": "Term 2"}
    )
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["full_name"] == "Rahul Sharma"
    assert updated_data["program"] == "MBA Executive"

    # 2. Verify /api/auth/me reflects the updated name
    me_res = client.get("/api/auth/me")
    assert me_res.status_code == 200
    assert me_res.json()["full_name"] == "Rahul Sharma"

    # 3. Verify /api/dashboard returns the updated user_name
    dash_res = client.get("/api/dashboard")
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["user_name"] == "Rahul Sharma"
    assert "greeting" in dash_data
