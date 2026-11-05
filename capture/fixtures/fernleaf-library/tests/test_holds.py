import unittest
from datetime import datetime, timedelta

from fernleaf.holds import PICKUP_WINDOW, HoldQueue
from fernleaf.notify import Notifier


class HoldQueueTest(unittest.TestCase):
    def test_a_returned_copy_fills_the_oldest_hold(self):
        notifier = Notifier()
        queue = HoldQueue(notifier)
        start = datetime(2026, 3, 2, 10, 0)
        first = queue.place("ada@fernleaf.example", "978-0-00-000001-1", start)
        queue.place("ben@fernleaf.example", "978-0-00-000001-1", start + timedelta(hours=1))
        self.assertIs(queue.copy_returned("978-0-00-000001-1", start + timedelta(days=1)), first)
        self.assertEqual(notifier.sent[0][0], "ada@fernleaf.example")

    def test_an_uncollected_hold_expires(self):
        queue = HoldQueue(Notifier())
        start = datetime(2026, 3, 2, 10, 0)
        queue.place("ada@fernleaf.example", "978-0-00-000001-1", start)
        queue.copy_returned("978-0-00-000001-1", start)
        later = start + PICKUP_WINDOW + timedelta(minutes=1)
        self.assertEqual(len(queue.expire(later)), 1)


if __name__ == "__main__":
    unittest.main()
