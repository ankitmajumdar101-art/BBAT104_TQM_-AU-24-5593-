import tkinter as tk
from tkinter import ttk, messagebox

from utils.audit_logger import get_audit_logs


# -------------------------------------------------
# THEME COLORS
# -------------------------------------------------

BURGUNDY = "#730F19"
DARK_BURGUNDY = "#4A0004"
CREAM = "#F6E0B4"
GOLD = "#F4C266"
DARK_BROWN = "#6B1418"
WHITE_CREAM = "#FFF8E8"


class AuditLogsWindow:

    def __init__(self, parent, user):

        self.parent = parent
        self.user = user

        self.window = tk.Toplevel(parent)
        self.window.title("Audit Logs")
        self.window.geometry("1100x600")
        self.window.configure(bg=CREAM)

        # -------------------------------------------------
        # HEADER
        # -------------------------------------------------

        header = tk.Frame(
            self.window,
            bg=BURGUNDY,
            height=80
        )

        header.pack(
            fill="x"
        )

        header.pack_propagate(False)

        tk.Label(
            header,
            text="AUDIT LOGS",
            font=("Arial", 24, "bold"),
            bg=BURGUNDY,
            fg=GOLD
        ).pack(
            pady=(12, 0)
        )

        tk.Label(
            header,
            font=("Arial", 11),
            bg=BURGUNDY,
            fg=WHITE_CREAM
        ).pack()

        # -------------------------------------------------
        # INFORMATION
        # -------------------------------------------------

        info_frame = tk.Frame(
            self.window,
            bg=CREAM
        )

        info_frame.pack(
            fill="x",
            padx=20,
            pady=15
        )

        tk.Label(
            info_frame,
            text=f"Logged in as: {self.user['username']} "
                 f"({self.user['role']})",
            font=("Arial", 11, "bold"),
            bg=CREAM,
            fg=DARK_BROWN
        ).pack(
            side="left"
        )

        # -------------------------------------------------
        # TABLE FRAME
        # -------------------------------------------------

        table_frame = tk.Frame(
            self.window,
            bg=CREAM
        )

        table_frame.pack(
            fill="both",
            expand=True,
            padx=20,
            pady=(0, 15)
        )

        # -------------------------------------------------
        # SCROLLBARS
        # -------------------------------------------------

        vertical_scrollbar = ttk.Scrollbar(
            table_frame,
            orient="vertical"
        )

        horizontal_scrollbar = ttk.Scrollbar(
            table_frame,
            orient="horizontal"
        )

        # -------------------------------------------------
        # TREEVIEW
        # -------------------------------------------------

        columns = (
            "id",
            "username",
            "role",
            "action",
            "details",
            "timestamp"
        )

        self.audit_table = ttk.Treeview(
            table_frame,
            columns=columns,
            show="headings",
            yscrollcommand=vertical_scrollbar.set,
            xscrollcommand=horizontal_scrollbar.set
        )

        vertical_scrollbar.config(
            command=self.audit_table.yview
        )

        horizontal_scrollbar.config(
            command=self.audit_table.xview
        )

        # -------------------------------------------------
        # COLUMN HEADINGS
        # -------------------------------------------------

        self.audit_table.heading(
            "id",
            text="ID"
        )

        self.audit_table.heading(
            "username",
            text="Username"
        )

        self.audit_table.heading(
            "role",
            text="Role"
        )

        self.audit_table.heading(
            "action",
            text="Action"
        )

        self.audit_table.heading(
            "details",
            text="Details"
        )

        self.audit_table.heading(
            "timestamp",
            text="Timestamp"
        )

        # -------------------------------------------------
        # COLUMN WIDTHS
        # -------------------------------------------------

        self.audit_table.column(
            "id",
            width=60,
            anchor="center"
        )

        self.audit_table.column(
            "username",
            width=120,
            anchor="center"
        )

        self.audit_table.column(
            "role",
            width=100,
            anchor="center"
        )

        self.audit_table.column(
            "action",
            width=130,
            anchor="center"
        )

        self.audit_table.column(
            "details",
            width=450,
            anchor="w"
        )

        self.audit_table.column(
            "timestamp",
            width=180,
            anchor="center"
        )

        # -------------------------------------------------
        # PACK TABLE
        # -------------------------------------------------

        self.audit_table.grid(
            row=0,
            column=0,
            sticky="nsew"
        )

        vertical_scrollbar.grid(
            row=0,
            column=1,
            sticky="ns"
        )

        horizontal_scrollbar.grid(
            row=1,
            column=0,
            sticky="ew"
        )

        table_frame.grid_rowconfigure(
            0,
            weight=1
        )

        table_frame.grid_columnconfigure(
            0,
            weight=1
        )

        # -------------------------------------------------
        # BUTTON FRAME
        # -------------------------------------------------

        button_frame = tk.Frame(
            self.window,
            bg=CREAM
        )

        button_frame.pack(
            pady=(0, 20)
        )

        tk.Button(
            button_frame,
            text="Refresh Logs",
            command=self.load_logs,
            bg=BURGUNDY,
            fg=WHITE_CREAM,
            activebackground=DARK_BURGUNDY,
            activeforeground=WHITE_CREAM,
            font=("Arial", 11, "bold"),
            width=15,
            cursor="hand2"
        ).pack(
            side="left",
            padx=8
        )

        tk.Button(
            button_frame,
            text="Close",
            command=self.window.destroy,
            bg=DARK_BROWN,
            fg=WHITE_CREAM,
            activebackground=DARK_BURGUNDY,
            activeforeground=WHITE_CREAM,
            font=("Arial", 11, "bold"),
            width=15,
            cursor="hand2"
        ).pack(
            side="left",
            padx=8
        )

        # -------------------------------------------------
        # LOAD LOGS
        # -------------------------------------------------

        self.load_logs()

    # -------------------------------------------------
    # LOAD AUDIT LOGS
    # -------------------------------------------------

    def load_logs(self):

        try:

            for item in self.audit_table.get_children():
                self.audit_table.delete(item)

            logs = get_audit_logs()

            for log in logs:

                self.audit_table.insert(
                    "",
                    tk.END,
                    values=(
                        log["id"],
                        log["username"],
                        log["role"],
                        log["action"],
                        log["details"],
                        log["timestamp"]
                    )
                )

        except Exception as error:

            messagebox.showerror(
                "Audit Log Error",
                "Unable to load audit logs."
            )

            print(
                f"Audit log display error: {error}"
            )


# -------------------------------------------------
# START AUDIT LOG WINDOW
# -------------------------------------------------

def start_audit_logs(parent, user):

    AuditLogsWindow(
        parent,
        user
    )