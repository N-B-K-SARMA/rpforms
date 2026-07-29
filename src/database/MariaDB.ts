import { IDatabase } from './Database';
import { getPool } from './pool';
export class MariaDB implements IDatabase {
    async connect() {}
    async query(sql: string, params?: any[]): Promise<any> {
        const pool = getPool();
        return await pool.query(sql, params);
    }
}