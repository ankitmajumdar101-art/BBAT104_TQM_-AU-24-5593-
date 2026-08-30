import tkinter as tk


# =====================================================
# RESTAURANT BILLING SYSTEM COLOR THEME
# =====================================================

BURGUNDY = "#730F19"
DARK_BURGUNDY = "#4A0004"
CREAM = "#F6E0B4"
GOLD = "#F4C266"
DARK_BROWN = "#6B1418"
WHITE_CREAM = "#FFF8E8"


class MainWindow:

    def __init__(self, root):

        self.root = root

        self.root.title(
            "Restaurant Billing System"
        )

        self.root.geometry(
            "900x550"
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

        title = tk.Label(
            header,
            text="Restaurant Billing System",
            bg=DARK_BURGUNDY,
            fg=GOLD,
            font=("Arial", 26, "bold")
        )

        title.pack(
            pady=25
        )

        # =================================================
        # MAIN CONTENT
        # =================================================

        content = tk.Frame(
            self.root,
            bg=CREAM
        )

        content.pack(
            fill="both",
            expand=True
        )

        subtitle = tk.Label(
            content,
            text="Quality Goal: Improve Reliability",
            bg=CREAM,
            fg=DARK_BROWN,
            font=("Arial", 18, "bold")
        )

        subtitle.pack(
            pady=(70, 15)
        )

        description = tk.Label(
            content,
            text=(
                "Restaurant Billing System\n"
                "Reliable • Accurate • Secure"
            ),
            bg=CREAM,
            fg=DARK_BROWN,
            font=("Arial", 14),
            justify="center"
        )

        description.pack(
            pady=10
        )

        # =================================================
        # LOGIN BUTTON
        # =================================================

        login_button = tk.Button(
            content,
            text="Open Login",
            width=25,
            height=2,
            bg=BURGUNDY,
            fg=GOLD,
            activebackground=DARK_BURGUNDY,
            activeforeground=GOLD,
            font=("Arial", 14, "bold"),
            cursor="hand2",
            command=self.open_login
        )

        login_button.pack(
            pady=35
        )

        # =================================================
        # FOOTER
        # =================================================

        footer = tk.Label(
            content,
            text="TQM Project • Q01 - Improve Reliability",
            bg=CREAM,
            fg=DARK_BROWN,
            font=("Arial", 10)
        )

        footer.pack(
            pady=20
        )

    def open_login(self):

        # Import here to avoid unnecessary startup dependency
        from gui.login import start_login

        self.root.destroy()

        start_login()


def main():

    root = tk.Tk()

    MainWindow(root)

    root.mainloop()


if __name__ == "__main__":
    main()