import tkinter as tk


def main():
    root = tk.Tk()
    root.title("Restaurant Billing System")
    root.geometry("800x500")

    title_label = tk.Label(
        root,
        text="Restaurant Billing System",
        font=("Arial", 24, "bold")
    )

    title_label.pack(pady=50)

    subtitle_label = tk.Label(
        root,
        text="Q01 - Improve Reliability",
        font=("Arial", 16)
    )

    subtitle_label.pack(pady=10)

    root.mainloop()


if __name__ == "__main__":
    main()