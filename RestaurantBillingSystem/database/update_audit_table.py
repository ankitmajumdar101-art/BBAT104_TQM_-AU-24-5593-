from database.database import get_connection


def update_audit_table():

    connection = None

    try:

        connection = get_connection()
        cursor = connection.cursor()

        # Get existing columns
        cursor.execute(
            "PRAGMA table_info(audit_logs)"
        )

        existing_columns = {
            row["name"]
            for row in cursor.fetchall()
        }

        print("Existing columns:")
        print(existing_columns)

        # Add username if missing
        if "username" not in existing_columns:

            cursor.execute(
                """
                ALTER TABLE audit_logs
                ADD COLUMN username TEXT
                """
            )

            print("Added column: username")

        # Add role if missing
        if "role" not in existing_columns:

            cursor.execute(
                """
                ALTER TABLE audit_logs
                ADD COLUMN role TEXT
                """
            )

            print("Added column: role")

        # Add action if missing
        if "action" not in existing_columns:

            cursor.execute(
                """
                ALTER TABLE audit_logs
                ADD COLUMN action TEXT
                """
            )

            print("Added column: action")

        # Add details if missing
        if "details" not in existing_columns:

            cursor.execute(
                """
                ALTER TABLE audit_logs
                ADD COLUMN details TEXT
                """
            )

            print("Added column: details")

        # Add timestamp if missing
        if "timestamp" not in existing_columns:

            cursor.execute(
                """
                ALTER TABLE audit_logs
                ADD COLUMN timestamp TEXT
                """
            )

            print("Added column: timestamp")

        connection.commit()

        print()
        print("Audit log table updated successfully.")

    except Exception as error:

        print(
            f"Database update error: {error}"
        )

    finally:

        if connection:
            connection.close()


if __name__ == "__main__":

    update_audit_table()