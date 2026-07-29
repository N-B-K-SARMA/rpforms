import { IDatabase } from './Database';
import { getPool } from './pool';
import { IApplication, IAnswer, IUser, ICreateApplicationInput, ApplicationStatus } from '../interfaces/IDatabaseModels';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class MariaDB implements IDatabase {
    async connect() {}
    async query(sql: string, params?: unknown[]): Promise<unknown> {
        const pool = getPool();
        return await pool.query(sql, params);
    }
    async insertApplication(data: ICreateApplicationInput): Promise<number> {
        const pool = getPool();
        const [result] = await pool.query<ResultSetHeader>('INSERT INTO applications (discord_id, status) VALUES (?, ?)', [data.discordId, ApplicationStatus.PENDING]);
        return result.insertId;
    }
    async getApplicationById(id: number): Promise<IApplication | undefined> {
        const pool = getPool();
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM applications WHERE id = ?', [id]);
        return rows[0] as IApplication | undefined;
    }
    async getActiveApplication(discordId: string): Promise<IApplication | undefined> {
        const pool = getPool();
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM applications WHERE discord_id = ? AND status IN (?, ?)', [discordId, ApplicationStatus.PENDING, ApplicationStatus.REVIEW]);
        return rows[0] as IApplication | undefined;
    }
    async updateApplicationStatus(id: number, status: ApplicationStatus | string, staffChannelId: string | null = null): Promise<void> {
        const pool = getPool();
        await pool.query<ResultSetHeader>('UPDATE applications SET status = ?, staff_channel_id = COALESCE(?, staff_channel_id) WHERE id = ?', [status, staffChannelId, id]);
    }
    async saveAnswer(applicationId: number, questionId: string, answerText: string): Promise<void> {
        const pool = getPool();
        await pool.query<ResultSetHeader>('INSERT INTO application_answers (application_id, question_id, answer_text) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE answer_text = VALUES(answer_text)', [applicationId, questionId, answerText]);
    }
    async getAnswers(applicationId: number): Promise<IAnswer[]> {
        const pool = getPool();
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM application_answers WHERE application_id = ? ORDER BY question_id ASC', [applicationId]);
        return rows as IAnswer[];
    }
    async getAnswer(applicationId: number, questionId: string): Promise<IAnswer | undefined> {
        const pool = getPool();
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM application_answers WHERE application_id = ? AND question_id = ?', [applicationId, questionId]);
        return rows[0] as IAnswer | undefined;
    }
    async ensureUser(discordId: string): Promise<void> {
        const pool = getPool();
        await pool.query<ResultSetHeader>('INSERT IGNORE INTO users (discord_id) VALUES (?)', [discordId]);
    }
    async getUser(discordId: string): Promise<IUser | undefined> {
        const pool = getPool();
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE discord_id = ?', [discordId]);
        return rows[0] as IUser | undefined;
    }
    async setUserCooldown(discordId: string, cooldownUntil: Date | null): Promise<void> {
        const pool = getPool();
        await pool.query<ResultSetHeader>('UPDATE users SET cooldown_until = ? WHERE discord_id = ?', [cooldownUntil, discordId]);
    }
    async getApplicationHistory(discordId: string): Promise<IApplication[]> {
        const pool = getPool();
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM applications WHERE discord_id = ? ORDER BY created_at DESC', [discordId]);
        return rows as IApplication[];
    }
    async getGlobalStats(): Promise<{ total: number, pending: number, approved: number, rejected: number, closed: number }> {
        const pool = getPool();
        const [rows] = await pool.query<RowDataPacket[]>('SELECT status, COUNT(*) as count FROM applications GROUP BY status');
        const stats = { total: 0, pending: 0, approved: 0, rejected: 0, closed: 0 };
        for (const row of rows) {
            stats.total += row.count;
            if (row.status === 'pending' || row.status === 'review') stats.pending += row.count;
            else if (row.status === 'approved') stats.approved += row.count;
            else if (row.status === 'rejected') stats.rejected += row.count;
            else if (row.status === 'closed' || row.status === 'cancelled') stats.closed += row.count;
        }
        return stats;
    }
}
