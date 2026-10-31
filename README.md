# School Library System

> Courses: Database Management Systems 1 (DBMS 1) & Systems Integration and Architecture (SIA)
>
> Track: Merged Track (One Combined System)
>
> Group Size: 4 Members (Member A, Member B, Member C, Member D)

## About the System & Main Feature

The School Library System helps school librarians manage books, track student borrowing and returns, and automatically handle overdue fines and book reservations.

### Main Feature: Automated Fine Calculation & Overdue Book Block System

This project is more than a simple database program because of its automated business rules:

1. Daily Overdue Fine Calculation: The system checks return due dates automatically. If a book is late, it calculates fines based on days overdue.
2. Automatic Student Blocking: If a student has overdue books or unpaid fines above the allowed limit, the system blocks them from borrowing new books until the issue is cleared.

---

## Ownership Matrix (Section 5.4 Compliance)

Each member owns their feature area end-to-end (Tables, Models, Controllers, Routes, Frontend Screen, and SQL Join Report).

| Member | GitHub Username | Role & Focus Area (5.3 Split) | Database Tables | Endpoints & Screens | Assigned SQL Join Report |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Member A** | `@jhormvybondad787-a11y` | **Core & System Setup** | `admins`<br>`activity_logs`<br>`system_settings` | Login Screen, Database Setup, Global Logs | INNER JOIN: Activity Logs with Admin Details |
| **Member B** | `@Dev-Hisayuki` | **Master Data & Catalog** | `categories`<br>`books`<br>`publishers` | Dashboard Overview, Book Catalog, Categories Screen | LEFT JOIN: All Books with optional Category info |
| **Member C** | `@Robren2005` | **Transactions & Borrowing** | `borrowers`<br>`borrow_records`<br>`borrow_details` | Borrower List, Issue Book Form, Borrow Details View | INNER JOIN: Active Borrows with Student & Book Info |
| **Member D** | `@kurtalvarado05-coder` | **Reports, Audit & Fines** | `return_records`<br>`return_details`<br>`fines`<br>`fine_payments` | Return Book Form, Return Details View, Fines & Overdue Report | FULL OUTER JOIN (UNION): Students with Borrows & Fine status |

---

## Folder & File Structure (Split by Member)

```text
School-Library-System/
│
├── config/
│   └── db.js                        # [Member A: @Dev-Hisayuki] Database connection
│
├── controllers/
│   ├── authController.js            # [Member A: @Dev-Hisayuki] Admin login logic
│   ├── categoryController.js        # [Member B: @MemberB-Dev] Book categories logic
│   ├── bookController.js            # [Member B: @MemberB-Dev] Book catalog logic
│   ├── borrowerController.js        # [Member C: @MemberC-Dev] Student/Borrower records
│   ├── borrowController.js          # [Member C: @MemberC-Dev] Book checkout logic
│   ├── returnController.js          # [Member D: @MemberD-Dev] Book check-in logic
│   ├── inventoryLogController.js    # [Member D: @MemberD-Dev] Borrow & return logs
│   └── fineController.js            # [Member D: @MemberD-Dev] Automated fine calculations
│
├── models/
│   ├── adminModel.js                # [Member A: @Dev-Hisayuki] Admin user model
│   ├── categoryModel.js             # [Member B: @MemberB-Dev] Category database queries
│   ├── bookModel.js                 # [Member B: @MemberB-Dev] Book database queries
│   ├── borrowerModel.js             # [Member C: @MemberC-Dev] Borrower database queries
│   ├── borrowTransactionModel.js    # [Member C: @MemberC-Dev] Borrow transaction queries
│   ├── borrowDetailModel.js         # [Member C: @MemberC-Dev] Borrow details queries
│   ├── returnTransactionModel.js    # [Member D: @MemberD-Dev] Return transaction queries
│   ├── returnDetailModel.js         # [Member D: @MemberD-Dev] Return details queries
│   ├── fineModel.js                 # [Member D: @MemberD-Dev] Fine tracking queries
│   └── activityLogModel.js          # [Member A: @Dev-Hisayuki] System log queries
│
├── routes/
│   ├── authRoutes.js                # [Member A: @Dev-Hisayuki] Login routes
│   ├── categoryRoutes.js            # [Member B: @MemberB-Dev] Category routes
│   ├── bookRoutes.js                # [Member B: @MemberB-Dev] Book routes
│   ├── borrowerRoutes.js            # [Member C: @MemberC-Dev] Borrower routes
│   ├── borrowRoutes.js              # [Member C: @MemberC-Dev] Borrow transaction routes
│   ├── returnRoutes.js              # [Member D: @MemberD-Dev] Return transaction routes
│   ├── inventoryLogRoutes.js        # [Member D: @MemberD-Dev] System log routes
│   └── fineRoutes.js                # [Member D: @MemberD-Dev] Fine alert routes
│
├── index.js                         # [Member A: @Dev-Hisayuki] Main server file
├── package.json                     # [Member A: @Dev-Hisayuki] Packages and scripts
└── .env                             # [Member A: @Dev-Hisayuki] Configuration settings
```

---

## REST API Route Map

### Member A: Auth & System
- `POST /api/auth/login` - Admin login

### Member B: Books & Categories
- `GET /api/categories` - Fetch categories
- `POST /api/categories` - Add category
- `GET /api/books` - Fetch all books
- `POST /api/books` - Add a new book
- `PUT /api/books/:id` - Update book details

### Member C: Borrower & Checkout
- `GET /api/borrowers` - Fetch student list
- `POST /api/borrowers` - Register a new borrower
- `POST /api/borrows` - Issue a book to a student

### Member D: Returns, Logs & Fines
- `POST /api/returns` - Process a book return
- `GET /api/logs` - Fetch all system transaction logs
- `GET /api/fines` - Fetch overdue books and calculated fines

---

## Database Requirements (12 Tables Total)

- **Member A (3 Tables):** `admins`, `activity_logs`, `system_settings`
- **Member B (3 Tables):** `categories`, `books`, `publishers`
- **Member C (3 Tables):** `borrowers`, `borrow_records`, `borrow_details`
- **Member D (3 Tables):** `return_records`, `return_details`, `fines`

## Git Rules for Group Members

1. Do not push directly to `main`. Always create a branch (example: `feature/hisayuki-login`).
2. Open a Pull Request (PR) when your code is ready.
3. Another member must review and approve your PR.
4. Merge using a **regular merge commit** (Do NOT use squash merge).
5. Always commit using your own GitHub account from your local computer.