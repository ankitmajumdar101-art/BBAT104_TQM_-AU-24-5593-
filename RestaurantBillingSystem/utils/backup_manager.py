import sqlite3
from pathlib import Path
from datetime import datetime

from database.database import get_connection
from utils.audit_logger import log_action


# -------------------------------------------------
# DATABASE AND BACKUP PATHS
# -------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

DATABASE_FILE = BASE_DIR / "database" / "restaurant.db"

BACKUP_DIR = BASE_DIR / "backups"


# -------------------------------------------------
# CREATE DATABASE BACKUP
# -------------------------------------------------

def create_backup(user_id=None, username="System", role="System"):

    source_connection = None
    backup_connection = None
    log_connection = None

    try:

        # Create backups folder automatically
        BACKUP_DIR.mkdir(
            parents=True,
            exist_ok=True
        )

        # Create unique backup filename
        timestamp = datetime.now().strftime(
            "%Y%m%d_%H%M%S"
        )

        backup_filename = (
            f"restaurant_backup_{timestamp}.db"
        )

        backup_path = BACKUP_DIR / backup_filename

        # Open original database
        source_connection = sqlite3.connect(
            DATABASE_FILE
        )

        # Open new backup database
        backup_connection = sqlite3.connect(
            backup_path
        )

        # SQLite safe backup
        source_connection.backup(
            backup_connection
        )

        backup_connection.close()
        backup_connection = None

        source_connection.close()
        source_connection = None

        # -------------------------------------------------
        # SAVE BACKUP INFORMATION IN DATABASE
        # -------------------------------------------------

        log_connection = get_connection()

        cursor = log_connection.cursor()

        cursor.execute(
            """
            INSERT INTO backup_logs
            (backup_file, created_by)
            VALUES (?, ?)
            """,
            (
                str(backup_path),
                user_id
            )
        )

        log_connection.commit()

        # -------------------------------------------------
        # AUDIT LOG
        # -------------------------------------------------

        log_action(
            user_id,
            username,
            role,
            "BACKUP",
            f"Database backup created: {backup_filename}"
        )

        print(
            f"Backup created successfully: {backup_path}"
        )

        return True

    except Exception as error:

        print(
            f"Backup error: {error}"
        )

        return False

    finally:

        if backup_connection:
            backup_connection.close()

        if source_connection:
            source_connection.close()

        if log_connection:
            log_connection.close()


# -------------------------------------------------
# GET BACKUP HISTORY
# -------------------------------------------------

def get_backup_logs():

    connection = None

    try:

        connection = get_connection()

        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                id,
                backup_file,
                created_at,
                created_by
            FROM backup_logs
            ORDER BY id DESC
            """
        )

        return cursor.fetchall()

    except Exception as error:

        print(
            f"Get backup logs error: {error}"
        )

        return []

    finally:

        if connection:
            connection.close()


# -------------------------------------------------
# TEST BACKUP
# -------------------------------------------------

if __name__ == "__main__":

    result = create_backup(
        1,
        "admin",
        "Admin"
    )

    if result:
        print(
            "Backup test completed successfully."
        )
    else:
        print(
            "Backup test failed."
        )