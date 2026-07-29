export interface IFormQuestion {
    id: number;
    type: 'text' | 'paragraph';
    label: string;
    question: string;
    required: boolean;
    minLength?: number;
    maxLength?: number;
}

export interface IFormEmbeds {
    startEmbed?: { title?: string; color?: string; thumbnail?: string };
    questionEmbed?: { title?: string; color?: string; thumbnail?: string };
    reviewEmbed?: { title?: string; color?: string; thumbnail?: string };
}

export interface IFormReviewSettings {
    channelId: string;
    reviewerRoles: string[];
    pingRoles?: string[];
}

export interface IFormActions {
    onApprove: {
        addRoles?: string[];
        removeRoles?: string[];
        sendDM?: boolean;
        logChannelId?: string;
    };
    onReject: {
        cooldownHours?: number;
        sendDM?: boolean;
        logChannelId?: string;
    };
}

export interface IFormRuntime {
    enabled: boolean;
    maxActiveApplications?: number;
}

export interface IForm {
    metadata: {
        id: string;
        title: string;
        description: string;
        version: string;
    };
    button: {
        label: string;
        style: 'Primary' | 'Secondary' | 'Success' | 'Danger';
    };
    embeds?: IFormEmbeds;
    review: IFormReviewSettings;
    actions: IFormActions;
    questions: IFormQuestion[];
    runtime: IFormRuntime;
}