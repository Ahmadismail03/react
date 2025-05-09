-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 29, 2025 at 12:56 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lms`
--

-- --------------------------------------------------------

--
-- Table structure for table `assessment`
--

CREATE TABLE `assessment` (
  `assessment_id` bigint(20) NOT NULL,
  `course_id` bigint(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` enum('QUIZ','ASSIGNMENT') DEFAULT NULL,
  `total_marks` int(11) DEFAULT NULL,
  `questions` varchar(255) DEFAULT NULL,
  `answers` varchar(255) DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `instructions` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `content`
--

CREATE TABLE `content` (
  `content_id` bigint(20) NOT NULL,
  `course_id` bigint(20) NOT NULL,
  `type` enum('PDF','VIDEO','QUIZ','LINK','TEXT','AUDIO','IMAGE','PRESENTATION','DOCUMENT','OTHER') NOT NULL,
  `url_file_location` varchar(255) NOT NULL COMMENT 'URL or file path to the content',
  `upload_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `file_size` bigint(20) DEFAULT NULL COMMENT 'Size in bytes',
  `file_type` varchar(50) DEFAULT NULL COMMENT 'MIME type of the file',
  `description` text DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `order_index` int(11) DEFAULT 0 COMMENT 'For ordering content within a course'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Stores course content materials';

-- --------------------------------------------------------

--
-- Table structure for table `course`
--

CREATE TABLE `course` (
  `course_id` bigint(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `instructor_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

-- Removed duplicate courses table

-- --------------------------------------------------------

--
-- Table structure for table `enrollment`
--

CREATE TABLE `enrollment` (
  `enrollment_id` bigint(20) NOT NULL,
  `student_id` bigint(20) NOT NULL,
  `course_id` bigint(20) NOT NULL,
  `enrollment_date` date NOT NULL,
  `progress` float DEFAULT NULL,
  `completion_status` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

-- Removed duplicate notification table

-- --------------------------------------------------------

--
-- Table structure for table `notification` (renamed from notifications for consistency)
--

CREATE TABLE `notification` (
  `notification_id` bigint(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_read` bit(1) NOT NULL,
  `message` text NOT NULL,
  `recipient_email` varchar(255) NOT NULL,
  `status` enum('PENDING','SENT','READ','DELETED') NOT NULL,
  `template_data` text DEFAULT NULL,
  `template_name` varchar(100) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL COMMENT 'Notification type (e.g., COURSE_UPDATE, ASSESSMENT, SYSTEM)',
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Stores system notifications for users';

--
-- Dumping data for table `notification`
--

INSERT INTO `notification` (`notification_id`, `created_at`, `is_read`, `message`, `recipient_email`, `status`, `template_data`, `template_name`, `title`, `type`, `updated_at`, `user_id`) VALUES
(1, '2025-03-28 14:06:10.000000', b'1', 'This is a test notification', 'tEwvevefxvxsbst@example.com', 'PENDING', '{}', 'test_template', 'Test Notification', 'TEST', '2025-03-28 14:23:06.000000', 36),
(3, '2025-03-28 14:17:54.000000', b'0', 'This is a test notification', 'tEwvevefxvxsbst@example.com', 'PENDING', '{}', 'test_template', 'Test Notification', 'TEST', '2025-03-28 14:17:54.000000', 36),
(4, '2025-03-28 14:48:42.000000', b'0', 'Test', 'tEwvevefxvxsbst@example.com', 'PENDING', NULL, NULL, 'Test', 'TEST', '2025-03-28 14:48:42.000000', NULL),
(5, '2025-03-28 14:54:26.000000', b'0', 'New content has been added to your course', 'tEwvevefxvxsbst@example.com', 'PENDING', '{\"courseName\": \"Java Programming\", \"updateType\": \"New Content\"}', 'course-update-notification', 'Course Update', 'COURSE_UPDATE', '2025-03-28 14:54:26.000000', 36),
(6, '2025-03-28 20:12:44.000000', b'0', 'Test', 'tEwvevefxvxsbst@example.com', 'PENDING', NULL, NULL, 'Test', 'TEST', '2025-03-28 20:12:44.000000', NULL),
(7, '2025-03-28 20:17:58.000000', b'0', 'New content has been added to your course', 'tEwvevefxvxsbst@example.com', 'PENDING', '{\"courseName\": \"Java Programming\", \"updateType\": \"New Content\"}', 'course-update-notification', 'Course Update', 'COURSE_UPDATE', '2025-03-28 20:17:58.000000', 36),
(8, '2025-03-28 20:24:26.000000', b'0', 'Test', 'tEwvevefxvxsbst@example.com', 'PENDING', NULL, NULL, 'Test', 'TEST', '2025-03-28 20:24:26.000000', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `profile`
--

CREATE TABLE `profile` (
  `profile_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `profile_picture_url` varchar(255) DEFAULT NULL,
  `bio` varchar(255) DEFAULT NULL,
  `social_links` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `profile`
--

INSERT INTO `profile` (`profile_id`, `user_id`, `profile_picture_url`, `bio`, `social_links`) VALUES
(1, 2, NULL, NULL, NULL),
(2, 3, NULL, NULL, NULL),
(3, 4, NULL, NULL, NULL),
(4, 5, NULL, NULL, NULL),
(5, 6, NULL, NULL, NULL),
(6, 7, NULL, NULL, NULL),
(7, 8, NULL, NULL, NULL),
(8, 9, NULL, NULL, NULL),
(9, 10, NULL, NULL, NULL),
(10, 11, NULL, NULL, NULL),
(11, 12, NULL, NULL, NULL),
(12, 13, NULL, NULL, NULL),
(13, 14, NULL, NULL, NULL),
(14, 15, NULL, NULL, NULL),
(15, 16, NULL, NULL, NULL),
(16, 17, NULL, NULL, NULL),
(17, 18, NULL, NULL, NULL),
(18, 19, NULL, NULL, NULL),
(19, 20, NULL, NULL, NULL),
(20, 21, NULL, NULL, NULL),
(21, 22, NULL, NULL, NULL),
(22, 23, NULL, NULL, NULL),
(23, 24, NULL, NULL, NULL),
(24, 25, NULL, NULL, NULL),
(25, 26, NULL, NULL, NULL),
(26, 27, NULL, NULL, NULL),
(27, 28, NULL, NULL, NULL),
(28, 29, NULL, NULL, NULL),
(29, 30, NULL, NULL, NULL),
(30, 31, NULL, NULL, NULL),
(31, 32, NULL, NULL, NULL),
(32, 33, NULL, NULL, NULL),
(33, 34, NULL, NULL, NULL),
(34, 35, NULL, NULL, NULL),
(35, 36, NULL, NULL, NULL),
(36, 37, NULL, NULL, NULL),
(37, 38, NULL, NULL, NULL),
(38, 39, NULL, NULL, NULL),
(39, 40, NULL, NULL, NULL),
(40, 41, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `progress`
--

CREATE TABLE `progress` (
  `progress_id` bigint(20) NOT NULL,
  `student_id` bigint(20) NOT NULL,
  `content_id` bigint(20) NOT NULL,
  `last_access_date` datetime DEFAULT NULL,
  `time_spent_minutes` int(11) DEFAULT NULL,
  `is_completed` tinyint(1) DEFAULT NULL,
  `completion_percentage` float DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quiz_answer`
--

CREATE TABLE `quiz_answer` (
  `answer_id` bigint(20) NOT NULL,
  `correct_answer` varchar(255) DEFAULT NULL,
  `question` varchar(255) DEFAULT NULL,
  `assessment_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `refresh_token`
--

CREATE TABLE `refresh_token` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expiry_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `refresh_token`
--

INSERT INTO `refresh_token` (`id`, `user_id`, `token`, `expiry_date`) VALUES
(1, 23, '8e6ee117-5bf1-4f12-9f6e-819cb9b21ce4', '2025-04-04 00:43:04'),
(2, 24, 'd0d6cda7-9924-4a82-b6f0-67a07a7d5aac', '2025-04-04 00:45:57'),
(3, 25, 'd36064d4-b171-4bac-89ba-728c77070a8b', '2025-04-04 01:13:53'),
(4, 22, '5c4cedb7-3770-4272-9749-9fb8f838b972', '2025-04-04 10:47:53'),
(5, 28, 'e845cf77-2fe0-478c-8e1f-939e1766fdc5', '2025-04-04 11:26:19'),
(6, 31, '49019186-b671-45a9-a45e-e48dbe2b5ed0', '2025-04-04 11:44:54'),
(7, 32, '89474d6a-8fad-451f-ac22-341ed27bbe81', '2025-04-04 11:51:22'),
(8, 33, 'b368a7ef-e34f-4a35-9b06-cfea7fbee030', '2025-04-04 11:53:11'),
(9, 34, 'f58b0379-caab-41ba-95d1-998fba96b26a', '2025-04-04 11:53:55'),
(10, 35, '10c8723b-8b08-42f9-b243-7c89bccde4e0', '2025-04-04 12:01:54'),
(19, 36, 'fdf63a09-d1e9-4a21-b9dd-609bf1b43b4f', '2025-04-04 15:09:17'),
(20, 37, '6578ac5c-45d0-40fb-8ed4-e1b72e59bb4b', '2025-04-04 20:22:48'),
(21, 39, 'e6810f66-21fd-46f6-93fd-f005b145ab8d', '2025-04-04 22:37:08'),
(26, 41, 'bd28f5c6-6db5-4c02-bf2e-a7ff6e9cc475', '2025-04-04 23:28:25');

-- --------------------------------------------------------

--
-- Table structure for table `student_answers`
--

CREATE TABLE `student_answers` (
  `submission_id` bigint(20) NOT NULL,
  `answer` varchar(255) DEFAULT NULL,
  `question` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `submission`
--

CREATE TABLE `submission` (
  `submission_id` bigint(20) NOT NULL,
  `student_id` bigint(20) NOT NULL,
  `assessment_id` bigint(20) NOT NULL,
  `submission_date` date NOT NULL,
  `score` float DEFAULT NULL,
  `content` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('STUDENT','INSTRUCTOR','ADMIN') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `password`, `role`, `profile_picture_url`, `bio`) VALUES
(1, 'Sohayb Hajjaj', '202201756@bethlehem.edu', '', 'STUDENT', NULL, NULL),
(2, ' Name', 'admin@xatmpTUle.com', '$2a$10$xffrVF4R2QFG8j3QAAhtwePYPe29EmL.4BmKNBnnfVi3AbCtW4Km6', 'STUDENT', NULL, NULL),
(3, ' Name', 'admin@xatmptTUle.com', '$2a$10$7O5UxLedwCa5YMiEUnEvmO92wxajHnQdD1qtZiK/979Q/rqwY.yZW', 'STUDENT', NULL, NULL),
(4, ' Name', 'admaain@xatmptTUle.com', '$2a$10$zhOFyifbKO6gIwc4uoRLuu07p/mn4hdwATlXpPPQNJt37eq/QeDHe', 'STUDENT', NULL, NULL),
(5, ' Name', 'admnaain@xatmptTUle.com', '$2a$10$kcmX2sGD7jP39l.13yQx2OEoVzmqlED6/hOpHYGbiw07Mt9nReQJO', 'STUDENT', NULL, NULL),
(6, ' Name', 'admnaain@xatmptkTUle.com', '$2a$10$wCwPt947Kv6WD45PlDdjpevEmQjeVB026nXITY3TrkPx0kZurgnWe', 'STUDENT', NULL, NULL),
(7, ' Name', 'admnaain@xatmptkTggUle.com', '$2a$10$ai4cvwlQCiqZB2/iKxmRX.yJXoeQJNrA.dUiMT62TnJMGM3qW8mLO', 'STUDENT', NULL, NULL),
(8, ' Name', 'admnaain@xatmptkTeggUle.com', '$2a$10$TMKXShYgKmE8Gj0pfiMHCO7h6FHTkaIG14RJKjgc2kI4fPF9nsTke', 'STUDENT', NULL, NULL),
(9, ' Name', 'admnaain@xatmptykTeggUle.com', '$2a$10$ILJH/xml4xGcfqBKE220hexKEAuXm6CxKxXI0JgnBAwuDcl39koRm', 'STUDENT', NULL, NULL),
(10, ' Name', 'admnaain@xatmpftykTeggUle.com', '$2a$10$FhbiVyvg5sSZFMwntiMp3uqJzDBD8zb69SVH.qpbr1AU2luB5mDrC', 'STUDENT', NULL, NULL),
(11, ' Name', 'admnaain@xatmpftccykTeggUle.com', '$2a$10$iLnxoLBM2aI.44dMdx6fZOkpJIa8lX/ZvlD1q4P8V85coXBDvPRw2', 'STUDENT', NULL, NULL),
(12, 'Your Name', 'your-email@example.com', '$2a$10$nrTCjeq6PWsBFPsUa8yJFeRUbxM9XsQZBSvBFHOC8kyedT0TucEPC', 'STUDENT', NULL, NULL),
(13, 'Test User', 'test@example.com', '$2a$10$quNVKbbcvmmKg0arYG.XBueaps9NALRQqRwxb3H1stPTpdLkaOw/S', 'STUDENT', NULL, NULL),
(14, 'Test User', 'test@exxample.com', '$2a$10$Bx.XsRhXhaauT5Lq6eDKiOYgEJ6C1Fh0rToZ6O.cXbvsOHo1//iAC', 'STUDENT', NULL, NULL),
(15, 'Test User', 'test@eexample.com', '$2a$10$QhxcKC6Y3RR7kONC5lWV7.cnC0VNf2FDbOoI3OTzkg3BQdq6cOK9W', 'STUDENT', NULL, NULL),
(16, 'Test User', 'test@eexamvvple.com', '$2a$10$R8Lr.MfiLDrcDFFV30MzzuxgEBj0Jjo5gW/Y0.yl2OW7wKofR1oBm', 'STUDENT', NULL, NULL),
(17, 'Test User', 'testnn@eexnnnnnnnnamvvple.com', '$2a$10$lgb.6fhvI2PKn6mLiD1LZumxieoYpKxJG2.LBjyIM/ycltHbXcM9C', 'STUDENT', NULL, NULL),
(18, 'Test User', 'testnn@eexnnnnnnnnvvamvvple.com', '$2a$10$./IgWB9cRb2OyCG.tIXO3e8hVMRoJc.gi2TTW5z6VIsjdeLrvLute', 'STUDENT', NULL, NULL),
(19, 'Test User', 'teest@example.com', '$2a$10$sXpFmIbI8vSbQfyVbNrIQ.PZJlwz1WgyvEfc7WeeiOWfPbbT3bsEy', 'STUDENT', NULL, NULL),
(20, 'Test User', 'teest@exxample.com', '$2a$10$VlGlE2en4FmrXhnSxQ3XZOXkyCl2f0h.enfFxcVSHqoRFmKSzbwne', 'STUDENT', NULL, NULL),
(21, 'Test User', 'teest@examppple.com', '$2a$10$CYMsi5Ys8aFeb5NMGgeBdubFhI.dlRiIPsh2/5LpmFLolCJbpdvO.', 'STUDENT', NULL, NULL),
(22, 'Test User', 'teest@exabmppple.com', '$2a$10$zrQr7YfhZfbfgXaa1xd7h.A4wajpbMws8UGep9xOrCNZ6VZpIADw.', 'STUDENT', NULL, NULL),
(23, 'New User', 'newuser@example.com', '$2a$10$u4FBief/slmwhQOZRo9qLur.n4uh0K/4hGoTzv66BgF6liq1PlMNa', 'STUDENT', NULL, NULL),
(24, 'New User', 's@example.com', '$2a$10$0.TBhOmjhuAt62/ML0Hk7.gcdyQTb14CO/NF1.Er5peySMcZ2Vf8W', 'STUDENT', NULL, NULL),
(25, 'New User', 's@exammple.com', '$2a$10$VIGCIBnb8nHaR4uZ2nmyuuoAhM.iaBpjkvYXfoBAViFP.YohtKONi', 'STUDENT', NULL, NULL),
(26, 'Test User', 'tecst@example.com', '$2a$10$dqsMVIITh9qyPCX3vMMj8e5GSUlUBuq5zTfZzEmNn9PxxA1R/i0zK', 'STUDENT', NULL, NULL),
(27, 'Test User', 'tefst@example.com', '$2a$10$rFogGgMBkzZsYjIQMysZzeWhrAdMtycV8Cv/npl3bjZZNeSYFSGiy', 'STUDENT', NULL, NULL),
(28, 'Test User', 'teefst@example.com', '$2a$10$2m1rO0wo6kJCGjLnUlHITeIxAL6FwP1Bmit//ebTipK1fcE4Dg3Ua', 'STUDENT', NULL, NULL),
(29, 'Test User', 'tweefst@example.com', '$2a$10$TsmHrRefMx0stpkYo6IOJe9N.GSX.vCzjvBO4g2UMBtvsP2bQLy02', 'STUDENT', NULL, NULL),
(30, 'Test User', 'tweefsst@example.com', '$2a$10$10azDcQvc4fo1OB8d/qNGuBpivGf5PfF/KZUhTsAugdMXB4H6CTfq', 'STUDENT', NULL, NULL),
(31, 'Test User', 'tEweefsst@example.com', '$2a$10$VycSL3HEPCrsjnu86sTN.e62yHswgiyzurwGT0/5i6XXlcKPh43k6', 'ADMIN', NULL, NULL),
(32, 'Test User', 'tEweefxxsst@example.com', '$2a$10$bSSGm8wD67Sxgk3dX8fzTu/TBtpS1FFA7S14vK17hmDaGNqW264pq', 'ADMIN', NULL, NULL),
(33, 'Test User', 'tEweefxvxsst@example.com', '$2a$10$6zd9hSccYg2HZBw0zxLgmuM9RdyhzHYnWTD/a.SXQGuMFIStARKqK', 'ADMIN', NULL, NULL),
(34, 'Test User', 'tEweefxvxsbst@example.com', '$2a$10$KiTlrCn4pabAMaDCJsLHF.dFo7nDJopjyD7jCB9yx0Zk4WXJyQkIi', 'ADMIN', NULL, NULL),
(35, 'Test User', 'tEwevefxvxsbst@example.com', '$2a$10$VSbo/vFn//aCoKDC0eeX..C18gK5EGfzsLmyLl7aO3yYEBLCmbte6', 'ADMIN', NULL, NULL),
(36, 'Test User', 'tEwvevefxvxsbst@example.com', '$2a$10$5BwXk7On1TCcj.XnTSeWZe18eDT.Ksf9MddNsocVPkenKYUNRQ7Yq', 'ADMIN', NULL, NULL),
(37, 'Test User', 'tEwvevefxvxsbsvvvvvvvvvvvvvvvvvvvvt@example.com', '$2a$10$oxulW66Am.VmXWqVY0GU2.SFtMvwjK1HP8rt6htJRIbmnLpWb8isC', 'ADMIN', NULL, NULL),
(38, 'Test User', 'tEwvevefxvxsbbsvvvvvvvvvvvvvvvvvvvvt@example.com', '$2a$10$zVDxcBFrm1.3p.BC4fXtb.IlLVhFyGXl3Q5KOKdYAARA2qkInm9rS', 'ADMIN', NULL, NULL),
(39, 'Test User', 'tEwvevefxvxsbbsvvvvvvvvvvvvvvvvvvvvt@examplle.com', '$2a$10$IBheOsu3aEklgejTs.UDT.4NSyEPfjfm8T04FrxJJ0c5M1LJCF4YS', 'ADMIN', NULL, NULL),
(40, 'Your Name', 'your.email@example.com', '$2a$10$NmN54lp/drdCPNgIgRhrx.w7URlWaULOjDh3Htg9cPMaf2YgeYOj.', 'STUDENT', NULL, NULL),
(41, 'Your Name', 'your.ematil@example.com', '$2a$10$lVGm1G3ESKwA92vzzMR8IuuXDRvoyCsHpWYEDlYJliP4iUjC.4XUW', 'STUDENT', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assessment`
--
ALTER TABLE `assessment`
  ADD PRIMARY KEY (`assessment_id`),
  ADD KEY `FKf2mktypg4yafhffstgmgc2pjv` (`course_id`);

--
-- Indexes for table `content`
--
ALTER TABLE `content`
  ADD PRIMARY KEY (`content_id`),
  ADD KEY `FKnw3d5ahmoqru643q6501bbt6n` (`course_id`);

--
-- Indexes for table `course`
--
ALTER TABLE `course`
  ADD PRIMARY KEY (`course_id`),
  ADD KEY `idx_course_instructor` (`instructor_id`);

-- Removed indexes for deleted courses table

--
-- Indexes for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD PRIMARY KEY (`enrollment_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `FK7ofybdo2o0ngc4de3uvx4dxqv` (`course_id`);

-- Removed indexes for deleted notification table

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `FK_notification_user` (`user_id`);

--
-- Indexes for table `profile`
--
ALTER TABLE `profile`
  ADD PRIMARY KEY (`profile_id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `progress`
--
ALTER TABLE `progress`
  ADD PRIMARY KEY (`progress_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `content_id` (`content_id`);

--
-- Indexes for table `quiz_answer`
--
ALTER TABLE `quiz_answer`
  ADD PRIMARY KEY (`answer_id`),
  ADD KEY `FK11lpwhyumh5e70pftbcnodqkd` (`assessment_id`);

--
-- Indexes for table `refresh_token`
--
ALTER TABLE `refresh_token`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_refresh_token_expiry` (`expiry_date`);

--
-- Indexes for table `student_answers`
--
ALTER TABLE `student_answers`
  ADD PRIMARY KEY (`submission_id`,`question`);

--
-- Indexes for table `submission`
--
ALTER TABLE `submission`
  ADD PRIMARY KEY (`submission_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `assessment_id` (`assessment_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_user_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `assessment`
--
ALTER TABLE `assessment`
  MODIFY `assessment_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `content`
--
ALTER TABLE `content`
  MODIFY `content_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course`
--
ALTER TABLE `course`
  MODIFY `course_id` bigint(20) NOT NULL AUTO_INCREMENT;

-- Removed AUTO_INCREMENT for deleted courses table

--
-- AUTO_INCREMENT for table `enrollment`
--
ALTER TABLE `enrollment`
  MODIFY `enrollment_id` bigint(20) NOT NULL AUTO_INCREMENT;

-- Removed AUTO_INCREMENT for deleted notification table

--
-- AUTO_INCREMENT for table `notification`
--
ALTER TABLE `notification`
  MODIFY `notification_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `profile`
--
ALTER TABLE `profile`
  MODIFY `profile_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `progress`
--
ALTER TABLE `progress`
  MODIFY `progress_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quiz_answer`
--
ALTER TABLE `quiz_answer`
  MODIFY `answer_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `refresh_token`
--
ALTER TABLE `refresh_token`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `submission`
--
ALTER TABLE `submission`
  MODIFY `submission_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assessment`
--
ALTER TABLE `assessment`
  ADD CONSTRAINT `FKf2mktypg4yafhffstgmgc2pjv` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`),
  ADD CONSTRAINT `assessment_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE;

--
-- Constraints for table `content`
--
ALTER TABLE `content`
  ADD CONSTRAINT `FKnw3d5ahmoqru643q6501bbt6n` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`),
  ADD CONSTRAINT `content_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE;

--
-- Constraints for table `course`
--
ALTER TABLE `course`
  ADD CONSTRAINT `course_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `FKcyfum8goa6q5u13uog0563gyp` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD CONSTRAINT `FK7ofybdo2o0ngc4de3uvx4dxqv` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`),
  ADD CONSTRAINT `enrollment_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollment_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE;

--
-- Constraints for table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `FK9y21adhxn0ayjhfocscqox7bh` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `profile`
--
ALTER TABLE `profile`
  ADD CONSTRAINT `profile_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `progress`
--
ALTER TABLE `progress`
  ADD CONSTRAINT `progress_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `progress_ibfk_2` FOREIGN KEY (`content_id`) REFERENCES `content` (`content_id`) ON DELETE CASCADE;

--
-- Constraints for table `quiz_answer`
--
ALTER TABLE `quiz_answer`
  ADD CONSTRAINT `FK11lpwhyumh5e70pftbcnodqkd` FOREIGN KEY (`assessment_id`) REFERENCES `assessment` (`assessment_id`);

--
-- Constraints for table `refresh_token`
--
ALTER TABLE `refresh_token`
  ADD CONSTRAINT `refresh_token_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `student_answers`
--
ALTER TABLE `student_answers`
  ADD CONSTRAINT `FKogr9r6oauxnhtnyxf2l6r3tps` FOREIGN KEY (`submission_id`) REFERENCES `submission` (`submission_id`);

--
-- Constraints for table `submission`
--
ALTER TABLE `submission`
  ADD CONSTRAINT `submission_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `submission_ibfk_2` FOREIGN KEY (`assessment_id`) REFERENCES `assessment` (`assessment_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- Table structure for table `module`
CREATE TABLE `module` (
  `module_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `course_id` bigint(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`module_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `module_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Stores course modules';

-- Add module_id to content table
ALTER TABLE `content` ADD COLUMN `module_id` bigint(20) DEFAULT NULL AFTER `course_id`;
ALTER TABLE `content` ADD CONSTRAINT `content_ibfk_2` FOREIGN KEY (`module_id`) REFERENCES `module` (`module_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
