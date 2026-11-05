"""The books the library owns and how many copies are on the shelf."""

from dataclasses import dataclass, field


@dataclass
class Book:
    isbn: str
    title: str
    copies: int = 1
    on_loan: int = 0

    @property
    def available(self) -> int:
        return self.copies - self.on_loan


@dataclass
class Catalog:
    books: dict[str, Book] = field(default_factory=dict)

    def add(self, book: Book) -> None:
        self.books[book.isbn] = book

    def find(self, isbn: str) -> Book | None:
        return self.books.get(isbn)
