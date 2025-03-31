export enum TransactionType {
    EXPENSE = 'expense',
    INCOME = 'income',
}
export interface ITransaction {
    id: string;
    userId: string,
    date: string;
    time: string;
    amount: number;
    description: string;
    category: string;
    paymentMethod: string;
    note: string;
    location: string;
    image: string
    type: TransactionType
}