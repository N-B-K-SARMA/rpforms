export interface IDatabase {
    connect(): Promise<void>;
    query(sql: string, params?: any[]): Promise<any>;
}