from database import get_connection


def check_database():
    connection = get_connection()
    cursor = connection.cursor()

    # Check tables
    cursor.execute("""
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
        ORDER BY name
    """)

    tables = cursor.fetchall()

    print("\nDatabase Tables")
    print("----------------")

    for table in tables:
        print(table["name"])

    # Check users
    cursor.execute("""
        SELECT id, username, role
        FROM users
        ORDER BY id
    """)

    users = cursor.fetchall()

    print("\nUsers")
    print("----------------")

    for user in users:
        print(
            f"ID: {user['id']} | "
            f"Username: {user['username']} | "
            f"Role: {user['role']}"
        )

    connection.close()


if __name__ == "__main__":
    check_database()