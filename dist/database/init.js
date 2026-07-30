"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = initDatabase;
const RPForms_1 = require("../core/RPForms");
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function initDatabase() {
    try {
        // 1. Connect without selecting database to ensure the database exists
        const connection = await promise_1.default.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });
        console.log('✓ Connected to MariaDB');
        const dbName = process.env.DB_NAME || 'daddys_roleplay';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log('✓ Database Ready');
        await connection.end();
        // 2. Initialize connection in our abstraction (pool is auto-initialized internally via core module if needed)
        // 3. Create tables
        await createTables();
        console.log('✓ Tables Checked');
    }
    catch (error) {
        console.error('Database connection failed. Exiting...');
        console.error(error);
        process.exit(1);
    }
}
async function createTables() {
    const queries = [
        `CREATE TABLE IF NOT EXISTS settings (
            \`key\` VARCHAR(255) PRIMARY KEY,
            \`value\` TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS users (
            discord_id VARCHAR(255) PRIMARY KEY,
            active_application_id INT DEFAULT NULL,
            cooldown_until TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS applications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            discord_id VARCHAR(255) NOT NULL,
            form_id VARCHAR(255) NOT NULL DEFAULT 'allowlist',
            status ENUM('pending', 'review', 'approved', 'rejected') DEFAULT 'pending',
            staff_channel_id VARCHAR(255) DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (discord_id) REFERENCES users(discord_id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS application_answers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            application_id INT NOT NULL,
            question_id VARCHAR(255) NOT NULL,
            answer_text TEXT,
            FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
            UNIQUE KEY unique_answer (application_id, question_id)
        )`,
        `CREATE TABLE IF NOT EXISTS application_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            application_id INT NOT NULL,
            action VARCHAR(255) NOT NULL,
            discord_id VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS application_reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            application_id INT NOT NULL,
            reviewer_id VARCHAR(255) NOT NULL,
            decision ENUM('approved', 'rejected', 'review') NOT NULL,
            reason TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
        )`,
    ];
    for (const query of queries) {
        await RPForms_1.RPForms.database.query(query);
    }
    // Patch existing tables gracefully
    try {
        await RPForms_1.RPForms.database.query(`ALTER TABLE applications ADD COLUMN form_id VARCHAR(255) NOT NULL DEFAULT 'allowlist'`);
        console.log('✓ Patched applications table with form_id');
    }
    catch (e) {
        // Ignore duplicate column errors (Code 1060)
        if (e.code !== 'ER_DUP_FIELDNAME') {
            console.warn('Note: Could not patch form_id column (it may already exist or database is locked).');
        }
    }
}
