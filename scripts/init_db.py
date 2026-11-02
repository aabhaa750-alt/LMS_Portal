"""
Database Initialization Script for My Learning Hub.
Supports initializing schema on both PostgreSQL (e.g. Neon) and SQLite.

Usage:
  # Using DATABASE_URL from environment:
  DATABASE_URL="postgresql://user:pass@ep-cool.us-east-2.aws.neon.tech/neondb?sslmode=require" python scripts/init_db.py

  # Or passing as an argument:
  python scripts/init_db.py --database-url "postgresql://user:pass@ep-cool.us-east-2.aws.neon.tech/neondb?sslmode=require"
"""

import sys
import argparse
from pathlib import Path
from sqlalchemy import create_engine, inspect, text

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from app.models import Base
from app.config import DATABASE_URL as DEFAULT_DB_URL, IS_SQLITE


def main():
    parser = argparse.ArgumentParser(description="Initialize database tables for My Learning Hub")
    parser.add_argument(
        "--database-url",
        type=str,
        default=None,
        help="Target database connection URL (defaults to DATABASE_URL environment variable or local SQLite)"
    )
    args = parser.parse_args()

    target_url = (args.database_url or DEFAULT_DB_URL).strip()
    if target_url.startswith("postgres://"):
        target_url = target_url.replace("postgres://", "postgresql://", 1)

    is_sqlite_target = target_url.startswith("sqlite")
    masked_url = target_url
    if "@" in masked_url and not is_sqlite_target:
        # Mask password in logs
        protocol, rest = masked_url.split("://", 1)
        creds, host = rest.split("@", 1)
        if ":" in creds:
            user = creds.split(":", 1)[0]
            masked_url = f"{protocol}://{user}:****@{host}"

    print(f"Connecting to target database ({'SQLite' if is_sqlite_target else 'PostgreSQL'})...")
    print(f"URL: {masked_url}")

    connect_args = {"check_same_thread": False} if is_sqlite_target else {}
    engine = create_engine(target_url, connect_args=connect_args)

    # Test connectivity
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✓ Database connection successful.")
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        sys.exit(1)

    print("Creating all database tables defined in models...")
    Base.metadata.create_all(bind=engine)

    # Verify tables
    inspector = inspect(engine)
    created_tables = inspector.get_table_names()
    print(f"✓ Found {len(created_tables)} tables in database:")
    for tbl in sorted(created_tables):
        print(f"  - {tbl}")

    expected_tables = {
        "users", "session_tokens", "courses", "unit_topics", "resources",
        "bookmarks", "access_history", "personal_notes", "study_goals",
        "task_assignments", "document_chunks", "ai_conversations",
        "ai_messages", "daily_plan_completions"
    }

    missing = expected_tables - set(created_tables)
    if missing:
        print(f"✗ Warning: Missing expected tables: {missing}")
        sys.exit(1)
    else:
        print("\nAll required tables are verified and ready for production!")


if __name__ == "__main__":
    main()
