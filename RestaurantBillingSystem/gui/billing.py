import tkinter as tk
from tkinter import ttk, messagebox
from database.database import get_connection
from utils.audit_logger import log_action


BURGUNDY = "#730F19"
DARK_BURGUNDY = "#4A0004"
CREAM = "#F6E0B4"
GOLD = "#F4C266"
DARK_BROWN = "#6B1418"
WHITE_CREAM = "#FFF8E8"


class BillingWindow:

    def __init__(self, root, user):

        self.root = root
        self.user = user
        self.cart = []

        self.root.title("Restaurant Billing System - Billing")
        self.root.geometry("1000x650")
        self.root.resizable(False, False)
        self.root.configure(bg=CREAM)

        self.create_interface()
        self.load_menu_items()

    # =====================================================
    # CREATE INTERFACE
    # =====================================================

    def create_interface(self):

        header = tk.Frame(
            self.root,
            bg=DARK_BURGUNDY,
            height=80
        )

        header.pack(fill="x")
        header.pack_propagate(False)

        tk.Label(
            header,
            text="Restaurant Billing",
            bg=DARK_BURGUNDY,
            fg=GOLD,
            font=("Arial", 22, "bold")
        ).pack(side="left", padx=25)

        tk.Label(
            header,
            text=f"Cashier: {self.user['username']}",
            bg=DARK_BURGUNDY,
            fg=WHITE_CREAM,
            font=("Arial", 11, "bold")
        ).pack(side="right", padx=25)

        # -------------------------------------------------
        # MENU SECTION
        # -------------------------------------------------

        menu_frame = tk.LabelFrame(
            self.root,
            text="Available Menu Items",
            bg=CREAM,
            fg=DARK_BROWN,
            font=("Arial", 12, "bold")
        )

        menu_frame.pack(
            side="left",
            fill="both",
            expand=True,
            padx=20,
            pady=20
        )

        columns = (
            "id",
            "name",
            "category",
            "price"
        )

        self.menu_table = ttk.Treeview(
            menu_frame,
            columns=columns,
            show="headings",
            height=20
        )

        self.menu_table.heading("id", text="ID")
        self.menu_table.heading("name", text="Name")
        self.menu_table.heading("category", text="Category")
        self.menu_table.heading("price", text="Price")

        self.menu_table.column("id", width=50)
        self.menu_table.column("name", width=150)
        self.menu_table.column("category", width=100)
        self.menu_table.column("price", width=80)

        self.menu_table.pack(
            padx=10,
            pady=10,
            fill="both",
            expand=True
        )

        tk.Button(
            menu_frame,
            text="Add Selected Item",
            width=20,
            bg=BURGUNDY,
            fg=GOLD,
            activebackground=DARK_BURGUNDY,
            activeforeground=GOLD,
            font=("Arial", 11, "bold"),
            cursor="hand2",
            command=self.add_selected_item
        ).pack(pady=10)

        # -------------------------------------------------
        # BILL SECTION
        # -------------------------------------------------

        bill_frame = tk.LabelFrame(
            self.root,
            text="Current Bill",
            bg=CREAM,
            fg=DARK_BROWN,
            font=("Arial", 12, "bold")
        )

        bill_frame.pack(
            side="right",
            fill="both",
            expand=True,
            padx=20,
            pady=20
        )

        bill_columns = (
            "name",
            "quantity",
            "price",
            "total"
        )

        self.bill_table = ttk.Treeview(
            bill_frame,
            columns=bill_columns,
            show="headings",
            height=15
        )

        self.bill_table.heading("name", text="Item")
        self.bill_table.heading("quantity", text="Qty")
        self.bill_table.heading("price", text="Price")
        self.bill_table.heading("total", text="Total")

        self.bill_table.column("name", width=130)
        self.bill_table.column("quantity", width=50)
        self.bill_table.column("price", width=70)
        self.bill_table.column("total", width=80)

        self.bill_table.pack(
            padx=10,
            pady=10,
            fill="both",
            expand=True
        )

        # -------------------------------------------------
        # TOTAL
        # -------------------------------------------------

        self.total_label = tk.Label(
            bill_frame,
            text="Total: ₹0.00",
            bg=CREAM,
            fg=DARK_BROWN,
            font=("Arial", 16, "bold")
        )

        self.total_label.pack(pady=10)

        tk.Button(
            bill_frame,
            text="Remove Selected",
            width=18,
            bg=DARK_BURGUNDY,
            fg=GOLD,
            activebackground=BURGUNDY,
            activeforeground=GOLD,
            font=("Arial", 10, "bold"),
            cursor="hand2",
            command=self.remove_selected_item
        ).pack(pady=5)

        tk.Button(
            bill_frame,
            text="Clear Bill",
            width=18,
            bg=BURGUNDY,
            fg=GOLD,
            activebackground=DARK_BURGUNDY,
            activeforeground=GOLD,
            font=("Arial", 10, "bold"),
            cursor="hand2",
            command=self.clear_bill
        ).pack(pady=5)

        tk.Button(
            bill_frame,
            text="Generate Bill",
            width=18,
            bg=GOLD,
            fg=DARK_BURGUNDY,
            activebackground=CREAM,
            activeforeground=DARK_BURGUNDY,
            font=("Arial", 11, "bold"),
            cursor="hand2",
            command=self.generate_bill
        ).pack(pady=10)

    # =====================================================
    # LOAD MENU ITEMS
    # =====================================================

    def load_menu_items(self):

        for item in self.menu_table.get_children():
            self.menu_table.delete(item)

        try:

            connection = get_connection()
            cursor = connection.cursor()

            cursor.execute(
                """
                SELECT id, name, category, price
                FROM menu_items
                WHERE available = 1
                ORDER BY name
                """
            )

            items = cursor.fetchall()
            connection.close()

            for item in items:

                self.menu_table.insert(
                    "",
                    "end",
                    values=(
                        item["id"],
                        item["name"],
                        item["category"],
                        f"{item['price']:.2f}"
                    )
                )

        except Exception as error:

            messagebox.showerror(
                "Database Error",
                "Unable to load menu items."
            )

            print(f"Billing menu error: {error}")

    # =====================================================
    # ADD ITEM
    # =====================================================

    def add_selected_item(self):

        selected = self.menu_table.selection()

        if not selected:
            messagebox.showwarning(
                "Select Item",
                "Please select a menu item first."
            )
            return

        values = self.menu_table.item(
            selected[0],
            "values"
        )

        item_id = int(values[0])
        name = values[1]
        price = float(values[3])

        for item in self.cart:

            if item["id"] == item_id:

                item["quantity"] += 1
                self.refresh_bill()
                return

        self.cart.append({
            "id": item_id,
            "name": name,
            "price": price,
            "quantity": 1
        })

        self.refresh_bill()

    # =====================================================
    # REFRESH BILL
    # =====================================================

    def refresh_bill(self):

        for item in self.bill_table.get_children():
            self.bill_table.delete(item)

        total = 0

        for item in self.cart:

            item_total = (
                item["price"] *
                item["quantity"]
            )

            total += item_total

            self.bill_table.insert(
                "",
                "end",
                values=(
                    item["name"],
                    item["quantity"],
                    f"₹{item['price']:.2f}",
                    f"₹{item_total:.2f}"
                )
            )

        self.total_label.config(
            text=f"Total: ₹{total:.2f}"
        )

    # =====================================================
    # REMOVE ITEM
    # =====================================================

    def remove_selected_item(self):

        selected = self.bill_table.selection()

        if not selected:
            messagebox.showwarning(
                "Select Item",
                "Please select an item from the bill."
            )
            return

        item_name = self.bill_table.item(
            selected[0],
            "values"
        )[0]

        for item in self.cart:

            if item["name"] == item_name:

                self.cart.remove(item)
                break

        self.refresh_bill()

    # =====================================================
    # CLEAR BILL
    # =====================================================

    def clear_bill(self):

        if not self.cart:
            return

        confirm = messagebox.askyesno(
            "Clear Bill",
            "Are you sure you want to clear the current bill?"
        )

        if confirm:

            self.cart.clear()
            self.refresh_bill()

    # =====================================================
    # GENERATE BILL
    # =====================================================

    def generate_bill(self):

        if not self.cart:
            messagebox.showwarning(
                "Empty Bill",
                "Please add at least one item."
            )
            return

        subtotal = sum(
            item["price"] * item["quantity"]
            for item in self.cart
        )

        tax = 0.0
        discount = 0.0
        total = subtotal + tax - discount

        # Default table number for the current billing screen.
        # This can be expanded later if table selection is added.
        table_number = 1

        try:

            connection = get_connection()
            cursor = connection.cursor()

            # Generate a unique bill number
            bill_number = f"BILL-{__import__('datetime').datetime.now().strftime('%Y%m%d%H%M%S')}"

            cursor.execute(
                """
                INSERT INTO bills
                (
                    bill_number,
                    table_number,
                    subtotal,
                    tax,
                    discount,
                    total,
                    created_by
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    bill_number,
                    table_number,
                    subtotal,
                    tax,
                    discount,
                    total,
                    self.user["id"]
                )
            )

            bill_id = cursor.lastrowid

            for item in self.cart:

                item_subtotal = (
                    item["price"] * item["quantity"]
                )

                cursor.execute(
                    """
                    INSERT INTO bill_items
                    (
                        bill_id,
                        menu_item_id,
                        quantity,
                        price,
                        subtotal
                    )
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        bill_id,
                        item["id"],
                        item["quantity"],
                        item["price"],
                        item_subtotal
                    )
                )

            connection.commit()
            connection.close()

            log_action(
                self.user["id"],
                self.user["username"],
                self.user["role"],
                "CREATE_BILL",
                f"Created bill #{bill_number} | Total: ₹{total:.2f}"
            )

            messagebox.showinfo(
                "Bill Generated",
                f"Bill #{bill_number} generated successfully.\n\n"
                f"Subtotal: ₹{subtotal:.2f}\n"
                f"Tax: ₹{tax:.2f}\n"
                f"Discount: ₹{discount:.2f}\n"
                f"Total: ₹{total:.2f}"
            )

            self.cart.clear()
            self.refresh_bill()

        except Exception as error:

            try:
                connection.rollback()
                connection.close()
            except Exception:
                pass

            messagebox.showerror(
                "Billing Error",
                "Unable to generate bill."
            )

            print(f"Billing error: {error}")


def start_billing(root, user):

    billing_root = tk.Toplevel(root)

    BillingWindow(
        billing_root,
        user
    )