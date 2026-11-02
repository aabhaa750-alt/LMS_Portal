from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import DATABASE_URL, IS_SQLITE

if IS_SQLITE:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True,
    )

    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
else:
    # PostgreSQL / Neon configuration with pre-ping and recycling for serverless resilience
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=5,
        max_overflow=10,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def check_db_connection() -> dict:
    """Tests the database connection and returns status information."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {
            "connected": True,
            "engine": "sqlite" if IS_SQLITE else "postgresql",
        }
    except Exception as e:
        return {
            "connected": False,
            "engine": "sqlite" if IS_SQLITE else "postgresql",
            "error": f"{type(e).__name__}: {str(e)}",
        }

def ensure_schema_compatibility():
    """Safely adds any newly defined columns and tables to existing database without breaking data."""
    if not IS_SQLITE:
        return

    try:
        with engine.connect() as conn:
            # Check users table columns
            user_cols = {row[1] for row in conn.exec_driver_sql("PRAGMA table_info(users)").fetchall()}
            if user_cols:
                if "openai_api_key" not in user_cols:
                    conn.exec_driver_sql("ALTER TABLE users ADD COLUMN openai_api_key VARCHAR(255)")
                if "ai_provider" not in user_cols:
                    conn.exec_driver_sql("ALTER TABLE users ADD COLUMN ai_provider VARCHAR(50) DEFAULT 'openai'")

            # Check resources table columns
            res_cols = {row[1] for row in conn.exec_driver_sql("PRAGMA table_info(resources)").fetchall()}
            if res_cols:
                if "last_accessed_at" not in res_cols:
                    conn.exec_driver_sql("ALTER TABLE resources ADD COLUMN last_accessed_at DATETIME")
                if "last_page_number" not in res_cols:
                    conn.exec_driver_sql("ALTER TABLE resources ADD COLUMN last_page_number INTEGER DEFAULT 1")
                if "last_slide_number" not in res_cols:
                    conn.exec_driver_sql("ALTER TABLE resources ADD COLUMN last_slide_number INTEGER DEFAULT 1")
                if "last_position_label" not in res_cols:
                    conn.exec_driver_sql("ALTER TABLE resources ADD COLUMN last_position_label VARCHAR(100)")

            # Check access_history table columns
            access_cols = {row[1] for row in conn.exec_driver_sql("PRAGMA table_info(access_history)").fetchall()}
            if access_cols:
                if "page_number" not in access_cols:
                    conn.exec_driver_sql("ALTER TABLE access_history ADD COLUMN page_number INTEGER DEFAULT 1")
                if "slide_number" not in access_cols:
                    conn.exec_driver_sql("ALTER TABLE access_history ADD COLUMN slide_number INTEGER DEFAULT 1")
                if "position_label" not in access_cols:
                    conn.exec_driver_sql("ALTER TABLE access_history ADD COLUMN position_label VARCHAR(100)")

            # Ensure daily_plan_completions table exists
            conn.exec_driver_sql("""
                CREATE TABLE IF NOT EXISTS daily_plan_completions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    plan_date VARCHAR(10) NOT NULL,
                    item_key VARCHAR(255) NOT NULL,
                    completed BOOLEAN DEFAULT 1,
                    completed_at DATETIME
                )
            """)
            conn.commit()
    except Exception as e:
        print(f"Warning during ensure_schema_compatibility: {e}")

def init_db():
    Base.metadata.create_all(bind=engine)
    ensure_schema_compatibility()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

