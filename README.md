# School Library System

Welcome to the official repository of our **School Library System**, developed as a group academic project for the **System Integration and Architecture (SIA)** course.

# Project Overview

The School Library System is a web-based application designed to help manage school library activities. It provides features for managing books, administrators, students, borrowing and returning transactions, reservations, and book conditions.

# Ownership Matrix

| Member | GitHub username | Tables owned | CRUD resource | Join report and Join type | Feature role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Member 1 | `@jhormvybondad787-a11y` | `admins`, `students`, `activity_logs` | Students | Students Without Borrowing Records (`LEFT JOIN`) | Student and Admin Management |
| Member 2 | `@Dev-Hisayuki` | `categories`, `authors`, `publishers`, `books` | Books | Book Catalog with Category, Author, and Publisher (`INNER JOIN`) | Book Management |
| Member 3 | `@Robren2005` | `book_copies`, `borrow_transactions`, `returns` | Borrowing Transactions | Borrowing History (`INNER JOIN`) | Borrowing and Returning |
| Member 4 | `@kurtalvarado05-coder` | `reservations`, `penalties`, `borrowing_policies` | Reservations | Overdue and Penalty Report (`FULL OUTER JOIN / UNION`) | Reservations and Penalties |

# Repository Structure

| Layer / Directory | File Path / Component | Description |
| :--- | :--- | :--- |
| **Configuration & Root** | `.env.example` | Template for environment variables (Database host, port, user, password) |
| | `.gitattributes` | Git attributes configuration file |
| | `.gitignore` | Defines files and directories ignored by Git |
| | `package.json` | Node.js project manifest, dependencies, and execution scripts |
| | `README.md` | Root documentation containing group roster, setup instructions, and Ownership Matrix |
| **App Root & Database Config** | `app/server.js` | Main application entry point for the Express server |
| | `app/config/db.js` | Database connection setup and connection pool configuration |
| | `app/middleware/errorHandler.js` | Global API error handling middleware and status code management |
| **Models (`app/models/`)** | `modelA_studentAdmin.js` | **Member A:** Handles `admins`, `students`, and `activity_logs` data queries |
| | `modelB_bookManagement.js` | **Member B:** Handles `categories`, `authors`, `publishers`, and `books` data queries |
| | `modelC_borrowReturn.js` | **Member C:** Handles `book_copies`, `borrow_transactions`, and `returns` data queries |
| | `modelD_policyReservation.js` | **Member D:** Handles `reservations`, `borrowing_policies`, and `book_conditions` data queries |
| **Controllers (`app/controllers/`)** | `controllerA_studentAdmin.js` | **Member A:** Request handling and business logic for Student & Admin Management |
| | `controllerB_bookManagement.js` | **Member B:** Request handling and business logic for Book Management |
| | `controllerC_borrowReturn.js` | **Member C:** Request handling and business logic for Borrowing & Returning |
| | `controllerD_policyReservation.js` | **Member D:** Request handling and business logic for Policy & Reservations |
| **Routes (`app/routes/`)** | `routesA_studentAdmin.js` | **Member A:** REST API routes for Student & Admin endpoints |
| | `routesB_bookManagement.js` | **Member B:** REST API routes for Book Management endpoints |
| | `routesC_borrowReturn.js` | **Member C:** REST API routes for Borrowing & Returning endpoints |
| | `routesD_policyReservation.js` | **Member D:** REST API routes for Policy & Reservation endpoints |
| **Screens (`app/screens/`)** | `ScreenA_studentAdmin.jsx` | **Member A:** Frontend UI view for Student and Admin Management |
| | `ScreenB_bookManagement.jsx` | **Member B:** Frontend UI view for Book Management |
| | `ScreenC_borrowReturn.jsx` | **Member C:** Frontend UI view for Borrowing and Returning |
| | `ScreenD_policyReservation.jsx` | **Member D:** Frontend UI view for Reservations and Policy Management |
| **Database (`database/`)** | `database/library_management.sql` | Complete combined schema and seed SQL file for initialization |
| | `database/slices/sliceA_studentAdmin.sql` | **Member A:** SQL table definitions and queries slice |
| | `database/slices/sliceB_bookManagement.sql` | **Member B:** SQL table definitions and queries slice |
| | `database/slices/sliceC_borrowReturn.sql` | **Member C:** SQL table definitions and queries slice |
| | `database/slices/sliceD_policyReservation.sql` | **Member D:** SQL table definitions and queries slice |
| **Documentation (`docs/`)** | `docs/er-diagram.png` | Exported Entity-Relationship Diagram for system visualization |
| | `docs/slices/sliceA_studentAdmin.md` | **Member A:** Detailed documentation slice |
| | `docs/slices/sliceB_bookManagement.md` | **Member B:** Detailed documentation slice |
| | `docs/slices/sliceC_borrowReturn.md` | **Member C:** Detailed documentation slice |
| | `docs/slices/sliceD_policyReservation.md` | **Member D:** Detailed documentation slice |