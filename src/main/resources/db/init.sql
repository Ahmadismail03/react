-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS lms;
USE lms;

-- Drop the table if it exists to avoid conflicts
DROP TABLE IF EXISTS notifications;

-- Create notifications table
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    template_name VARCHAR(255),
    template_data TEXT,
    user_id BIGINT,
    INDEX idx_recipient_email (recipient_email),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 