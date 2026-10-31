# School Library System

Welcome to the official repository of our **School Library System**, developed as a group academic project for the **System Integration and Architecture (SIA)** course.

# Project Overview

The School Library System is a web-based application designed to help manage school library activities. It provides features for managing books, administrators, students, borrowing and returning transactions, reservations, and book conditions.

# Ownership Matrix

| Member | GitHub username | Tables owned | CRUD resource | Join report and Join type | Feature role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Member 1 | `@username1` | `admins`, `students`, `activity_logs` | Students | Students Without Borrowing Records (`LEFT JOIN`) | Student and Admin Management |
| Member 2 | `@Dev-Hisayuki` | `categories`, `authors`, `publishers`, `books` | Books | Book Catalog with Category, Author, and Publisher (`INNER JOIN`) | Book Management |
| Member 3 | `@Robren2005` | `book_copies`, `borrow_transactions`, `returns` | Borrowing Transactions | Borrowing History (`INNER JOIN`) | Borrowing and Returning |
| Member 4 | `@kurtalvarado05-coder` | `reservations`, `penalties`, `borrowing_policies` | Reservations | Overdue and Penalty Report (`FULL OUTER JOIN / UNION`) | Reservations and Penalties |

# Repository Structure

School-Library-System/
│
├── app/                         # Main application folder
│   ├── config/                  
│   │   └── db.js                # Database connection pool setup[cite: 4]
│   │
│   ├── models/                  # Models: Talk to DB, validation, SQL queries & joins[cite: 5]
│   │   ├── modelA_studentAdmin.js      # Member A: admins, students, activity_logs
│   │   ├── modelB_bookManagement.js    # Member B: categories, authors, publishers, books
│   │   ├── modelC_borrowReturn.js      # Member C: book_copies, borrow_transactions, returns
│   │   └── modelD_policyReservation.js # Member D: reservations, borrowing_policies, book_conditions
│   │
│   ├── controllers/             # Controllers: Request handling, status codes, responses[cite: 5]
│   │   ├── controllerA_studentAdmin.js      # Member A logic
│   │   ├── controllerB_bookManagement.js    # Member B logic
│   │   ├── controllerC_borrowReturn.js      # Member C logic
│   │   └── controllerD_policyReservation.js # Member D logic
│   │
│   ├── routes/                  # Routes: Endpoint routing for GET, POST, PUT/PATCH, DELETE[cite: 5]
│   │   ├── routesA_studentAdmin.js      # Member A routes
│   │   ├── routesB_bookManagement.js    # Member B routes
│   │   ├── routesC_borrowReturn.js      # Member C routes
│   │   └── routesD_policyReservation.js # Member D routes
│   │
│   ├── middleware/              
│   │   └── errorHandler.js      # Global API error handler and status code manager[cite: 5]
│   │
│   ├── screens/                 # Frontend client screens (React, Vue, or UI templates)
│   │   ├── ScreenA_studentAdmin.jsx     # Member A UI
│   │   ├── ScreenB_bookManagement.jsx   # Member B UI
│   │   ├── ScreenC_borrowReturn.jsx     # Member C UI
│   │   └── ScreenD_policyReservation.jsx# Member D UI
│   │
│   └── server.js                # Main application entry point (Express server)
│
├── database/                    # Database setup and files
│   ├── slices/                  # Individual member SQL slice files
│   │   ├── sliceA_studentAdmin.sql
│   │   ├── sliceB_bookManagement.sql
│   │   ├── sliceC_borrowReturn.sql
│   │   └── sliceD_policyReservation.sql
│   └── library_management.sql   # Complete combined schema & seed SQL file
│
├── docs/                        # Documentation and diagrams
│   ├── slices/                  # Member markdown documentation slices
│   │   ├── sliceA_studentAdmin.md
│   │   ├── sliceB_bookManagement.md
│   │   ├── sliceC_borrowReturn.md
│   │   └── sliceD_policyReservation.md
│   └── er-diagram.png           # Exported ER Diagram image for your README
│
├── .env.example                 # Environment variables template (DB host, port, user, pass)[cite: 14]
├── .gitattributes               # Git attributes configuration
├── .gitignore                   # Git ignore rules
├── package.json                 # Node.js dependencies and scripts
└── README.md                    # Group roster, run instructions, and Ownership Matrix[cite: 7, 14]