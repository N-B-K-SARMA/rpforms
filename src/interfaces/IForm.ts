export interface IFormQuestion {
    id: number;
    question: string;
    required: boolean;
}
export interface IForm {
    id: string;
    title: string;
    description: string;
    button: { label: string; style: string; };
    questions: IFormQuestion[];
    review: { channelId: string; reviewerRoles: string[]; };
    roles: { onApprove: string[]; onRejectRemove: string[]; };
    logging: { approvedChannelId: string; rejectedChannelId: string; };
    cooldown: number;
}