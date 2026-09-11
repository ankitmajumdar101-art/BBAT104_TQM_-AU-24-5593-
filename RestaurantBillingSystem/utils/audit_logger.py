import sqlite3
from datetime import datetime

from database.database import get_connection


# =====================================================
# CREATE AUDIT LOG TABLE
# =====================================================

def create_audit_table():

    connection = None

    try:

        connection = get_connection()

        cursor = connection.cursor()

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                username TEXT,
                role TEXT,
                action TEXT NOT NULL,
                details TEXT,
                timestamp TEXT NOT NULL
            )
            """
        )

        connection.commit()

    except Exception as error:

        print(
            f"Audit table error: {error}"
        )

    finally:

        if connection:
            connection.close()


# =====================================================
# WRITE AUDIT LOG
# =====================================================

def log_action(
    user_id,
    username,
    role,
    action,
    details=""
):

    connection = None

    try:

        connection = get_connection()

        cursor = connection.cursor()

        timestamp = datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )

        cursor.execute(
            """
            INSERT INTO audit_logs
            (
                user_id,
                username,
                role,
                action,
                details,
                timestamp
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                username,
                role,
                action,
                details,
                timestamp
            )
        )

        connection.commit()

        return True

    except Exception as error:

        print(
            f"Audit log error: {error}"
        )

        return False

    finally:

        if connection:
            connection.close()


# =====================================================
# GET AUDIT LOGS
# =====================================================

def get_audit_logs():

    connection = None

    try:

        connection = get_connection()

        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                id,
                user_id,
                username,
                role,
                action,
                details,
                timestamp
            FROM audit_logs
            ORDER BY id DESC
            """
        )

        logs = cursor.fetchall()

        return logs

    except Exception as error:

        print(
            f"Get audit logs error: {error}"
        )

        return []

    finally:

        if connection:
            connection.close()


# =====================================================
# TEST AUDIT LOG
# =====================================================

if __name__ == "__main__":

    create_audit_table()

    print(
        "Audit log table is ready."
    )

if __name__ == "__main__":

    create_audit_table()

    result = log_action(
        1,
        "admin",
        "Admin",
        "TEST",
        "Audit log system test"
    )

    if result:
        print("Audit log saved successfully.")
    else:
        print("Audit log could not be saved.")

    print("\nAudit Logs:")

    logs = get_audit_logs()

    for log in logs:
        print(log)