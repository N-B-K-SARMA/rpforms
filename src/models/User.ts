import { getPool } from '../database/pool';

class UserModel {
  static async ensureUser(discordId) {
    const pool = getPool();
    await pool.query('INSERT IGNORE INTO users (discord_id) VALUES (?)', [discordId]);
  }

  static async getUser(discordId) {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM users WHERE discord_id = ?', [discordId]);
    return rows[0];
  }

  static async setCooldown(discordId, cooldownUntil) {
    const pool = getPool();
    await pool.query('UPDATE users SET cooldown_until = ? WHERE discord_id = ?', [
      cooldownUntil,
      discordId,
    ]);
  }
}

export default UserModel;
