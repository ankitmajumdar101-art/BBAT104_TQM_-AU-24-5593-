import sqlite3
from pathlib import Path


# Project root directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Database directory
DATABASE_DIR = BASE_DIR / "database"

# SQLite database file
DATABASE_FILE = DATABASE_DIR / "restaurant.db"


def get_connection():
    """
    Create and return a connection to the SQLite database.
    """

    DATABASE_DIR.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(DATABASE_FILE)

    # Allows us to access columns by their names
    connection.row_factory = sqlite3.Row

    # Enable foreign key support
    connection.execute("PRAGMA foreign_keys = ON")

    return connection


def create_tables():
    """
    Create all required database tables.
    """

    connection = get_connection()

    cursor = connection.cursor()

    # -------------------------------------------------
    # USERS TABLE
    # -------------------------------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('Admin', 'Cashier')),
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # -------------------------------------------------
    # MENU ITEMS TABLE
    # -------------------------------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS menu_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL CHECK(price >= 0),
            available INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # -------------------------------------------------
    # BILLS TABLE
    # -------------------------------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bill_number TEXT NOT NULL UNIQUE,
            table_number INTEGER NOT NULL,
            subtotal REAL NOT NULL CHECK(subtotal >= 0),
            tax REAL NOT NULL DEFAULT 0 CHECK(tax >= 0),
            discount REAL NOT NULL DEFAULT 0 CHECK(discount >= 0),
            total REAL NOT NULL CHECK(total >= 0),
            created_by INTEGER NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (created_by)
                REFERENCES users(id)
        )
    """)

    # -------------------------------------------------
    # BILL ITEMS TABLE
    # -------------------------------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bill_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bill_id INTEGER NOT NULL,
            menu_item_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL CHECK(quantity > 0),
            price REAL NOT NULL CHECK(price >= 0),
            subtotal REAL NOT NULL CHECK(subtotal >= 0),

            FOREIGN KEY (bill_id)
                REFERENCES bills(id)
                ON DELETE CASCADE,

            FOREIGN KEY (menu_item_id)
                REFERENCES menu_items(id)
        )
    """)

    # -------------------------------------------------
    # AUDIT LOGS TABLE
    # -------------------------------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT NOT NULL,
            description TEXT,
            timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE SET NULL
        )
    """)

    # -------------------------------------------------
    # ERROR LOGS TABLE
    # -------------------------------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS error_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            error_type TEXT NOT NULL,
            description TEXT NOT NULL,
            module TEXT,
            timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # -------------------------------------------------
    # BACKUP LOGS TABLE
    # -------------------------------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS backup_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            backup_file TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            created_by INTEGER,

            FOREIGN KEY (created_by)
                REFERENCES users(id)
                ON DELETE SET NULL
        )
    """)

    connection.commit()
    connection.close()


if __name__ == "__main__":
    create_tables()
    print("Database created successfully.")
    print(f"Database location: {DATABASE_FILE}")