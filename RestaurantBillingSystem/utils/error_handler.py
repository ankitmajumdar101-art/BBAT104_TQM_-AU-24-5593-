import tkinter as tk
from tkinter import messagebox

from utils.error_logger import log_error


def handle_error(
    parent,
    user,
    error,
    module="Unknown",
    recovery_message="Please try again."
):
    """
    Handles application errors by:

    1. Recording the error in error_logs.
    2. Recording the error in audit_logs.
    3. Showing a user-friendly message.
    4. Allowing the application to continue running.
    """

    error_type = type(error).__name__
    error_description = str(error)

    user_id = None
    username = "System"
    role = "System"

    if user:
        user_id = user.get("id")
        username = user.get("username", "System")
        role = user.get("role", "System")

    log_error(
        user_id=user_id,
        username=username,
        role=role,
        error_type=error_type,
        description=error_description,
        module=module
    )

    if parent and parent.winfo_exists():

        messagebox.showerror(
            "Operation Error",
            f"Something went wrong.\n\n"
            f"{recovery_message}\n\n"
            f"The error has been recorded for review.",
            parent=parent
        )

    print(
        f"Error handled | "
        f"Type: {error_type} | "
        f"Module: {module} | "
        f"Description: {error_description}"
    )
    