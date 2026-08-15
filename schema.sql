-- This schema is automatically executed by the bot on startup via src/database/init.js
-- Included here for manual reference

CREATE TABLE IF NOT EXISTS settings (
    `key` VARCHAR(255) PRIMARY KEY,
    `value` TEXT
);

CREATE TABLE IF NOT EXISTS users (
    discord_id VARCHAR(255) PRIMARY KEY,
    active_application_id INT DEFAULT NULL,
    cooldown_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    discord_id VARCHAR(255) NOT NULL,
    status ENUM('pending', 'review', 'approved', 'rejected', 'closed') DEFAULT 'pending',
    staff_channel_id VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (discord_id) REFERENCES users(discord_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS application_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    question_id INT NOT NULL,
    answer_text TEXT,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    UNIQUE KEY unique_answer (application_id, question_id)
);

CREATE TABLE IF NOT EXISTS application_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    discord_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS application_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    reviewer_id VARCHAR(255) NOT NULL,
    decision ENUM('approved', 'rejected', 'review') NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);
