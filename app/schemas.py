from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# User & Auth
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    program: Optional[str] = "Master of Business Administration (MBA)"
    academic_year: Optional[str] = "Year 1"
    semester: Optional[str] = "Semester 1"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    program: Optional[str] = None
    academic_year: Optional[str] = None
    semester: Optional[str] = None
    avatar_url: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    program: str
    academic_year: str
    semester: str
    avatar_url: Optional[str] = None
    created_at: datetime


# Course & Topics
class UnitTopicCreate(BaseModel):
    course_id: Optional[int] = None
    unit_number: int = 1
    unit_title: str
    topic_title: str
    description: Optional[str] = None
    status: str = "Not Started"
    order_index: int = 0


class UnitTopicUpdate(BaseModel):
    unit_number: Optional[int] = None
    unit_title: Optional[str] = None
    topic_title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    order_index: Optional[int] = None


class UnitTopicStatusUpdate(BaseModel):
    status: str  # "Not Started", "In Progress", "Completed"


class UnitTopicOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    course_id: int
    unit_number: int
    unit_title: str
    topic_title: str
    description: Optional[str] = None
    status: str
    order_index: int
    completed_at: Optional[datetime] = None
    created_at: datetime


class CourseCreate(BaseModel):
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    academic_year: str = "Year 1"
    semester: str = "Semester 1"
    instructor: Optional[str] = None
    color: Optional[str] = "#2563eb"
    icon: Optional[str] = "book-open"


class CourseUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    academic_year: Optional[str] = None
    semester: Optional[str] = None
    instructor: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None


class CourseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    academic_year: str
    semester: str
    instructor: Optional[str] = None
    color: str
    icon: str
    resource_count: int = 0
    total_topics: int = 0
    completed_topics: int = 0
    progress_pct: float = 0.0
    created_at: datetime


class CourseDetailOut(CourseOut):
    unit_topics: List[UnitTopicOut] = []


# Resources
class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    course_id: Optional[int] = None
    unit_topic_id: Optional[int] = None
    tags: Optional[str] = None
    is_completed: Optional[bool] = None


class ResourceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    course_id: int
    course_name: Optional[str] = None
    course_code: Optional[str] = None
    course_color: Optional[str] = None
    unit_topic_id: Optional[int] = None
    unit_title: Optional[str] = None
    topic_title: Optional[str] = None
    title: str
    description: Optional[str] = None
    resource_type: str
    original_filename: str
    file_extension: str
    file_size: int
    mime_type: Optional[str] = None
    tags: str
    is_completed: bool
    is_bookmarked: bool = False
    last_accessed_at: Optional[datetime] = None
    last_page_number: Optional[int] = 1
    last_slide_number: Optional[int] = 1
    last_position_label: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# Notes
class NoteCreate(BaseModel):
    title: str
    content: str
    course_id: Optional[int] = None
    unit_topic_id: Optional[int] = None
    resource_id: Optional[int] = None
    tags: Optional[str] = ""


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    course_id: Optional[int] = None
    unit_topic_id: Optional[int] = None
    resource_id: Optional[int] = None
    tags: Optional[str] = None


class NoteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    course_id: Optional[int] = None
    course_name: Optional[str] = None
    unit_topic_id: Optional[int] = None
    topic_title: Optional[str] = None
    resource_id: Optional[int] = None
    resource_title: Optional[str] = None
    title: str
    content: str
    tags: str
    created_at: datetime
    updated_at: datetime


# Tasks / Assignments
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    course_id: Optional[int] = None
    resource_id: Optional[int] = None
    task_type: str = "Assignment"
    due_date: datetime
    priority: str = "Medium"
    status: str = "To Do"


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    course_id: Optional[int] = None
    resource_id: Optional[int] = None
    task_type: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    status: Optional[str] = None


class TaskStatusUpdate(BaseModel):
    status: str


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    course_id: Optional[int] = None
    course_name: Optional[str] = None
    course_color: Optional[str] = None
    resource_id: Optional[int] = None
    resource_title: Optional[str] = None
    title: str
    description: Optional[str] = None
    task_type: str
    due_date: datetime
    priority: str
    status: str
    is_overdue: bool = False
    created_at: datetime
    updated_at: datetime


# Study Goals
class StudyGoalCreate(BaseModel):
    week_identifier: str
    target_topics: int = 5
    target_hours: float = 15.0
    notes: Optional[str] = None


class StudyGoalUpdate(BaseModel):
    target_topics: Optional[int] = None
    target_hours: Optional[float] = None
    notes: Optional[str] = None


class StudyGoalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    week_identifier: str
    target_topics: int
    target_hours: float
    notes: Optional[str] = None
    completed_topics_this_week: int = 0
    progress_pct: float = 0.0


# Global Search Result
class SearchResultItem(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    course_name: str
    topic_title: Optional[str] = None
    resource_type: str
    original_filename: str
    file_size: int
    tags: str
    is_bookmarked: bool = False
    created_at: datetime


# Continue Learning
class ContinueLearningOut(BaseModel):
    id: int
    title: str
    resource_type: str
    course_id: int
    course_name: str
    course_code: Optional[str] = None
    course_color: Optional[str] = "#2563eb"
    last_page_number: Optional[int] = 1
    last_slide_number: Optional[int] = 1
    last_position: Optional[str] = "Slide 1"
    last_accessed_at: Optional[datetime] = None
    relative_time: Optional[str] = None


# Daily Study Plan
class DailyPlanItemOut(BaseModel):
    id: str  # "topic_1", "task_2", "resource_3", "note_4"
    type: str  # "topic", "task", "resource", "note"
    subject: str
    subject_color: Optional[str] = "#2563eb"
    title: str
    activity: str
    estimated_duration: str
    action_type: str  # "open_reader", "open_course", "open_tasks", "open_notes", "explain_concept"
    action_label: str
    target_id: Optional[int] = None
    concept_name: Optional[str] = None
    is_completed: bool = False


class DailyPlanOut(BaseModel):
    date: str
    total_items: int
    completed_items: int
    progress_pct: float
    items: List[DailyPlanItemOut]


class DailyPlanToggleIn(BaseModel):
    item_key: str
    plan_date: Optional[str] = None
    completed: Optional[bool] = None


class ProgressUpdateIn(BaseModel):
    page_number: Optional[int] = 1
    slide_number: Optional[int] = 1
    position_label: Optional[str] = None


# Dashboard Stats
class DashboardStatsOut(BaseModel):
    greeting: str
    user_name: str
    program: str
    academic_year: str
    semester: str
    total_courses: int
    total_resources: int
    completed_topics: int
    total_topics: int
    overall_progress_pct: float
    recent_resources: List[ResourceOut]
    recent_accessed: List[ResourceOut]
    bookmarked_resources: List[ResourceOut]
    upcoming_tasks: List[TaskOut]
    study_goal: Optional[StudyGoalOut] = None
    continue_learning: Optional[ContinueLearningOut] = None


# AI Learning Assistant Schemas
class AiChatRequest(BaseModel):
    prompt: Optional[str] = None
    message: Optional[str] = None
    mode: Optional[str] = "learn"
    study_mode: Optional[str] = None
    course_id: Optional[int] = None
    resource_id: Optional[int] = None
    conversation_id: Optional[int] = None


class AiChatResponse(BaseModel):
    conversation_id: int
    message_id: int
    response: str
    reply: Optional[str] = None
    sources: List[dict] = []
    citations: List[str] = []
    provider: str
    mode: str
    is_configured: bool


class AiExplainRequest(BaseModel):
    concept: str
    course_id: Optional[int] = None
    resource_id: Optional[int] = None


class AiKeyUpdateRequest(BaseModel):
    openai_api_key: Optional[str] = None
    ai_provider: Optional[str] = "openai"


class DocumentChunkOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    resource_id: int
    chunk_type: str
    chunk_number: int
    slide_number: Optional[int] = None
    title: Optional[str] = None
    section_title: Optional[str] = None
    content: str
    token_count: Optional[int] = 0
    created_at: datetime

