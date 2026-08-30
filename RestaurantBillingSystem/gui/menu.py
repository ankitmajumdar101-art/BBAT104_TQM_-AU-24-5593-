import tkinter as tk
from tkinter import ttk, messagebox

from database.database import get_connection


# =====================================================
# COLOR THEME
# =====================================================

BURGUNDY = "#730F19"
DARK_BURGUNDY = "#4A0004"
CREAM = "#F6E0B4"
GOLD = "#F4C266"
DARK_BROWN = "#6B1418"
WHITE_CREAM = "#FFF8E8"


class MenuWindow:
    def __init__(self, root, user):
        self.root = root
        self.user = user

        self.root.title("Restaurant Billing System - Menu Management")
        self.root.geometry("1000x650")
        self.root.resizable(False, False)

        self.root.configure(bg=CREAM)

        self.create_widgets()
        self.load_menu_items()

    # =================================================
    # MAIN UI
    # =================================================

    def create_widgets(self):

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

        title = tk.Label(
            header,
            text="Restaurant Billing System",
            bg=DARK_BURGUNDY,
            fg=GOLD,
            font=("Arial", 24, "bold")
        )

        title.pack(side="left", padx=30)

        user_label = tk.Label(
            header,
            text=f"{self.user['username']} | {self.user['role']}",
            bg=DARK_BURGUNDY,
            fg=WHITE_CREAM,
            font=("Arial", 11, "bold")
        )

        user_label.pack(side="right", padx=30)

        # -------------------------------------------------
        # PAGE TITLE
        # -------------------------------------------------

        page_title = tk.Label(
            self.root,
            text="Menu Management",
            bg=CREAM,
            fg=DARK_BURGUNDY,
            font=("Arial", 22, "bold")
        )

        page_title.pack(pady=(20, 10))

        # -------------------------------------------------
        # FORM FRAME
        # -------------------------------------------------

        form_frame = tk.Frame(
            self.root,
            bg=CREAM
        )

        form_frame.pack(pady=10)

        # Item Name

        tk.Label(
            form_frame,
            text="Item Name:",
            bg=CREAM,
            fg=DARK_BROWN,
            font=("Arial", 12, "bold")
        ).grid(row=0, column=0, padx=10, pady=8, sticky="e")

        self.name_entry = tk.Entry(
            form_frame,
            width=30,
            font=("Arial", 12),
            bg=WHITE_CREAM
        )

        self.name_entry.grid(
            row=0,
            column=1,
            padx=10,
            pady=8
        )

        # Category

        tk.Label(
            form_frame,
            text="Category:",
            bg=CREAM,
            fg=DARK_BROWN,
            font=("Arial", 12, "bold")
        ).grid(row=1, column=0, padx=10, pady=8, sticky="e")

        self.category_combo = ttk.Combobox(
            form_frame,
            width=28,
            font=("Arial", 12),
            state="readonly",
            values=[
                "Starter",
                "Main Course",
                "Beverage",
                "Dessert",
                "Fast Food"
            ]
        )

        self.category_combo.grid(
            row=1,
            column=1,
            padx=10,
            pady=8
        )

        # Price

        tk.Label(
            form_frame,
            text="Price:",
            bg=CREAM,
            fg=DARK_BROWN,
            font=("Arial", 12, "bold")
        ).grid(row=2, column=0, padx=10, pady=8, sticky="e")

        self.price_entry = tk.Entry(
            form_frame,
            width=30,
            font=("Arial", 12),
            bg=WHITE_CREAM
        )

        self.price_entry.grid(
            row=2,
            column=1,
            padx=10,
            pady=8
        )

        # Available

        tk.Label(
            form_frame,
            text="Available:",
            bg=CREAM,
            fg=DARK_BROWN,
            font=("Arial", 12, "bold")
        ).grid(row=3, column=0, padx=10, pady=8, sticky="e")

        self.available_var = tk.IntVar(value=1)

        available_frame = tk.Frame(
            form_frame,
            bg=CREAM
        )

        available_frame.grid(
            row=3,
            column=1,
            padx=10,
            pady=8,
            sticky="w"
        )

        tk.Radiobutton(
            available_frame,
            text="Yes",
            variable=self.available_var,
            value=1,
            bg=CREAM,
            fg=DARK_BROWN,
            font=("Arial", 11)
        ).pack(side="left")

        tk.Radiobutton(
            available_frame,
            text="No",
            variable=self.available_var,
            value=0,
            bg=CREAM,
            fg=DARK_BROWN,
            font=("Arial", 11)
        ).pack(side="left", padx=20)

        # -------------------------------------------------
        # BUTTONS
        # -------------------------------------------------

        button_frame = tk.Frame(
            self.root,
            bg=CREAM
        )

        button_frame.pack(pady=15)

        tk.Button(
            button_frame,
            text="Add Item",
            width=18,
            height=2,
            bg=BURGUNDY,
            fg=GOLD,
            activebackground=DARK_BURGUNDY,
            activeforeground=GOLD,
            font=("Arial", 12, "bold"),
            command=self.add_item
        ).pack(side="left", padx=10)

        tk.Button(
            button_frame,
            text="Clear",
            width=18,
            height=2,
            bg=GOLD,
            fg=DARK_BURGUNDY,
            activebackground=CREAM,
            font=("Arial", 12, "bold"),
            command=self.clear_form
        ).pack(side="left", padx=10)

        # -------------------------------------------------
        # TABLE
        # -------------------------------------------------

        table_frame = tk.Frame(
            self.root,
            bg=CREAM
        )

        table_frame.pack(
            fill="both",
            expand=True,
            padx=30,
            pady=10
        )

        columns = (
            "id",
            "name",
            "category",
            "price",
            "available"
        )

        self.menu_table = ttk.Treeview(
            table_frame,
            columns=columns,
            show="headings",
            height=10
        )

        self.menu_table.heading(
            "id",
            text="ID"
        )

        self.menu_table.heading(
            "name",
            text="Item Name"
        )

        self.menu_table.heading(
            "category",
            text="Category"
        )

        self.menu_table.heading(
            "price",
            text="Price"
        )

        self.menu_table.heading(
            "available",
            text="Available"
        )

        self.menu_table.column(
            "id",
            width=60,
            anchor="center"
        )

        self.menu_table.column(
            "name",
            width=220
        )

        self.menu_table.column(
            "category",
            width=180
        )

        self.menu_table.column(
            "price",
            width=120,
            anchor="center"
        )

        self.menu_table.column(
            "available",
            width=120,
            anchor="center"
        )

        self.menu_table.pack(
            fill="both",
            expand=True
        )

    # =================================================
    # INPUT VALIDATION
    # =================================================

    def validate_input(self):

        name = self.name_entry.get().strip()
        category = self.category_combo.get().strip()
        price_text = self.price_entry.get().strip()

        # Name validation

        if not name:
            messagebox.showwarning(
                "Validation Error",
                "Item name is required."
            )

            self.name_entry.focus()

            return None

        # Category validation

        if not category:
            messagebox.showwarning(
                "Validation Error",
                "Please select a category."
            )

            self.category_combo.focus()

            return None

        # Price validation

        if not price_text:
            messagebox.showwarning(
                "Validation Error",
                "Price is required."
            )

            self.price_entry.focus()

            return None

        try:
            price = float(price_text)

        except ValueError:
            messagebox.showwarning(
                "Validation Error",
                "Price must be a valid number."
            )

            self.price_entry.focus()

            return None

        if price <= 0:
            messagebox.showwarning(
                "Validation Error",
                "Price must be greater than zero."
            )

            self.price_entry.focus()

            return None

        return name, category, price

    # =================================================
    # ADD ITEM
    # =================================================

    def add_item(self):

        validated_data = self.validate_input()

        if validated_data is None:
            return

        name, category, price = validated_data

        available = self.available_var.get()

        try:

            connection = get_connection()

            cursor = connection.cursor()

            cursor.execute(
                """
                INSERT INTO menu_items
                (name, category, price, available)
                VALUES (?, ?, ?, ?)
                """,
                (
                    name,
                    category,
                    price,
                    available
                )
            )

            connection.commit()

            connection.close()

            messagebox.showinfo(
                "Success",
                f"{name} was added successfully."
            )

            self.clear_form()

            self.load_menu_items()

        except Exception as error:

            messagebox.showerror(
                "Database Error",
                "Unable to add menu item."
            )

            print(f"Menu error: {error}")

    # =================================================
    # LOAD ITEMS
    # =================================================

    def load_menu_items(self):

        for item in self.menu_table.get_children():
            self.menu_table.delete(item)

        try:

            connection = get_connection()

            cursor = connection.cursor()

            cursor.execute(
                """
                SELECT
                    id,
                    name,
                    category,
                    price,
                    available
                FROM menu_items
                ORDER BY id DESC
                """
            )

            items = cursor.fetchall()

            connection.close()

            for item in items:

                available_text = (
                    "Yes"
                    if item["available"] == 1
                    else "No"
                )

                self.menu_table.insert(
                    "",
                    "end",
                    values=(
                        item["id"],
                        item["name"],
                        item["category"],
                        f"₹{item['price']:.2f}",
                        available_text
                    )
                )

        except Exception as error:

            messagebox.showerror(
                "Database Error",
                "Unable to load menu items."
            )

            print(f"Load menu error: {error}")

    # =================================================
    # CLEAR FORM
    # =================================================

    def clear_form(self):

        self.name_entry.delete(
            0,
            tk.END
        )

        self.category_combo.set("")

        self.price_entry.delete(
            0,
            tk.END
        )

        self.available_var.set(1)

        self.name_entry.focus()


def start_menu(user):

    root = tk.Tk()

    MenuWindow(
        root,
        user
    )

    root.mainloop()


if __name__ == "__main__":

    test_user = {
        "username": "admin",
        "role": "Admin"
    }

    start_menu(test_user)