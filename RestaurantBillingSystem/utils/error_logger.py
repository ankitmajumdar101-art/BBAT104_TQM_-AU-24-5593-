from datetime import datetime

from database.database import get_connection
from utils.audit_logger import log_action


def log_error(
    user_id=None,
    username="System",
    role="System",
    error_type="ERROR",
    description="",
    module="Unknown"
):
    connection = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        cursor.execute(
            """
            INSERT INTO error_logs
            (
                error_type,
                description,
                module,
                timestamp
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                error_type,
                description,
                module,
                timestamp
            )
        )

        connection.commit()

        # Record the error in the audit log as well
        log_action(
            user_id,
            username,
            role,
            "ERROR",
            f"{error_type}: {description} | Module: {module}"
        )

        return True

    except Exception as error:
        print(f"Error logger failed: {error}")
        return False

    finally:
        if connection:
            connection.close()


def get_error_logs():

    connection = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                id,
                error_type,
                description,
                module,
                timestamp
            FROM error_logs
            ORDER BY id DESC
            """
        )

        return cursor.fetchall()

    except Exception as error:
        print(f"Get error logs error: {error}")
        return []

    finally:
        if connection:
            connection.close()


if __name__ == "__main__":

    result = log_error(
        user_id=1,
        username="admin",
        role="Admin",
        error_type="TEST_ERROR",
        description="Error recovery system test",
        module="Error Logger"
    )

    if result:
        print("Error log test completed successfully.")
    else:
        print("Error log test failed.")

    print("\nError Logs:")

    logs = get_error_logs()

    for log in logs:
        print(dict(log))