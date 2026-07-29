export enum ApplicationStatus {
    PENDING = 'pending',
    REVIEW = 'review',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export interface IApplication {
    id: number;
    discord_id: string;
    status: ApplicationStatus | string;
    created_at: Date;
    staff_channel_id?: string | null;
}

export interface IAnswer {
    application_id: number;
    question_id: string;
    answer_text: string;
}

export interface IUser {
    discord_id: string;
    cooldown_until?: Date | null;
}

export interface ICreateApplicationInput {
    discordId: string;
}
