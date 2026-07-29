"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MariaDB = void 0;
const pool_1 = require("./pool");
const IDatabaseModels_1 = require("../interfaces/IDatabaseModels");
class MariaDB {
    async connect() { }
    async query(sql, params) {
        const pool = (0, pool_1.getPool)();
        return await pool.query(sql, params);
    }
    async insertApplication(data) {
        const pool = (0, pool_1.getPool)();
        const [result] = await pool.query('INSERT INTO applications (discord_id, status) VALUES (?, ?)', [data.discordId, IDatabaseModels_1.ApplicationStatus.PENDING]);
        return result.insertId;
    }
    async getApplicationById(id) {
        const pool = (0, pool_1.getPool)();
        const [rows] = await pool.query('SELECT * FROM applications WHERE id = ?', [id]);
        return rows[0];
    }
    async getActiveApplication(discordId) {
        const pool = (0, pool_1.getPool)();
        const [rows] = await pool.query('SELECT * FROM applications WHERE discord_id = ? AND status IN (?, ?)', [discordId, IDatabaseModels_1.ApplicationStatus.PENDING, IDatabaseModels_1.ApplicationStatus.REVIEW]);
        return rows[0];
    }
    async updateApplicationStatus(id, status, staffChannelId = null) {
        const pool = (0, pool_1.getPool)();
        await pool.query('UPDATE applications SET status = ?, staff_channel_id = COALESCE(?, staff_channel_id) WHERE id = ?', [status, staffChannelId, id]);
    }
    async saveAnswer(applicationId, questionId, answerText) {
        const pool = (0, pool_1.getPool)();
        await pool.query('INSERT INTO application_answers (application_id, question_id, answer_text) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE answer_text = VALUES(answer_text)', [applicationId, questionId, answerText]);
    }
    async getAnswers(applicationId) {
        const pool = (0, pool_1.getPool)();
        const [rows] = await pool.query('SELECT * FROM application_answers WHERE application_id = ? ORDER BY question_id ASC', [applicationId]);
        return rows;
    }
    async getAnswer(applicationId, questionId) {
        const pool = (0, pool_1.getPool)();
        const [rows] = await pool.query('SELECT * FROM application_answers WHERE application_id = ? AND question_id = ?', [applicationId, questionId]);
        return rows[0];
    }
    async ensureUser(discordId) {
        const pool = (0, pool_1.getPool)();
        await pool.query('INSERT IGNORE INTO users (discord_id) VALUES (?)', [discordId]);
    }
    async getUser(discordId) {
        const pool = (0, pool_1.getPool)();
        const [rows] = await pool.query('SELECT * FROM users WHERE discord_id = ?', [discordId]);
        return rows[0];
    }
    async setUserCooldown(discordId, cooldownUntil) {
        const pool = (0, pool_1.getPool)();
        await pool.query('UPDATE users SET cooldown_until = ? WHERE discord_id = ?', [cooldownUntil, discordId]);
    }
}
exports.MariaDB = MariaDB;
