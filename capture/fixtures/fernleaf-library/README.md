# Fernleaf Library holds

A small service that runs the holds shelf of Fernleaf Library, a made-up
neighbourhood library. Members place a hold on a book from the catalogue; when a
copy comes back it waits on the holds shelf for the member to collect it.

- `fernleaf/catalog.py` — the books and their copies.
- `fernleaf/holds.py` — placing a hold, filling it when a copy is returned, and
  expiring a hold that was not collected in time.
- `fernleaf/notify.py` — the messages sent to members (today: "your hold is
  ready").

Run the tests with `python -m unittest`.
