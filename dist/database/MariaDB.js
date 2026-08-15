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
        const [result] = await pool.query('INSERT INTO applications (discord_id, form_id, status) VALUES (?, ?, ?)', [data.discordId, data.formId, IDatabaseModels_1.ApplicationStatus.PENDING]);
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
        // Atomic update: only allow transition if currently in a non-final state (pending or review)
        const [result] = await pool.query('UPDATE applications SET status = ?, staff_channel_id = COALESCE(?, staff_channel_id) WHERE id = ? AND status IN (?, ?)', [status, staffChannelId, id, IDatabaseModels_1.ApplicationStatus.PENDING, IDatabaseModels_1.ApplicationStatus.REVIEW]);
        return result.affectedRows > 0;
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
    async getApplicationHistory(discordId) {
        const pool = (0, pool_1.getPool)();
        const [rows] = await pool.query('SELECT * FROM applications WHERE discord_id = ? ORDER BY created_at DESC', [discordId]);
        return rows;
    }
    async getGlobalStats() {
        const pool = (0, pool_1.getPool)();
        const [rows] = await pool.query('SELECT status, COUNT(*) as count FROM applications GROUP BY status');
        const stats = { total: 0, pending: 0, approved: 0, rejected: 0, closed: 0 };
        for (const row of rows) {
            stats.total += row.count;
            if (row.status === 'pending' || row.status === 'review')
                stats.pending += row.count;
            else if (row.status === 'approved')
                stats.approved += row.count;
            else if (row.status === 'rejected')
                stats.rejected += row.count;
            else if (row.status === 'closed' || row.status === 'cancelled')
                stats.closed += row.count;
        }
        return stats;
    }
}
exports.MariaDB = MariaDB;
