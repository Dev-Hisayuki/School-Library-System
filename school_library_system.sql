-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 02, 2026 at 07:12 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `school_library_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `admin_id`, `action`, `description`, `created_at`) VALUES
(1, 1, 'LOGIN', 'Administrator admin logged in.', '2026-10-31 21:09:16'),
(2, 1, 'LOGIN', 'Administrator admin logged in.', '2026-10-31 21:11:21'),
(3, 1, 'LOGIN', 'Administrator admin logged in.', '2026-10-31 21:12:56'),
(4, 1, 'LOGIN', 'Administrator admin logged in.', '2026-10-31 22:18:53'),
(5, NULL, 'ISSUE_BOOK', 'Book \"Database Management Systems\" issued to Juan Dela Cruz. Borrow ID: 1.', '2026-11-01 04:34:29'),
(6, NULL, 'ISSUE_BOOK', 'Book \"Database Management Systems\" issued to Juan Dela Cruz. Borrow ID: 2.', '2026-11-01 04:34:59'),
(7, NULL, 'RETURN_ITEM', 'Returned 1 Good copy/copies for borrowing record #1. Return ID #1.', '2026-11-01 06:47:15'),
(8, NULL, 'RETURN_ITEM', 'Returned 1 Good copy/copies for borrowing record #2. Return ID #2.', '2026-11-01 06:47:18'),
(9, NULL, 'ISSUE_BOOK', 'Book \"Database Management Systems\" issued to tester2. Borrow ID: 3.', '2026-11-01 08:24:22'),
(10, 1, 'LOGIN', 'Administrator admin logged in.', '2026-11-01 08:25:28'),
(11, NULL, 'RETURN_ITEM', 'Returned 1 Damaged copy/copies for borrowing record #3. Return ID #3.', '2026-11-01 08:25:56'),
(12, NULL, 'ISSUE_BOOK', 'Book \"wdawdwa\" issued to tester2. Borrow ID: 4.', '2026-11-02 05:21:40'),
(13, NULL, 'RETURN_ITEM', 'Returned 1 Good copy/copies for borrowing record #4. Return ID #4.', '2026-11-02 05:21:53');

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `full_name`, `username`, `email`, `password_hash`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Administrator', 'admin', 'Administrator@gmail.com', 'scrypt$ebfc2aeb4ad3b504b5e598136ca567c4$afe0342d8011caaa410bce63dabe8c606911a38dca9cb94aa1bf3203a83550561cf05e2595a821e05b62cfd1e7d2dc123400a4ad0312037ae2bda6cc4112cc60', 1, '2026-10-31 20:53:27', '2026-10-31 20:53:27');

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `book_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `isbn` varchar(20) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `publisher_id` int(11) DEFAULT NULL,
  `publication_year` year(4) DEFAULT NULL,
  `total_copies` int(11) NOT NULL DEFAULT 0,
  `available_copies` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`book_id`, `title`, `isbn`, `category_id`, `publisher_id`, `publication_year`, `total_copies`, `available_copies`, `created_at`, `updated_at`) VALUES
(2, 'Database Management Systems', '9789876543210', 1, NULL, '2026', 5, 4, '2026-11-01 00:43:49', '2026-11-01 08:24:22'),
(3, 'temptbook', '12312421123', 1, NULL, '0000', 1, 1, '2026-11-01 09:27:36', '2026-11-01 09:27:36'),
(4, 'wdawdwa', 'dwadwda', 1, 6, '2025', 5, 5, '2026-11-01 09:32:24', '2026-11-02 05:21:53'),
(7, 'wqdwqe2', '123123123', 4, 6, '2027', 233, 233, '2026-11-02 03:52:34', '2026-11-02 03:52:34');

-- --------------------------------------------------------

--
-- Table structure for table `borrowers`
--

CREATE TABLE `borrowers` (
  `borrower_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `registration_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `borrowers`
--

INSERT INTO `borrowers` (`borrower_id`, `student_id`, `registration_date`) VALUES
(1, 1, '2026-11-01 04:14:08'),
(2, 3, '2026-11-01 08:21:21');

-- --------------------------------------------------------

--
-- Table structure for table `borrow_details`
--

CREATE TABLE `borrow_details` (
  `borrow_detail_id` int(11) NOT NULL,
  `borrow_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1
) ;

--
-- Dumping data for table `borrow_details`
--

INSERT INTO `borrow_details` (`borrow_detail_id`, `borrow_id`, `book_id`, `quantity`) VALUES
(1, 1, 2, 1),
(2, 2, 2, 1),
(3, 3, 2, 1),
(4, 4, 4, 1);

-- --------------------------------------------------------

--
-- Table structure for table `borrow_records`
--

CREATE TABLE `borrow_records` (
  `borrow_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `borrow_date` date NOT NULL,
  `due_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `status` enum('Borrowed','Returned','Overdue') NOT NULL DEFAULT 'Borrowed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `borrow_records`
--

INSERT INTO `borrow_records` (`borrow_id`, `student_id`, `book_id`, `borrow_date`, `due_date`, `return_date`, `status`, `created_at`) VALUES
(1, 1, 2, '2026-10-31', '2026-11-07', '2026-11-01', 'Returned', '2026-11-01 04:34:29'),
(2, 1, 2, '2026-10-31', '2026-11-07', '2026-11-01', 'Returned', '2026-11-01 04:34:59'),
(3, 3, 2, '2026-11-01', '2026-11-08', '2026-11-01', 'Returned', '2026-11-01 08:24:22'),
(4, 3, 4, '2026-11-01', '2026-11-08', '2026-11-02', 'Returned', '2026-11-02 05:21:40');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `category_name`, `description`, `created_at`) VALUES
(1, 'Computer Science', 'Books about computers and technology', '2026-10-31 23:43:00'),
(4, 'dadwa', 'awdadwa', '2026-11-02 03:52:03');

-- --------------------------------------------------------

--
-- Table structure for table `fines`
--

CREATE TABLE `fines` (
  `fine_id` int(11) NOT NULL,
  `borrow_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `reason` varchar(255) NOT NULL,
  `status` enum('Unpaid','Partially Paid','Paid') NOT NULL DEFAULT 'Unpaid',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Table structure for table `fine_payments`
--

CREATE TABLE `fine_payments` (
  `payment_id` int(11) NOT NULL,
  `fine_id` int(11) NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `payment_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `payment_method` varchar(50) DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `publishers`
--

CREATE TABLE `publishers` (
  `publisher_id` int(11) NOT NULL,
  `publisher_name` varchar(150) NOT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  `contact_number` varchar(30) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `publishers`
--

INSERT INTO `publishers` (`publisher_id`, `publisher_name`, `contact_email`, `contact_number`, `address`, `created_at`) VALUES
(6, 'McGraw Hill', 'support@mheducation.com', '+1 800 338 3987', 'New York, USA', '2026-11-01 09:30:44'),
(7, 'wdadwa', 'awdwadw@gmail', 'dwadwadad', 'dwadwa', '2026-11-01 16:51:32');

-- --------------------------------------------------------

--
-- Table structure for table `return_details`
--

CREATE TABLE `return_details` (
  `return_detail_id` int(11) NOT NULL,
  `return_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `quantity_returned` int(11) NOT NULL DEFAULT 1,
  `item_condition` enum('Good','Damaged','Lost') NOT NULL DEFAULT 'Good'
) ;

--
-- Dumping data for table `return_details`
--

INSERT INTO `return_details` (`return_detail_id`, `return_id`, `book_id`, `quantity_returned`, `item_condition`) VALUES
(1, 1, 2, 1, 'Good'),
(2, 2, 2, 1, 'Good'),
(3, 3, 2, 1, 'Damaged'),
(4, 4, 4, 1, 'Good');

-- --------------------------------------------------------

--
-- Table structure for table `return_records`
--

CREATE TABLE `return_records` (
  `return_id` int(11) NOT NULL,
  `borrow_id` int(11) NOT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `return_date` date NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `return_records`
--

INSERT INTO `return_records` (`return_id`, `borrow_id`, `processed_by`, `return_date`, `remarks`, `created_at`) VALUES
(1, 1, NULL, '2026-11-01', NULL, '2026-11-01 06:47:15'),
(2, 2, NULL, '2026-11-01', NULL, '2026-11-01 06:47:18'),
(3, 3, NULL, '2026-11-01', 'Book Cover Torn', '2026-11-01 08:25:56'),
(4, 4, NULL, '2026-11-02', NULL, '2026-11-02 05:21:53');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `student_id` int(11) NOT NULL,
  `student_number` varchar(30) NOT NULL,
  `student_name` varchar(150) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `course` varchar(100) DEFAULT NULL,
  `year_level` varchar(20) DEFAULT NULL,
  `contact_number` varchar(30) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`student_id`, `student_number`, `student_name`, `email`, `course`, `year_level`, `contact_number`, `created_at`) VALUES
(1, '2026-0001', 'Juan Dela Cruz', 'juan.delacruz@example.com', 'BS Information Technology', '1st Year', '09123456789', '2026-11-01 04:13:53'),
(3, '202628825', 'tester2', 'tester2@gmail.com', 'BS Information tech nology', '3rd Year', '09246358456', '2026-11-01 08:15:16'),
(4, 'dawdawd', 'dwadwa', 'awdawda@gmai.com', 'dwadaw', '2nd Year', 'w554564', '2026-11-02 04:58:48');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `description`, `updated_at`) VALUES
(2, 'library_name', 'School Library System', 'Official name of the school library system', '2026-10-31 22:34:58'),
(3, 'overdue_fine_per_day', '5.00', 'Fine charged for each day a book is overdue.', '2026-11-01 01:22:30'),
(4, 'max_borrow_items', '3', 'Maximum number of books a student may borrow.', '2026-11-01 01:22:30'),
(5, 'loan_duration_days', '7', 'Default number of days allowed for borrowing.', '2026-11-01 01:22:30'),
(6, 'max_renewals', '2', 'Maximum number of times a borrowing may be renewed.', '2026-11-01 01:22:30'),
(7, 'low_stock_threshold', '5', 'Minimum available copies before a book is considered low in stock.', '2026-11-01 01:22:30');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_activity_logs_admin` (`admin_id`);

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`book_id`),
  ADD UNIQUE KEY `isbn` (`isbn`),
  ADD KEY `fk_books_category` (`category_id`),
  ADD KEY `fk_books_publisher` (`publisher_id`);

--
-- Indexes for table `borrowers`
--
ALTER TABLE `borrowers`
  ADD PRIMARY KEY (`borrower_id`),
  ADD UNIQUE KEY `student_id` (`student_id`);

--
-- Indexes for table `borrow_details`
--
ALTER TABLE `borrow_details`
  ADD PRIMARY KEY (`borrow_detail_id`),
  ADD KEY `fk_borrow_details_record` (`borrow_id`),
  ADD KEY `fk_borrow_details_book` (`book_id`);

--
-- Indexes for table `borrow_records`
--
ALTER TABLE `borrow_records`
  ADD PRIMARY KEY (`borrow_id`),
  ADD KEY `fk_borrow_records_student` (`student_id`),
  ADD KEY `fk_borrow_records_book` (`book_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`),
  ADD UNIQUE KEY `category_name` (`category_name`);

--
-- Indexes for table `fines`
--
ALTER TABLE `fines`
  ADD PRIMARY KEY (`fine_id`),
  ADD KEY `fk_fines_borrow` (`borrow_id`),
  ADD KEY `fk_fines_student` (`student_id`);

--
-- Indexes for table `fine_payments`
--
ALTER TABLE `fine_payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `fk_payments_fine` (`fine_id`);

--
-- Indexes for table `publishers`
--
ALTER TABLE `publishers`
  ADD PRIMARY KEY (`publisher_id`),
  ADD UNIQUE KEY `publisher_name` (`publisher_name`);

--
-- Indexes for table `return_details`
--
ALTER TABLE `return_details`
  ADD PRIMARY KEY (`return_detail_id`),
  ADD KEY `fk_return_details_record` (`return_id`),
  ADD KEY `fk_return_details_book` (`book_id`);

--
-- Indexes for table `return_records`
--
ALTER TABLE `return_records`
  ADD PRIMARY KEY (`return_id`),
  ADD KEY `fk_return_borrow` (`borrow_id`),
  ADD KEY `fk_return_admin` (`processed_by`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`student_id`),
  ADD UNIQUE KEY `student_number` (`student_number`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `book_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `borrowers`
--
ALTER TABLE `borrowers`
  MODIFY `borrower_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `borrow_details`
--
ALTER TABLE `borrow_details`
  MODIFY `borrow_detail_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `borrow_records`
--
ALTER TABLE `borrow_records`
  MODIFY `borrow_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `fines`
--
ALTER TABLE `fines`
  MODIFY `fine_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fine_payments`
--
ALTER TABLE `fine_payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `publishers`
--
ALTER TABLE `publishers`
  MODIFY `publisher_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `return_details`
--
ALTER TABLE `return_details`
  MODIFY `return_detail_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `return_records`
--
ALTER TABLE `return_records`
  MODIFY `return_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `student_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=248;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `fk_activity_logs_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `books`
--
ALTER TABLE `books`
  ADD CONSTRAINT `fk_books_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_books_publisher` FOREIGN KEY (`publisher_id`) REFERENCES `publishers` (`publisher_id`) ON DELETE SET NULL;

--
-- Constraints for table `borrowers`
--
ALTER TABLE `borrowers`
  ADD CONSTRAINT `fk_borrowers_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON UPDATE CASCADE;

--
-- Constraints for table `borrow_details`
--
ALTER TABLE `borrow_details`
  ADD CONSTRAINT `fk_borrow_details_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`),
  ADD CONSTRAINT `fk_borrow_details_record` FOREIGN KEY (`borrow_id`) REFERENCES `borrow_records` (`borrow_id`) ON DELETE CASCADE;

--
-- Constraints for table `borrow_records`
--
ALTER TABLE `borrow_records`
  ADD CONSTRAINT `fk_borrow_records_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`),
  ADD CONSTRAINT `fk_borrow_records_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`);

--
-- Constraints for table `fines`
--
ALTER TABLE `fines`
  ADD CONSTRAINT `fk_fines_borrow` FOREIGN KEY (`borrow_id`) REFERENCES `borrow_records` (`borrow_id`),
  ADD CONSTRAINT `fk_fines_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`);

--
-- Constraints for table `fine_payments`
--
ALTER TABLE `fine_payments`
  ADD CONSTRAINT `fk_payments_fine` FOREIGN KEY (`fine_id`) REFERENCES `fines` (`fine_id`);

--
-- Constraints for table `return_details`
--
ALTER TABLE `return_details`
  ADD CONSTRAINT `fk_return_details_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`),
  ADD CONSTRAINT `fk_return_details_record` FOREIGN KEY (`return_id`) REFERENCES `return_records` (`return_id`) ON DELETE CASCADE;

--
-- Constraints for table `return_records`
--
ALTER TABLE `return_records`
  ADD CONSTRAINT `fk_return_admin` FOREIGN KEY (`processed_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_return_borrow` FOREIGN KEY (`borrow_id`) REFERENCES `borrow_records` (`borrow_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
