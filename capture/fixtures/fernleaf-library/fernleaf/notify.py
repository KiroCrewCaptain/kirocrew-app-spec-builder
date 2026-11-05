"""Messages to members. The demo keeps them in memory instead of sending mail."""

from datetime import datetime


class Notifier:
    def __init__(self) -> None:
        self.sent: list[tuple[str, str]] = []

    def hold_ready(self, member_email: str, isbn: str, expires_at: datetime | None) -> None:
        when = expires_at.strftime("%A %d %B") if expires_at else "soon"
        self.sent.append((member_email, f"Your hold on {isbn} is ready. Collect it by {when}."))
