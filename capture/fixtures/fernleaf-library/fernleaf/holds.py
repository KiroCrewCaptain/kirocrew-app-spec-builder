"""Holds: a member asks for a book, a returned copy fills the oldest hold."""

from dataclasses import dataclass
from datetime import datetime, timedelta

from .notify import Notifier

#: How long a filled hold waits on the shelf before it expires.
PICKUP_WINDOW = timedelta(days=7)


@dataclass
class Hold:
    member_email: str
    isbn: str
    placed_at: datetime
    ready_at: datetime | None = None

    @property
    def expires_at(self) -> datetime | None:
        return self.ready_at + PICKUP_WINDOW if self.ready_at else None


class HoldQueue:
    def __init__(self, notifier: Notifier) -> None:
        self._holds: list[Hold] = []
        self._notifier = notifier

    def place(self, member_email: str, isbn: str, now: datetime) -> Hold:
        hold = Hold(member_email=member_email, isbn=isbn, placed_at=now)
        self._holds.append(hold)
        return hold

    def copy_returned(self, isbn: str, now: datetime) -> Hold | None:
        """Fill the oldest waiting hold for *isbn* and tell the member."""
        for hold in self._holds:
            if hold.isbn == isbn and hold.ready_at is None:
                hold.ready_at = now
                self._notifier.hold_ready(hold.member_email, isbn, hold.expires_at)
                return hold
        return None

    def expire(self, now: datetime) -> list[Hold]:
        """Drop every filled hold whose pickup window has passed."""
        expired = [h for h in self._holds if h.expires_at and h.expires_at < now]
        self._holds = [h for h in self._holds if h not in expired]
        return expired
