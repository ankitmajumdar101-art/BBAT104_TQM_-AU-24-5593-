import tkinter as tk
from tkinter import messagebox


# =====================================================
# RESTAURANT BILLING SYSTEM COLOR THEME
# Based on the top design provided
# =====================================================

BURGUNDY = "#730F19"
DARK_BURGUNDY = "#4A0004"
CREAM = "#F6E0B4"
GOLD = "#F4C266"
DARK_BROWN = "#6B1418"
WHITE_CREAM = "#FFF8E8"


class DashboardWindow:

    def __init__(self, root, user):

        self.root = root
        self.user = user

        # -------------------------------------------------
        # WINDOW
        # -------------------------------------------------

        self.root.title(
            "Restaurant Billing System - Dashboard"
        )

        self.root.geometry(
            "1000x650"
        )

        self.root.resizable(
            False,
            False
        )

        self.root.configure(
            bg=CREAM
        )

        self.create_dashboard()

    # =====================================================
    # CREATE DASHBOARD
    # =====================================================

    def create_dashboard(self):

        # =================================================
        # TOP HEADER
        # =================================================

        header = tk.Frame(
            self.root,
            bg=DARK_BURGUNDY,
            height=90
        )

        header.pack(
            fill="x"
        )

        header.pack_propagate(False)

        # -------------------------------------------------
        # LEFT TITLE
        # -------------------------------------------------

        title = tk.Label(
            header,
            text="Restaurant Billing System",
            bg=DARK_BURGUNDY,
            fg=GOLD,
            font=("Arial", 24, "bold")
        )

        title.pack(
            side="left",
            padx=30
        )

        # -------------------------------------------------
        # USER INFORMATION
        # -------------------------------------------------

        user_label = tk.Label(
            header,
            text=(
                f"User: {self.user['username']}   |   "
                f"Role: {self.user['role']}"
            ),
            bg=DARK_BURGUNDY,
            fg=WHITE_CREAM,
            font=("Arial", 11, "bold")
        )

        user_label.pack(
            side="right",
            padx=30
        )

        # =================================================
        # QUALITY GOAL
        # =================================================

        quality_label = tk.Label(
            self.root,
            text="Q01 - Improve Reliability",
            bg=CREAM,
            fg=DARK_BROWN,
            font=("Arial", 17, "bold")
        )

        quality_label.pack(
            pady=(25, 5)
        )

        description_label = tk.Label(
            self.root,
            text="Restaurant Management Dashboard",
            bg=CREAM,
            fg=DARK_BROWN,
            font=("Arial", 11)
        )

        description_label.pack(
            pady=(0, 20)
        )

        # =================================================
        # DASHBOARD AREA
        # =================================================

        dashboard_frame = tk.Frame(
            self.root,
            bg=CREAM
        )

        dashboard_frame.pack(
            pady=5
        )

        # =================================================
        # COMMON BUTTONS
        # These are available to Admin and Cashier
        # =================================================

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

        # =================================================
        # ADMIN-ONLY BUTTONS
        # =================================================

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

        # =================================================
        # ROLE INFORMATION
        # =================================================

        role_frame = tk.Frame(
            self.root,
            bg=WHITE_CREAM,
            bd=1,
            relief="solid"
        )

        role_frame.pack(
            fill="x",
            padx=100,
            pady=(25, 10)
        )

        if self.user["role"] == "Admin":

            role_text = (
                "Admin Access: "
                "Billing • Bill History • Menu • "
                "User Management • Audit Logs • Backup"
            )

        else:

            role_text = (
                "Cashier Access: "
                "Billing • Bill History • Menu"
            )

        role_label = tk.Label(
            role_frame,
            text=role_text,
            bg=WHITE_CREAM,
            fg=DARK_BROWN,
            font=("Arial", 10, "bold"),
            pady=12
        )

        role_label.pack()

        # =================================================
        # LOGOUT BUTTON
        # =================================================

        logout_button = tk.Button(
            self.root,
            text="Logout",
            width=22,
            height=2,
            bg=GOLD,
            fg=DARK_BURGUNDY,
            activebackground=CREAM,
            activeforeground=DARK_BURGUNDY,
            font=("Arial", 12, "bold"),
            cursor="hand2",
            command=self.logout
        )

        logout_button.pack(
            pady=15
        )

        # =================================================
        # FOOTER
        # =================================================

        footer = tk.Label(
            self.root,
            text="TQM Project • Quality Goal: Improve Reliability",
            bg=CREAM,
            fg=DARK_BROWN,
            font=("Arial", 9)
        )

        footer.pack(
            pady=5
        )

    # =====================================================
    # CREATE DASHBOARD BUTTON
    # =====================================================

    def create_button(
        self,
        parent,
        text,
        command,
        row,
        column
    ):

        button = tk.Button(
            parent,
            text=text,
            width=22,
            height=3,
            bg=BURGUNDY,
            fg=GOLD,
            activebackground=DARK_BURGUNDY,
            activeforeground=GOLD,
            font=("Arial", 12, "bold"),
            cursor="hand2",
            bd=2,
            relief="raised",
            command=command
        )

        button.grid(
            row=row,
            column=column,
            padx=12,
            pady=12
        )

    # =====================================================
    # BILLING
    # =====================================================

    def open_billing(self):

        messagebox.showinfo(
            "Billing",
            "Billing module will be implemented in a later step."
        )

    # =====================================================
    # BILL HISTORY
    # =====================================================

    def open_bill_history(self):

        messagebox.showinfo(
            "Bill History",
            "Bill History module will be implemented in a later step."
        )

    # =====================================================
    # MENU
    # =====================================================

    def open_menu(self):

        try:

            from gui.menu import MenuWindow

            menu_root = tk.Toplevel(
                self.root
            )

            MenuWindow(
                menu_root,
                self.user
            )

        except Exception as error:

            messagebox.showerror(
                "Menu Error",
                "Unable to open Menu Management."
            )

            print(
                f"Menu error: {error}"
            )

    # =====================================================
    # USER MANAGEMENT
    # =====================================================

    def open_user_management(self):

        messagebox.showinfo(
            "User Management",
            "User Management will be implemented in a later step."
        )

    # =====================================================
    # AUDIT LOGS
    # =====================================================

    def open_audit_logs(self):

        messagebox.showinfo(
            "Audit Logs",
            "Audit Log module will be implemented in a later step."
        )

    # =====================================================
    # BACKUP
    # =====================================================

    def open_backup(self):

        messagebox.showinfo(
            "Backup",
            "Auto Backup module will be implemented in a later step."
        )

    # =====================================================
    # LOGOUT
    # =====================================================

    def logout(self):

        confirm = messagebox.askyesno(
            "Logout",
            "Are you sure you want to logout?"
        )

        if confirm:

            self.root.destroy()


# =========================================================
# START DASHBOARD
# =========================================================

def start_dashboard(user):

    root = tk.Tk()

    DashboardWindow(
        root,
        user
    )

    root.mainloop()


# =========================================================
# DIRECT TEST
# =========================================================

if __name__ == "__main__":

    test_user = {
        "username": "admin",
        "role": "Admin"
    }

    start_dashboard(
        test_user
    )