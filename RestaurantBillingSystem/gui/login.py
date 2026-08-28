import tkinter as tk
from tkinter import messagebox

from database.database import get_connection


class LoginWindow:
    def __init__(self, root):
        self.root = root

        self.root.title("Restaurant Billing System - Login")
        self.root.geometry("500x400")
        self.root.resizable(False, False)

        self.create_widgets()

    def create_widgets(self):
        # ---------------------------------------------
        # TITLE
        # ---------------------------------------------
        title_label = tk.Label(
            self.root,
            text="Restaurant Billing System",
            font=("Arial", 22, "bold")
        )

        title_label.pack(pady=(40, 10))

        subtitle_label = tk.Label(
            self.root,
            text="Q01 - Improve Reliability",
            font=("Arial", 12)
        )

        subtitle_label.pack(pady=(0, 30))

        # ---------------------------------------------
        # USERNAME
        # ---------------------------------------------
        username_label = tk.Label(
            self.root,
            text="Username",
            font=("Arial", 12)
        )

        username_label.pack()

        self.username_entry = tk.Entry(
            self.root,
            width=35,
            font=("Arial", 12)
        )

        self.username_entry.pack(pady=(5, 15))

        # ---------------------------------------------
        # PASSWORD
        # ---------------------------------------------
        password_label = tk.Label(
            self.root,
            text="Password",
            font=("Arial", 12)
        )

        password_label.pack()

        self.password_entry = tk.Entry(
            self.root,
            width=35,
            font=("Arial", 12),
            show="*"
        )

        self.password_entry.pack(pady=(5, 20))

        # ---------------------------------------------
        # LOGIN BUTTON
        # ---------------------------------------------
        login_button = tk.Button(
            self.root,
            text="Login",
            width=20,
            font=("Arial", 12, "bold"),
            command=self.login
        )

        login_button.pack(pady=10)

    def login(self):
        username = self.username_entry.get().strip()
        password = self.password_entry.get()

        # Basic validation
        if not username:
            messagebox.showwarning(
                "Validation Error",
                "Please enter your username."
            )
            return

        if not password:
            messagebox.showwarning(
                "Validation Error",
                "Please enter your password."
            )
            return

        try:
            connection = get_connection()

            cursor = connection.cursor()

            cursor.execute("""
                SELECT id, username, role
                FROM users
                WHERE username = ?
                AND password = ?
            """, (username, password))

            user = cursor.fetchone()

            connection.close()

            if user:
                messagebox.showinfo(
                    "Login Successful",
                    f"Welcome {user['username']}!\n\n"
                    f"Role: {user['role']}"
                )

                print(
                    f"Login successful | "
                    f"User: {user['username']} | "
                    f"Role: {user['role']}"
                )

            else:
                messagebox.showerror(
                    "Login Failed",
                    "Invalid username or password."
                )

        except Exception as error:
            messagebox.showerror(
                "System Error",
                "Unable to process login."
            )

            print(f"Login error: {error}")


def start_login():
    root = tk.Tk()

    LoginWindow(root)

    root.mainloop()


if __name__ == "__main__":
    start_login()