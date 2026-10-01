import tkinter as tk
from tkinter import ttk, messagebox

from database.database import get_connection
from utils.audit_logger import log_action


# =========================================================
# RESTAURANT BILLING SYSTEM COLOR THEME
# =========================================================

BURGUNDY = "#730F19"
DARK_BURGUNDY = "#4A0004"
CREAM = "#F6E0B4"
GOLD = "#F4C266"
DARK_BROWN = "#6B1418"
WHITE_CREAM = "#FFF8E8"


class UserManagementWindow:

    def __init__(self, root, user):

        self.root = root
        self.user = user

        self.root.title("Restaurant Billing System - User Management")
        self.root.geometry("950x600")
        self.root.resizable(False, False)
        self.root.configure(bg=CREAM)

        # -------------------------------------------------
        # ADMIN SECURITY CHECK
        # -------------------------------------------------

        if self.user["role"] != "Admin":

            messagebox.showerror(
                "Access Denied",
                "Only Admin users can access User Management."
            )

            self.root.destroy()
            return

        self.create_interface()
        self.load_users()

    # =====================================================
    # CREATE INTERFACE
    # =====================================================

    def create_interface(self):

        # -------------------------------------------------
        # HEADER
        # -------------------------------------------------

        header = tk.Frame(
            self.root,
            bg=DARK_BURGUNDY,
            height=80
        )

        header.pack(fill="x")
        header.pack_propagate(False)

        tk.Label(
            header,
            text="User Management",
            bg=DARK_BURGUNDY,
            fg=GOLD,
            font=("Arial", 22, "bold")
        ).pack(side="left", padx=25)

        tk.Label(
            header,
            text=f"Admin: {self.user['username']}",
            bg=DARK_BURGUNDY,
            fg=WHITE_CREAM,
            font=("Arial", 11, "bold")
        ).pack(side="right", padx=25)

        # -------------------------------------------------
        # USER TABLE
        # -------------------------------------------------

        table_frame = tk.LabelFrame(
            self.root,
            text="System Users",
            bg=CREAM,
            fg=DARK_BROWN,
            font=("Arial", 12, "bold")
        )

        table_frame.pack(
            fill="both",
            expand=True,
            padx=25,
            pady=(20, 10)
        )

        columns = (
            "id",
            "username",
            "role",
            "created_at"
        )

        self.user_table = ttk.Treeview(
            table_frame,
            columns=columns,
            show="headings",
            height=15
        )

        self.user_table.heading(
            "id",
            text="ID"
        )

        self.user_table.heading(
            "username",
            text="Username"
        )

        self.user_table.heading(
            "role",
            text="Role"
        )

        self.user_table.heading(
            "created_at",
            text="Created At"
        )

        self.user_table.column(
            "id",
            width=70,
            anchor="center"
        )

        self.user_table.column(
            "username",
            width=220
        )

        self.user_table.column(
            "role",
            width=150,
            anchor="center"
        )

        self.user_table.column(
            "created_at",
            width=250,
            anchor="center"
        )

        scrollbar = ttk.Scrollbar(
            table_frame,
            orient="vertical",
            command=self.user_table.yview
        )

        self.user_table.configure(
            yscrollcommand=scrollbar.set
        )

        self.user_table.pack(
            side="left",
            fill="both",
            expand=True,
            padx=(10, 0),
            pady=10
        )

        scrollbar.pack(
            side="right",
            fill="y",
            pady=10,
            padx=(0, 10)
        )

        # -------------------------------------------------
        # BUTTON AREA
        # -------------------------------------------------

        button_frame = tk.Frame(
            self.root,
            bg=CREAM
        )

        button_frame.pack(
            fill="x",
            padx=25,
            pady=10
        )

        self.create_button(
            button_frame,
            "Add User",
            self.add_user
        )

        self.create_button(
            button_frame,
            "Change Role",
            self.change_role
        )

        self.create_button(
            button_frame,
            "Delete User",
            self.delete_user
        )

        self.create_button(
            button_frame,
            "Refresh",
            self.load_users
        )

        tk.Button(
            button_frame,
            text="Close",
            width=15,
            bg=DARK_BURGUNDY,
            fg=GOLD,
            activebackground=BURGUNDY,
            activeforeground=GOLD,
            font=("Arial", 10, "bold"),
            cursor="hand2",
            command=self.root.destroy
        ).pack(
            side="right",
            padx=5
        )

    # =====================================================
    # BUTTON HELPER
    # =====================================================

    def create_button(
        self,
        parent,
        text,
        command
    ):

        tk.Button(
            parent,
            text=text,
            width=15,
            bg=BURGUNDY,
            fg=GOLD,
            activebackground=DARK_BURGUNDY,
            activeforeground=GOLD,
            font=("Arial", 10, "bold"),
            cursor="hand2",
            command=command
        ).pack(
            side="left",
            padx=5
        )

    # =====================================================
    # LOAD USERS
    # =====================================================

    def load_users(self):

        if not hasattr(self, "user_table"):
            return

        for item in self.user_table.get_children():
            self.user_table.delete(item)

        connection = None

        try:

            connection = get_connection()

            cursor = connection.cursor()

            cursor.execute(
                """
                SELECT id, username, role, created_at
                FROM users
                ORDER BY id
                """
            )

            users = cursor.fetchall()

            for user in users:

                self.user_table.insert(
                    "",
                    "end",
                    values=(
                        user["id"],
                        user["username"],
                        user["role"],
                        user["created_at"]
                    )
                )

        except Exception as error:

            messagebox.showerror(
                "Database Error",
                "Unable to load users."
            )

            print(f"User loading error: {error}")

        finally:

            if connection:
                connection.close()

    # =====================================================
    # ADD USER
    # =====================================================

    def add_user(self):

        dialog = tk.Toplevel(self.root)

        dialog.title("Add User")
        dialog.geometry("420x330")
        dialog.resizable(False, False)
        dialog.configure(bg=CREAM)

        dialog.transient(self.root)
        dialog.grab_set()

        tk.Label(
            dialog,
            text="Add New User",
            bg=CREAM,
            fg=DARK_BURGUNDY,
            font=("Arial", 18, "bold")
        ).pack(pady=20)

        # Username

        tk.Label(
            dialog,
            text="Username",
            bg=CREAM,
            fg=DARK_BROWN,
            font=("Arial", 10, "bold")
        ).pack(anchor="w", padx=40)

        username_entry = tk.Entry(
            dialog,
            width=35,
            font=("Arial", 11)
        )

        username_entry.pack(
            padx=40,
            pady=(5, 12)
        )

        # Password

        tk.Label(
            dialog,
            text="Password",
            bg=CREAM,
            fg=DARK_BROWN,
            font=("Arial", 10, "bold")
        ).pack(anchor="w", padx=40)

        password_entry = tk.Entry(
            dialog,
            width=35,
            show="*",
            font=("Arial", 11)
        )

        password_entry.pack(
            padx=40,
            pady=(5, 12)
        )

        # Role

        tk.Label(
            dialog,
            text="Role",
            bg=CREAM,
            fg=DARK_BROWN,
            font=("Arial", 10, "bold")
        ).pack(anchor="w", padx=40)

        role_var = tk.StringVar(
            value="Cashier"
        )

        role_combo = ttk.Combobox(
            dialog,
            textvariable=role_var,
            values=("Admin", "Cashier"),
            state="readonly",
            width=32
        )

        role_combo.pack(
            padx=40,
            pady=(5, 15)
        )

        def save_user():

            username = username_entry.get().strip()
            password = password_entry.get().strip()
            role = role_var.get().strip()

            # Input validation

            if not username:

                messagebox.showwarning(
                    "Validation Error",
                    "Username is required.",
                    parent=dialog
                )

                return

            if len(username) < 3:

                messagebox.showwarning(
                    "Validation Error",
                    "Username must contain at least 3 characters.",
                    parent=dialog
                )

                return

            if not password:

                messagebox.showwarning(
                    "Validation Error",
                    "Password is required.",
                    parent=dialog
                )

                return

            if len(password) < 4:

                messagebox.showwarning(
                    "Validation Error",
                    "Password must contain at least 4 characters.",
                    parent=dialog
                )

                return

            if role not in ("Admin", "Cashier"):

                messagebox.showwarning(
                    "Validation Error",
                    "Please select a valid role.",
                    parent=dialog
                )

                return

            connection = None

            try:

                connection = get_connection()

                cursor = connection.cursor()

                cursor.execute(
                    """
                    SELECT id
                    FROM users
                    WHERE username = ?
                    """,
                    (username,)
                )

                existing_user = cursor.fetchone()

                if existing_user:

                    messagebox.showwarning(
                        "Duplicate Username",
                        "This username already exists.",
                        parent=dialog
                    )

                    return

                cursor.execute(
                    """
                    INSERT INTO users
                    (username, password, role)
                    VALUES (?, ?, ?)
                    """,
                    (
                        username,
                        password,
                        role
                    )
                )

                connection.commit()

                new_user_id = cursor.lastrowid

                log_action(
                    self.user["id"],
                    self.user["username"],
                    self.user["role"],
                    "ADD_USER",
                    f"Added user: {username} | Role: {role}"
                )

                messagebox.showinfo(
                    "User Created",
                    f"User '{username}' was created successfully.",
                    parent=dialog
                )

                dialog.destroy()

                self.load_users()

            except Exception as error:

                if connection:
                    connection.rollback()

                messagebox.showerror(
                    "Database Error",
                    "Unable to create user.",
                    parent=dialog
                )

                print(f"Add user error: {error}")

            finally:

                if connection:
                    connection.close()

        tk.Button(
            dialog,
            text="Create User",
            width=15,
            bg=GOLD,
            fg=DARK_BURGUNDY,
            activebackground=CREAM,
            activeforeground=DARK_BURGUNDY,
            font=("Arial", 10, "bold"),
            cursor="hand2",
            command=save_user
        ).pack(
            side="left",
            padx=(70, 10)
        )

        tk.Button(
            dialog,
            text="Cancel",
            width=15,
            bg=DARK_BURGUNDY,
            fg=GOLD,
            activebackground=BURGUNDY,
            activeforeground=GOLD,
            font=("Arial", 10, "bold"),
            cursor="hand2",
            command=dialog.destroy
        ).pack(
            side="left",
            padx=10
        )

    # =====================================================
    # CHANGE ROLE
    # =====================================================

    def change_role(self):

        selected = self.user_table.selection()

        if not selected:

            messagebox.showwarning(
                "Select User",
                "Please select a user first."
            )

            return

        values = self.user_table.item(
            selected[0],
            "values"
        )

        user_id = int(values[0])
        username = values[1]
        current_role = values[2]

        if user_id == self.user["id"]:

            messagebox.showwarning(
                "Action Not Allowed",
                "You cannot change your own role."
            )

            return

        new_role = (
            "Cashier"
            if current_role == "Admin"
            else "Admin"
        )

        confirm = messagebox.askyesno(
            "Change Role",
            (
                f"Change '{username}' role from "
                f"{current_role} to {new_role}?"
            )
        )

        if not confirm:
            return

        connection = None

        try:

            connection = get_connection()

            cursor = connection.cursor()

            cursor.execute(
                """
                UPDATE users
                SET role = ?
                WHERE id = ?
                """,
                (
                    new_role,
                    user_id
                )
            )

            connection.commit()

            log_action(
                self.user["id"],
                self.user["username"],
                self.user["role"],
                "CHANGE_USER_ROLE",
                (
                    f"Changed user '{username}' role "
                    f"from {current_role} to {new_role}"
                )
            )

            messagebox.showinfo(
                "Role Updated",
                f"{username}'s role is now {new_role}."
            )

            self.load_users()

        except Exception as error:

            if connection:
                connection.rollback()

            messagebox.showerror(
                "Database Error",
                "Unable to change user role."
            )

            print(f"Change role error: {error}")

        finally:

            if connection:
                connection.close()

    # =====================================================
    # DELETE USER
    # =====================================================

    def delete_user(self):

        selected = self.user_table.selection()

        if not selected:

            messagebox.showwarning(
                "Select User",
                "Please select a user first."
            )

            return

        values = self.user_table.item(
            selected[0],
            "values"
        )

        user_id = int(values[0])
        username = values[1]

        if user_id == self.user["id"]:

            messagebox.showwarning(
                "Action Not Allowed",
                "You cannot delete your own account."
            )

            return

        confirm = messagebox.askyesno(
            "Delete User",
            (
                f"Are you sure you want to delete "
                f"user '{username}'?"
            )
        )

        if not confirm:
            return

        connection = None

        try:

            connection = get_connection()

            cursor = connection.cursor()

            cursor.execute(
                """
                DELETE FROM users
                WHERE id = ?
                """,
                (user_id,)
            )

            connection.commit()

            log_action(
                self.user["id"],
                self.user["username"],
                self.user["role"],
                "DELETE_USER",
                f"Deleted user: {username}"
            )

            messagebox.showinfo(
                "User Deleted",
                f"User '{username}' was deleted successfully."
            )

            self.load_users()

        except Exception as error:

            if connection:
                connection.rollback()

            messagebox.showerror(
                "Database Error",
                "Unable to delete user."
            )

            print(f"Delete user error: {error}")

        finally:

            if connection:
                connection.close()


# =========================================================
# START USER MANAGEMENT
# =========================================================

def start_user_management(root, user):

    user_root = tk.Toplevel(root)

    UserManagementWindow(
        user_root,
        user
    )