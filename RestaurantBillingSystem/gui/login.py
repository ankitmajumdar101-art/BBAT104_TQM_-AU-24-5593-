import tkinter as tk
from tkinter import messagebox

from database.database import get_connection
from gui.dashboard import start_dashboard


# =====================================================
# RESTAURANT BILLING SYSTEM COLOR THEME
# =====================================================

BURGUNDY = "#730F19"
DARK_BURGUNDY = "#4A0004"
CREAM = "#F6E0B4"
GOLD = "#F4C266"
DARK_BROWN = "#6B1418"
WHITE_CREAM = "#FFF8E8"


class LoginWindow:

    def __init__(self, root):

        self.root = root

        self.root.title(
            "Restaurant Billing System - Login"
        )

        self.root.geometry(
            "600x500"
        )

        self.root.resizable(
            False,
            False
        )

        self.root.configure(
            bg=CREAM
        )

        self.create_widgets()

    def create_widgets(self):

        # =================================================
        # HEADER
        # =================================================

        header = tk.Frame(
            self.root,
            bg=DARK_BURGUNDY,
            height=100
        )

        header.pack(
            fill="x"
        )

        header.pack_propagate(False)

        title = tk.Label(
            header,
            text="Restaurant Billing System",
            bg=DARK_BURGUNDY,
            fg=GOLD,
            font=("Arial", 24, "bold")
        )

        title.pack(
            pady=(20, 5)
        )

        subtitle = tk.Label(
            header,
            text="Secure Login",
            bg=DARK_BURGUNDY,
            fg=WHITE_CREAM,
            font=("Arial", 11)
        )

        subtitle.pack()

        # =================================================
        # LOGIN AREA
        # =================================================

        login_frame = tk.Frame(
            self.root,
            bg=CREAM
        )

        login_frame.pack(
            pady=35
        )

        # -------------------------------------------------
        # USERNAME
        # -------------------------------------------------

        username_label = tk.Label(
            login_frame,
            text="Username",
            bg=CREAM,
            fg=DARK_BROWN,
            font=("Arial", 12, "bold")
        )

        username_label.grid(
            row=0,
            column=0,
            padx=10,
            pady=10,
            sticky="e"
        )

        self.username_entry = tk.Entry(
            login_frame,
            width=30,
            font=("Arial", 12),
            bg=WHITE_CREAM,
            fg=DARK_BROWN,
            insertbackground=DARK_BROWN
        )

        self.username_entry.grid(
            row=0,
            column=1,
            padx=10,
            pady=10
        )

        # -------------------------------------------------
        # PASSWORD
        # -------------------------------------------------

        password_label = tk.Label(
            login_frame,
            text="Password",
            bg=CREAM,
            fg=DARK_BROWN,
            font=("Arial", 12, "bold")
        )

        password_label.grid(
            row=1,
            column=0,
            padx=10,
            pady=10,
            sticky="e"
        )

        self.password_entry = tk.Entry(
            login_frame,
            width=30,
            font=("Arial", 12),
            bg=WHITE_CREAM,
            fg=DARK_BROWN,
            insertbackground=DARK_BROWN,
            show="*"
        )

        self.password_entry.grid(
            row=1,
            column=1,
            padx=10,
            pady=10
        )

        # =================================================
        # LOGIN BUTTON
        # =================================================

        login_button = tk.Button(
            self.root,
            text="Login",
            width=22,
            height=2,
            bg=BURGUNDY,
            fg=GOLD,
            activebackground=DARK_BURGUNDY,
            activeforeground=GOLD,
            font=("Arial", 13, "bold"),
            cursor="hand2",
            command=self.login
        )

        login_button.pack(
            pady=10
        )

        # =================================================
        # QUALITY GOAL
        # =================================================

        quality_label = tk.Label(
            self.root,
            text="Q01 - Improve Reliability",
            bg=CREAM,
            fg=DARK_BROWN,
            font=("Arial", 10, "bold")
        )

        quality_label.pack(
            pady=20
        )

        self.username_entry.focus()

    # =====================================================
    # LOGIN
    # =====================================================

    def login(self):

        username = self.username_entry.get().strip()

        password = self.password_entry.get()

        # -------------------------------------------------
        # INPUT VALIDATION
        # -------------------------------------------------

        if not username:

            messagebox.showwarning(
                "Validation Error",
                "Please enter your username."
            )

            self.username_entry.focus()

            return

        if not password:

            messagebox.showwarning(
                "Validation Error",
                "Please enter your password."
            )

            self.password_entry.focus()

            return

        try:

            connection = get_connection()

            cursor = connection.cursor()

            cursor.execute(
                """
                SELECT id, username, role
                FROM users
                WHERE username = ?
                AND password = ?
                """,
                (
                    username,
                    password
                )
            )

            user = cursor.fetchone()

            connection.close()

            # -------------------------------------------------
            # SUCCESSFUL LOGIN
            # -------------------------------------------------

            if user:

                messagebox.showinfo(
                    "Login Successful",
                    f"Welcome {user['username']}!\n\n"
                    f"Role: {user['role']}"
                )

                self.root.destroy()

                start_dashboard(user)

            # -------------------------------------------------
            # INVALID LOGIN
            # -------------------------------------------------

            else:

                messagebox.showerror(
                    "Login Failed",
                    "Invalid username or password."
                )

                self.password_entry.delete(
                    0,
                    tk.END
                )

                self.password_entry.focus()

        except Exception as error:

            messagebox.showerror(
                "System Error",
                "Unable to process login."
            )

            print(
                f"Login error: {error}"
            )


def start_login():

    root = tk.Tk()

    LoginWindow(root)

    root.mainloop()


if __name__ == "__main__":

    start_login()