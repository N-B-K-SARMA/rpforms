"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = initDatabase;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
const pool_1 = require("./pool");
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
        // 2. Now use the pool which has the database configured
        const pool = (0, pool_1.getPool)();
        // 3. Create tables
        await createTables(pool);
        console.log('✓ Tables Checked');
        return pool;
    }
    catch (error) {
        console.error('Database connection failed. Exiting...');
        console.error(error);
        process.exit(1);
    }
}
async function createTables(pool) {
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
            status ENUM('pending', 'review', 'approved', 'rejected') DEFAULT 'pending',
            staff_channel_id VARCHAR(255) DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (discord_id) REFERENCES users(discord_id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS application_answers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            application_id INT NOT NULL,
            question_id INT NOT NULL,
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
        await pool.query(query);
    }
}
