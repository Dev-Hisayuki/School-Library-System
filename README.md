| Member | GitHub username | Tables owned | CRUD resource | Join report and Join type | Feature role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Member 1 | `@username1` | `admins`, `students`, `activity_logs` | Students | Students Without Borrowing Records (`LEFT JOIN`) | Student and Admin Management |
| Member 2 | `@Dev-Hisayuki` | `categories`, `authors`, `publishers`, `books` | Books | Book Catalog with Category, Author, and Publisher (`INNER JOIN`) | Book Management |
| Member 3 | `@username3` | `book_copies`, `borrow_transactions`, `returns` | Borrowing Transactions | Borrowing History (`INNER JOIN`) | Borrowing and Returning |
| Member 4 | `@username4` | `reservations`, `penalties`, `borrowing_policies` | Reservations | Overdue and Penalty Report (`FULL OUTER JOIN / UNION`) | Reservations and Penalties |