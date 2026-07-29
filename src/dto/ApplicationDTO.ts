export interface StartApplicationRequest {
    userId: string;
    formId: string;
}

export interface ShowQuestionRequest {
    userId: string;
    appId: number;
    qIndex: number;
}

export interface AnswerQuestionRequest {
    userId: string;
    appId: number;
    qIndex: number;
    answerText: string;
}

export interface StaffActionRequest {
    appId: number;
    action: string;
    staffId: string;
    reason?: string;
}
