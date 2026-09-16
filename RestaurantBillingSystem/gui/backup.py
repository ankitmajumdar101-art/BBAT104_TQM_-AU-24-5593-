import tkinter as tk
from tkinter import ttk, messagebox
from pathlib import Path

from utils.backup_manager import create_backup, get_backup_logs


# =========================
# THEME COLORS
# =========================
BURGUNDY = "#730F19"
DARK_BURGUNDY = "#4A0004"
CREAM = "#F6E0B4"
GOLD = "#F4C266"
DARK_BROWN = "#6B1418"
WHITE_CREAM = "#FFF8E8"


class BackupWindow:

    def __init__(self, parent, user):

        self.parent = parent
        self.user = user

        self.window = tk.Toplevel(parent)
        self.window.title("Backup Management")
        self.window.geometry("1100x600")
        self.window.configure(bg=CREAM)

        self.window.transient(parent)

        self.create_ui()
        self.load_backups()

    # =========================
    # CREATE UI
    # =========================
    def create_ui(self):

        # Header
        header = tk.Frame(
            self.window,
            bg=BURGUNDY,
            height=90
        )
        header.pack(fill="x")
        header.pack_propagate(False)

        title = tk.Label(
            header,
            text="Database Backup Management",
            font=("Arial", 24, "bold"),
            bg=BURGUNDY,
            fg=GOLD
        )
        title.pack(pady=(15, 2))

        user_label = tk.Label(
            header,
            text=f"Logged in as: {self.user['username']} ({self.user['role']})",
            font=("Arial", 11),
            bg=BURGUNDY,
            fg=WHITE_CREAM
        )
        user_label.pack()

        # Information section
        info_frame = tk.Frame(
            self.window,
            bg=CREAM
        )
        info_frame.pack(
            fill="x",
            padx=25,
            pady=(20, 10)
        )

        info_label = tk.Label(
            info_frame,
            text="Backup History",
            font=("Arial", 18, "bold"),
            bg=CREAM,
            fg=DARK_BURGUNDY
        )
        info_label.pack(anchor="w")

        description = tk.Label(
            info_frame,
            text="View database backup records and create a new backup.",
            font=("Arial", 11),
            bg=CREAM,
            fg=DARK_BROWN
        )
        description.pack(anchor="w", pady=(3, 0))

        # =========================
        # TABLE FRAME
        # =========================
        table_frame = tk.Frame(
            self.window,
            bg=CREAM
        )
        table_frame.pack(
            fill="both",
            expand=True,
            padx=25,
            pady=10
        )

        columns = (
            "id",
            "backup_file",
            "created_at",
            "created_by"
        )

        self.tree = ttk.Treeview(
            table_frame,
            columns=columns,
            show="headings"
        )

        self.tree.heading(
            "id",
            text="ID"
        )

        self.tree.heading(
            "backup_file",
            text="Backup File"
        )

        self.tree.heading(
            "created_at",
            text="Created At"
        )

        self.tree.heading(
            "created_by",
            text="Created By"
        )

        self.tree.column(
            "id",
            width=60,
            anchor="center"
        )

        self.tree.column(
            "backup_file",
            width=550
        )

        self.tree.column(
            "created_at",
            width=180,
            anchor="center"
        )

        self.tree.column(
            "created_by",
            width=100,
            anchor="center"
        )

        # Scrollbar
        scrollbar = ttk.Scrollbar(
            table_frame,
            orient="vertical",
            command=self.tree.yview
        )

        self.tree.configure(
            yscrollcommand=scrollbar.set
        )

        self.tree.pack(
            side="left",
            fill="both",
            expand=True
        )

        scrollbar.pack(
            side="right",
            fill="y"
        )

        # =========================
        # BUTTON FRAME
        # =========================
        button_frame = tk.Frame(
            self.window,
            bg=CREAM
        )
        button_frame.pack(
            fill="x",
            padx=25,
            pady=(5, 20)
        )

        create_button = tk.Button(
            button_frame,
            text="Create Backup",
            command=self.create_new_backup,
            font=("Arial", 11, "bold"),
            bg=BURGUNDY,
            fg=WHITE_CREAM,
            activebackground=DARK_BURGUNDY,
            activeforeground=WHITE_CREAM,
            relief="flat",
            padx=20,
            pady=10,
            cursor="hand2"
        )
        create_button.pack(
            side="left",
            padx=(0, 10)
        )

        refresh_button = tk.Button(
            button_frame,
            text="Refresh",
            command=self.load_backups,
            font=("Arial", 11, "bold"),
            bg=GOLD,
            fg=DARK_BURGUNDY,
            activebackground=GOLD,
            relief="flat",
            padx=20,
            pady=10,
            cursor="hand2"
        )
        refresh_button.pack(
            side="left",
            padx=10
        )

        close_button = tk.Button(
            button_frame,
            text="Close",
            command=self.window.destroy,
            font=("Arial", 11, "bold"),
            bg=DARK_BURGUNDY,
            fg=WHITE_CREAM,
            activebackground=BURGUNDY,
            activeforeground=WHITE_CREAM,
            relief="flat",
            padx=20,
            pady=10,
            cursor="hand2"
        )
        close_button.pack(
            side="right"
        )

    # =========================
    # LOAD BACKUPS
    # =========================
    def load_backups(self):

        for item in self.tree.get_children():
            self.tree.delete(item)

        logs = get_backup_logs()

        for log in logs:

            backup_path = Path(log["backup_file"])

            self.tree.insert(
                "",
                "end",
                values=(
                    log["id"],
                    backup_path.name,
                    log["created_at"],
                    log["created_by"]
                )
            )

    # =========================
    # CREATE NEW BACKUP
    # =========================
    def create_new_backup(self):

        result = create_backup(
            self.user["id"],
            self.user["username"],
            self.user["role"]
        )

        if result:

            messagebox.showinfo(
                "Backup Successful",
                "Database backup was created successfully."
            )

            self.load_backups()

        else:

            messagebox.showerror(
                "Backup Failed",
                "Unable to create database backup."
            )


def start_backup(parent, user):

    BackupWindow(
        parent,
        user
    )