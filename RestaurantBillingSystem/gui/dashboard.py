import tkinter as tk
from tkinter import messagebox


class DashboardWindow:
    def __init__(self, root, user):
        self.root = root
        self.user = user

        self.root.title("Restaurant Billing System - Dashboard")
        self.root.geometry("900x600")
        self.root.resizable(False, False)

        self.create_dashboard()

    def create_dashboard(self):
        # ---------------------------------------------
        # HEADER
        # ---------------------------------------------
        header = tk.Frame(self.root)
        header.pack(fill="x", padx=20, pady=20)

        title_label = tk.Label(
            header,
            text="Restaurant Billing System",
            font=("Arial", 24, "bold")
        )
        title_label.pack(side="left")

        user_label = tk.Label(
            header,
            text=f"{self.user['username']} | {self.user['role']}",
            font=("Arial", 12)
        )
        user_label.pack(side="right")

        # ---------------------------------------------
        # QUALITY GOAL
        # ---------------------------------------------
        quality_label = tk.Label(
            self.root,
            text="Q01 - Improve Reliability",
            font=("Arial", 14, "bold")
        )
        quality_label.pack(pady=(0, 20))

        # ---------------------------------------------
        # DASHBOARD FRAME
        # ---------------------------------------------
        dashboard_frame = tk.Frame(self.root)
        dashboard_frame.pack(pady=10)

        # ---------------------------------------------
        # COMMON BUTTONS
        # ---------------------------------------------
        self.create_button(
            dashboard_frame,
            "Billing",
            self.open_billing,
            0,
            0
        )

        self.create_button(
            dashboard_frame,
            "Bill History",
            self.open_bill_history,
            0,
            1
        )

        self.create_button(
            dashboard_frame,
            "Menu",
            self.open_menu,
            0,
            2
        )

        # ---------------------------------------------
        # ADMIN-ONLY BUTTONS
        # ---------------------------------------------
        if self.user["role"] == "Admin":

            self.create_button(
                dashboard_frame,
                "User Management",
                self.open_user_management,
                1,
                0
            )

            self.create_button(
                dashboard_frame,
                "Audit Logs",
                self.open_audit_logs,
                1,
                1
            )

            self.create_button(
                dashboard_frame,
                "Backup",
                self.open_backup,
                1,
                2
            )

        # ---------------------------------------------
        # LOGOUT
        # ---------------------------------------------
        logout_button = tk.Button(
            self.root,
            text="Logout",
            width=20,
            height=2,
            font=("Arial", 12, "bold"),
            command=self.logout
        )

        logout_button.pack(pady=40)

    def create_button(self, parent, text, command, row, column):
        button = tk.Button(
            parent,
            text=text,
            width=20,
            height=3,
            font=("Arial", 12, "bold"),
            command=command
        )

        button.grid(
            row=row,
            column=column,
            padx=10,
            pady=10
        )

    # ---------------------------------------------
    # PLACEHOLDER FUNCTIONS
    # ---------------------------------------------

    def open_billing(self):
        messagebox.showinfo(
            "Billing",
            "Billing module will be implemented in a later step."
        )

    def open_bill_history(self):
        messagebox.showinfo(
            "Bill History",
            "Bill History module will be implemented in a later step."
        )

    def open_menu(self):
        messagebox.showinfo(
            "Menu",
            "Menu Management will be implemented in a later step."
        )

    def open_user_management(self):
        messagebox.showinfo(
            "User Management",
            "User Management will be implemented in a later step."
        )

    def open_audit_logs(self):
        messagebox.showinfo(
            "Audit Logs",
            "Audit Log module will be implemented in a later step."
        )

    def open_backup(self):
        messagebox.showinfo(
            "Backup",
            "Auto Backup module will be implemented in a later step."
        )

    def logout(self):
        confirm = messagebox.askyesno(
            "Logout",
            "Are you sure you want to logout?"
        )

        if confirm:
            self.root.destroy()


def start_dashboard(user):
    root = tk.Tk()

    DashboardWindow(root, user)

    root.mainloop()