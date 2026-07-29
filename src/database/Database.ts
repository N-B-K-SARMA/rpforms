import { IApplication, IAnswer, IUser, ICreateApplicationInput, ApplicationStatus } from '../interfaces/IDatabaseModels';

export interface IDatabase {
    connect(): Promise<void>;
    query(sql: string, params?: unknown[]): Promise<unknown>;
    insertApplication(data: ICreateApplicationInput): Promise<number>;
    getApplicationById(id: number): Promise<IApplication | undefined>;
    getActiveApplication(discordId: string): Promise<IApplication | undefined>;
    updateApplicationStatus(id: number, status: ApplicationStatus | string, staffChannelId?: string | null): Promise<void>;
    saveAnswer(applicationId: number, questionId: string, answerText: string): Promise<void>;
    getAnswers(applicationId: number): Promise<IAnswer[]>;
    getAnswer(applicationId: number, questionId: string): Promise<IAnswer | undefined>;
    ensureUser(discordId: string): Promise<void>;
    getUser(discordId: string): Promise<IUser | undefined>;
    setUserCooldown(discordId: string, cooldownUntil: Date | null): Promise<void>;
    getApplicationHistory(discordId: string): Promise<IApplication[]>;
    getGlobalStats(): Promise<{ total: number, pending: number, approved: number, rejected: number, closed: number }>;
}