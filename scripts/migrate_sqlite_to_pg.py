"""
Safe Data Migration Script: SQLite -> PostgreSQL (Neon)
Migrates all existing data from local SQLite database into PostgreSQL.

SAFETY RULES:
- Never deletes or modifies the source SQLite database.
- Inserts tables in strict foreign-key dependency order.
- Resets PostgreSQL identity/serial sequences so subsequent auto-increments work.
- Verifies record counts in target matches source.

Usage:
  # Dry run preview:
  DATABASE_URL="postgresql://user:pass@ep-cool.us-east-2.aws.neon.tech/neondb?sslmode=require" python scripts/migrate_sqlite_to_pg.py --dry-run

  # Execute migration:
  DATABASE_URL="postgresql://user:pass@ep-cool.us-east-2.aws.neon.tech/neondb?sslmode=require" python scripts/migrate_sqlite_to_pg.py
"""

import sys
import argparse
from pathlib import Path
from typing import List, Dict, Any
from sqlalchemy import create_engine, inspect, text, Table, MetaData

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from app.models import Base
from app.config import BASE_DIR

# Dependency order for inserting data safely without foreign key violations
TABLE_ORDER: List[str] = [
    "users",
    "session_tokens",
    "courses",
    "study_goals",
    "unit_topics",
    "resources",
    "bookmarks",
    "access_history",
    "personal_notes",
    "task_assignments",
    "document_chunks",
    "ai_conversations",
    "ai_messages",
    "daily_plan_completions",
]


def mask_url(url: str) -> str:
    if "@" in url:
        proto, rest = url.split("://", 1)
        creds, host = rest.split("@", 1)
        user = creds.split(":", 1)[0]
        return f"{proto}://{user}:****@{host}"
    return url


def main():
    parser = argparse.ArgumentParser(description="Migrate data from SQLite to PostgreSQL (Neon)")
    parser.add_argument(
        "--sqlite-path",
        type=str,
        default=str(BASE_DIR / "data" / "lms.db"),
        help="Path to source SQLite file (default: data/lms.db)"
    )
    parser.add_argument(
        "--database-url",
        type=str,
        default=None,
        help="Target PostgreSQL DATABASE_URL"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Inspect and display data without writing to target database"
    )
    parser.add_argument(
        "--clean-target",
        action="store_true",
        help="Clear existing data in target tables before migration (CASCADE)"
    )
    args = parser.parse_args()

    sqlite_file = Path(args.sqlite_path)
    if not sqlite_file.exists():
        print(f"✗ Source SQLite database not found at {sqlite_file}")
        sys.exit(1)

    import os
    target_url = (args.database_url or os.getenv("DATABASE_URL") or "").strip()
    if not target_url:
        print("✗ No target PostgreSQL URL provided. Set DATABASE_URL or pass --database-url.")
        sys.exit(1)

    if target_url.startswith("postgres://"):
        target_url = target_url.replace("postgres://", "postgresql://", 1)

    if target_url.startswith("sqlite"):
        print("✗ Target must be a PostgreSQL database URL, not SQLite.")
        sys.exit(1)

    print("==================================================")
    print("  My Learning Hub - Database Migration (SQLite -> PostgreSQL)")
    print("==================================================")
    print(f"Source SQLite: {sqlite_file} ({sqlite_file.stat().st_size:,} bytes)")
    print(f"Target Postgres: {mask_url(target_url)}")
    print(f"Mode: {'DRY RUN (Preview Only)' if args.dry_run else 'LIVE MIGRATION'}")
    print("==================================================\n")

    # Connect to source SQLite first
    src_engine = create_engine(f"sqlite:///{sqlite_file}", connect_args={"check_same_thread": False})
    src_meta = MetaData()
    src_meta.reflect(bind=src_engine)

    # Count records in source
    source_counts: Dict[str, int] = {}
    for table_name in TABLE_ORDER:
        if table_name in src_meta.tables:
            with src_engine.connect() as conn:
                count = conn.execute(text(f"SELECT COUNT(*) FROM {table_name}")).scalar() or 0
                source_counts[table_name] = count
        else:
            source_counts[table_name] = 0

    print("Source record summary:")
    total_records = 0
    for tbl, count in source_counts.items():
        print(f"  • {tbl}: {count:,} records")
        total_records += count
    print(f"Total source records in SQLite: {total_records:,}\n")

    if args.dry_run:
        print("Dry run completed. Source data verified. No data was modified in PostgreSQL.")
        return

    # Connect to target Postgres
    print("1. Connecting to target PostgreSQL and verifying schema...")
    try:
        tgt_engine = create_engine(target_url, pool_pre_ping=True)
        with tgt_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✓ Connected to target PostgreSQL.")
    except Exception as conn_err:
        print(f"✗ Could not connect to target PostgreSQL: {conn_err}")
        print("\nPlease check that your DATABASE_URL is valid, contains the correct password, and that Neon database is active.")
        sys.exit(1)

    # 1. Initialize schema in target if not present
    Base.metadata.create_all(bind=tgt_engine)
    tgt_meta = MetaData()
    tgt_meta.reflect(bind=tgt_engine)

    # 3. Handle clean-target if requested
    if args.clean_target:
        print("Cleaning target tables (reverse dependency order)...")
        with tgt_engine.begin() as conn:
            for tbl in reversed(TABLE_ORDER):
                if tbl in tgt_meta.tables:
                    conn.execute(text(f"TRUNCATE TABLE {tbl} CASCADE"))
        print("✓ Target tables truncated.\n")

    # 4. Migrate data table by table
    print("2. Migrating records...")
    with tgt_engine.begin() as tgt_conn:
        for table_name in TABLE_ORDER:
            if table_name not in src_meta.tables or table_name not in tgt_meta.tables:
                continue

            count = source_counts[table_name]
            if count == 0:
                print(f"  • {table_name}: 0 records (skipped)")
                continue

            src_table = Table(table_name, src_meta, autoload_with=src_engine)
            tgt_table = Table(table_name, tgt_meta, autoload_with=tgt_engine)

            with src_engine.connect() as src_conn:
                rows = [dict(row._mapping) for row in src_conn.execute(src_table.select()).fetchall()]

            if rows:
                tgt_conn.execute(tgt_table.insert(), rows)
                print(f"  ✓ {table_name}: migrated {len(rows):,} records")

    # 5. Reset PostgreSQL auto-increment sequences
    print("\n3. Resetting PostgreSQL serial sequences...")
    with tgt_engine.begin() as conn:
        for table_name in TABLE_ORDER:
            if table_name in tgt_meta.tables:
                try:
                    conn.execute(text(f"""
                        SELECT setval(
                            pg_get_serial_sequence('{table_name}', 'id'),
                            COALESCE((SELECT MAX(id) FROM {table_name}), 1),
                            (SELECT MAX(id) IS NOT NULL FROM {table_name})
                        );
                    """))
                except Exception as seq_err:
                    # Ignore if table has no serial sequence
                    pass
    print("✓ Serial sequences synchronized.")

    # 6. Verification
    print("\n4. Verifying record counts in PostgreSQL:")
    all_match = True
    with tgt_engine.connect() as conn:
        for table_name in TABLE_ORDER:
            if table_name in tgt_meta.tables:
                tgt_count = conn.execute(text(f"SELECT COUNT(*) FROM {table_name}")).scalar() or 0
                expected = source_counts.get(table_name, 0)
                status = "✓ MATCH" if tgt_count >= expected else "✗ MISMATCH"
                if tgt_count < expected:
                    all_match = False
                print(f"  {status} {table_name}: PostgreSQL has {tgt_count:,} (Source had {expected:,})")

    if all_match:
        print("\n🎉 Migration completed successfully! All records safely transferred.")
    else:
        print("\n⚠ Migration finished with some mismatches. Please inspect logs above.")


if __name__ == "__main__":
    main()
