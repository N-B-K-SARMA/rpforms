"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pool_1 = require("../database/pool");
class ApplicationModel {
    static async createApplication(discordId) {
        const pool = (0, pool_1.getPool)();
        const [result] = await pool.query('INSERT INTO applications (discord_id, status) VALUES (?, ?)', [discordId, 'pending']);
        return result.insertId;
    }
    static async getApplicationById(id) {
        const pool = (0, pool_1.getPool)();
        const [rows] = await pool.query('SELECT * FROM applications WHERE id = ?', [id]);
        return rows[0];
    }
    static async getActiveApplication(discordId) {
        const pool = (0, pool_1.getPool)();
        const [rows] = await pool.query('SELECT * FROM applications WHERE discord_id = ? AND status IN ("pending", "review")', [discordId]);
        return rows[0];
    }
    static async updateStatus(id, status, staffChannelId = null) {
        const pool = (0, pool_1.getPool)();
        await pool.query('UPDATE applications SET status = ?, staff_channel_id = COALESCE(?, staff_channel_id) WHERE id = ?', [status, staffChannelId, id]);
    }
}
exports.default = ApplicationModel;
