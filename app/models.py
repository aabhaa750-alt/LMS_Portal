from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    Float,
)
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    program = Column(String(150), default="Master of Business Administration (MBA)")
    academic_year = Column(String(50), default="Year 1")
    semester = Column(String(50), default="Semester 1")
    avatar_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    sessions = relationship("SessionToken", back_populates="user", cascade="all, delete-orphan")
    courses = relationship("Course", back_populates="user", cascade="all, delete-orphan")
    unit_topics = relationship("UnitTopic", back_populates="user", cascade="all, delete-orphan")
    resources = relationship("Resource", back_populates="user", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="user", cascade="all, delete-orphan")
    access_histories = relationship("AccessHistory", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("PersonalNote", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("TaskAssignment", back_populates="user", cascade="all, delete-orphan")
    study_goals = relationship("StudyGoal", back_populates="user", cascade="all, delete-orphan")


class SessionToken(Base):
    __tablename__ = "session_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String(128), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)

    user = relationship("User", back_populates="sessions")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    code = Column(String(50), nullable=True)  # e.g., MBA601
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    academic_year = Column(String(50), default="Year 1")
    semester = Column(String(50), default="Semester 1")
    instructor = Column(String(255), nullable=True)
    color = Column(String(50), default="#2563eb")  # Primary blue by default
    icon = Column(String(50), default="book-open")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="courses")
    unit_topics = relationship("UnitTopic", back_populates="course", cascade="all, delete-orphan", order_by="UnitTopic.order_index")
    resources = relationship("Resource", back_populates="course", cascade="all, delete-orphan")
    notes = relationship("PersonalNote", back_populates="course")
    tasks = relationship("TaskAssignment", back_populates="course")


class UnitTopic(Base):
    __tablename__ = "unit_topics"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    unit_number = Column(Integer, default=1)
    unit_title = Column(String(255), nullable=False)
    topic_title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="Not Started")  # "Not Started", "In Progress", "Completed"
    order_index = Column(Integer, default=0)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    course = relationship("Course", back_populates="unit_topics")
    user = relationship("User", back_populates="unit_topics")
    resources = relationship("Resource", back_populates="unit_topic")
    notes = relationship("PersonalNote", back_populates="unit_topic")


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    unit_topic_id = Column(Integer, ForeignKey("unit_topics.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    resource_type = Column(String(50), nullable=False)  # PDF, Presentation, Document, Spreadsheet, Image, Text
    file_path = Column(String(500), nullable=False)  # Relative to UPLOADS_DIR
    original_filename = Column(String(255), nullable=False)
    file_extension = Column(String(20), nullable=False)
    file_size = Column(Integer, nullable=False)  # Bytes
    mime_type = Column(String(100), nullable=True)
    file_hash = Column(String(64), nullable=True)  # SHA-256
    tags = Column(String(500), default="")  # Comma-separated tags
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="resources")
    course = relationship("Course", back_populates="resources")
    unit_topic = relationship("UnitTopic", back_populates="resources")
    bookmarks = relationship("Bookmark", back_populates="resource", cascade="all, delete-orphan")
    access_histories = relationship("AccessHistory", back_populates="resource", cascade="all, delete-orphan")
    notes = relationship("PersonalNote", back_populates="resource")


class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resource_id = Column(Integer, ForeignKey("resources.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="bookmarks")
    resource = relationship("Resource", back_populates="bookmarks")


class AccessHistory(Base):
    __tablename__ = "access_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resource_id = Column(Integer, ForeignKey("resources.id", ondelete="CASCADE"), nullable=False)
    accessed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="access_histories")
    resource = relationship("Resource", back_populates="access_histories")


class PersonalNote(Base):
    __tablename__ = "personal_notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    unit_topic_id = Column(Integer, ForeignKey("unit_topics.id", ondelete="SET NULL"), nullable=True)
    resource_id = Column(Integer, ForeignKey("resources.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    tags = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="notes")
    course = relationship("Course", back_populates="notes")
    unit_topic = relationship("UnitTopic", back_populates="notes")
    resource = relationship("Resource", back_populates="notes")


class StudyGoal(Base):
    __tablename__ = "study_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    week_identifier = Column(String(50), nullable=False)  # e.g., "2026-W44"
    target_topics = Column(Integer, default=5)
    target_hours = Column(Float, default=15.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="study_goals")


class TaskAssignment(Base):
    __tablename__ = "task_assignments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    resource_id = Column(Integer, ForeignKey("resources.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    task_type = Column(String(50), default="Assignment")  # Assignment, Project, Exam, Quiz, Reading, Revision
    due_date = Column(DateTime, nullable=False)
    priority = Column(String(20), default="Medium")  # Low, Medium, High
    status = Column(String(20), default="To Do")  # To Do, In Progress, Completed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="tasks")
    course = relationship("Course", back_populates="tasks")
