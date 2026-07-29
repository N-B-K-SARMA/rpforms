"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pool_1 = require("../database/pool");
class UserModel {
    static async ensureUser(discordId) {
        const pool = (0, pool_1.getPool)();
        await pool.query('INSERT IGNORE INTO users (discord_id) VALUES (?)', [discordId]);
    }
    static async getUser(discordId) {
        const pool = (0, pool_1.getPool)();
        const [rows] = await pool.query('SELECT * FROM users WHERE discord_id = ?', [discordId]);
        return rows[0];
    }
    static async setCooldown(discordId, cooldownUntil) {
        const pool = (0, pool_1.getPool)();
        await pool.query('UPDATE users SET cooldown_until = ? WHERE discord_id = ?', [
            cooldownUntil,
            discordId,
        ]);
    }
}
exports.default = UserModel;
