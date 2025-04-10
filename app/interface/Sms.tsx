export interface ParsedSms {
    bankName: string;
    accountNumber: string | null;
    amount: number | null;
    type: 'income' | 'expense' | null;
    description: string;
    time: string | null;
    date: string | null;
    read: boolean;
    originalMessage: string;
}