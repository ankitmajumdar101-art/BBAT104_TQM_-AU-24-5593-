import tkinter as tk
from tkinter import ttk, messagebox

from database.database import get_connection


BURGUNDY = "#730F19"
DARK_BURGUNDY = "#4A0004"
CREAM = "#F6E0B4"
GOLD = "#F4C266"
DARK_BROWN = "#6B1418"
WHITE_CREAM = "#FFF8E8"


class BillHistoryWindow:

    def __init__(self, root, user):

        self.root = root
        self.user = user

        self.root.title("Restaurant Billing System - Bill History")
        self.root.geometry("1100x650")
        self.root.resizable(False, False)
        self.root.configure(bg=CREAM)

        self.create_interface()
        self.load_bills()

    # =====================================================
    # CREATE INTERFACE
    # =====================================================

    def create_interface(self):

        header = tk.Frame(
            self.root,
            bg=DARK_BURGUNDY,
            height=75
        )

        header.pack(fill="x")
        header.pack_propagate(False)

        tk.Label(
            header,
            text="Bill History",
            bg=DARK_BURGUNDY,
            fg=GOLD,
            font=("Arial", 22, "bold")
        ).pack(side="left", padx=25)

        tk.Label(
            header,
            text=f"User: {self.user['username']}",
            bg=DARK_BURGUNDY,
            fg=WHITE_CREAM,
            font=("Arial", 11, "bold")
        ).pack(side="right", padx=25)

        # -------------------------------------------------
        # BILL TABLE
        # -------------------------------------------------

        table_frame = tk.Frame(
            self.root,
            bg=CREAM
        )

        table_frame.pack(
            fill="both",
            expand=True,
            padx=20,
            pady=20
        )

        columns = (
            "id",
            "bill_number",
            "table",
            "subtotal",
            "tax",
            "discount",
            "total",
            "created_by",
            "created_at"
        )

        self.bill_table = ttk.Treeview(
            table_frame,
            columns=columns,
            show="headings",
            height=20
        )

        headings = {
            "id": "ID",
            "bill_number": "Bill Number",
            "table": "Table",
            "subtotal": "Subtotal",
            "tax": "Tax",
            "discount": "Discount",
            "total": "Total",
            "created_by": "Created By",
            "created_at": "Created At"
        }

        for column, heading in headings.items():
            self.bill_table.heading(
                column,
                text=heading
            )

        self.bill_table.column("id", width=45)
        self.bill_table.column("bill_number", width=170)
        self.bill_table.column("table", width=60)
        self.bill_table.column("subtotal", width=90)
        self.bill_table.column("tax", width=70)
        self.bill_table.column("discount", width=80)
        self.bill_table.column("total", width=90)
        self.bill_table.column("created_by", width=80)
        self.bill_table.column("created_at", width=150)

        scrollbar = ttk.Scrollbar(
            table_frame,
            orient="vertical",
            command=self.bill_table.yview
        )

        self.bill_table.configure(
            yscrollcommand=scrollbar.set
        )

        self.bill_table.pack(
            side="left",
            fill="both",
            expand=True
        )

        scrollbar.pack(
            side="right",
            fill="y"
        )

        # -------------------------------------------------
        # BUTTONS
        # -------------------------------------------------

        button_frame = tk.Frame(
            self.root,
            bg=CREAM
        )

        button_frame.pack(
            fill="x",
            padx=20,
            pady=(0, 20)
        )

        tk.Button(
            button_frame,
            text="View Bill Items",
            width=18,
            bg=BURGUNDY,
            fg=GOLD,
            activebackground=DARK_BURGUNDY,
            activeforeground=GOLD,
            font=("Arial", 10, "bold"),
            cursor="hand2",
            command=self.view_bill_items
        ).pack(side="left", padx=5)

        tk.Button(
            button_frame,
            text="Refresh",
            width=15,
            bg=GOLD,
            fg=DARK_BURGUNDY,
            activebackground=CREAM,
            activeforeground=DARK_BURGUNDY,
            font=("Arial", 10, "bold"),
            cursor="hand2",
            command=self.load_bills
        ).pack(side="left", padx=5)

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
        ).pack(side="right", padx=5)

    # =====================================================
    # LOAD BILLS
    # =====================================================

    def load_bills(self):

        for item in self.bill_table.get_children():
            self.bill_table.delete(item)

        try:

            connection = get_connection()
            cursor = connection.cursor()

            cursor.execute(
                """
                SELECT
                    b.id,
                    b.bill_number,
                    b.table_number,
                    b.subtotal,
                    b.tax,
                    b.discount,
                    b.total,
                    u.username AS created_by,
                    b.created_at
                FROM bills b
                LEFT JOIN users u
                    ON b.created_by = u.id
                ORDER BY b.id DESC
                """
            )

            bills = cursor.fetchall()
            connection.close()

            for bill in bills:

                self.bill_table.insert(
                    "",
                    "end",
                    values=(
                        bill["id"],
                        bill["bill_number"],
                        bill["table_number"],
                        f"₹{bill['subtotal']:.2f}",
                        f"₹{bill['tax']:.2f}",
                        f"₹{bill['discount']:.2f}",
                        f"₹{bill['total']:.2f}",
                        bill["created_by"] or "Unknown",
                        bill["created_at"]
                    )
                )

        except Exception as error:

            messagebox.showerror(
                "Database Error",
                "Unable to load bill history."
            )

            print(f"Bill history error: {error}")

    # =====================================================
    # VIEW BILL ITEMS
    # =====================================================

    def view_bill_items(self):

        selected = self.bill_table.selection()

        if not selected:

            messagebox.showwarning(
                "Select Bill",
                "Please select a bill first."
            )

            return

        values = self.bill_table.item(
            selected[0],
            "values"
        )

        bill_id = int(values[0])
        bill_number = values[1]

        try:

            connection = get_connection()
            cursor = connection.cursor()

            cursor.execute(
                """
                SELECT
                    bi.quantity,
                    bi.price,
                    bi.subtotal,
                    m.name
                FROM bill_items bi
                LEFT JOIN menu_items m
                    ON bi.menu_item_id = m.id
                WHERE bi.bill_id = ?
                ORDER BY bi.id
                """,
                (bill_id,)
            )

            items = cursor.fetchall()
            connection.close()

            if not items:

                messagebox.showinfo(
                    "Bill Items",
                    "No items found for this bill."
                )

                return

            self.show_bill_items(
                bill_number,
                items
            )

        except Exception as error:

            messagebox.showerror(
                "Database Error",
                "Unable to load bill items."
            )

            print(f"Bill item history error: {error}")

    # =====================================================
    # SHOW BILL ITEMS
    # =====================================================

    def show_bill_items(self, bill_number, items):

        window = tk.Toplevel(self.root)

        window.title(
            f"Bill Items - {bill_number}"
        )

        window.geometry("650x400")
        window.resizable(False, False)
        window.configure(bg=CREAM)

        tk.Label(
            window,
            text=f"Bill: {bill_number}",
            bg=CREAM,
            fg=DARK_BROWN,
            font=("Arial", 16, "bold")
        ).pack(pady=15)

        columns = (
            "name",
            "quantity",
            "price",
            "subtotal"
        )

        table = ttk.Treeview(
            window,
            columns=columns,
            show="headings",
            height=12
        )

        table.heading(
            "name",
            text="Item"
        )

        table.heading(
            "quantity",
            text="Quantity"
        )

        table.heading(
            "price",
            text="Price"
        )

        table.heading(
            "subtotal",
            text="Subtotal"
        )

        table.column(
            "name",
            width=250
        )

        table.column(
            "quantity",
            width=100
        )

        table.column(
            "price",
            width=100
        )

        table.column(
            "subtotal",
            width=120
        )

        table.pack(
            padx=20,
            pady=10,
            fill="both",
            expand=True
        )

        for item in items:

            table.insert(
                "",
                "end",
                values=(
                    item["name"] or "Unknown Item",
                    item["quantity"],
                    f"₹{item['price']:.2f}",
                    f"₹{item['subtotal']:.2f}"
                )
            )

        tk.Button(
            window,
            text="Close",
            width=15,
            bg=DARK_BURGUNDY,
            fg=GOLD,
            activebackground=BURGUNDY,
            activeforeground=GOLD,
            font=("Arial", 10, "bold"),
            cursor="hand2",
            command=window.destroy
        ).pack(pady=15)


def start_bill_history(root, user):

    history_root = tk.Toplevel(root)

    BillHistoryWindow(
        history_root,
        user
    )