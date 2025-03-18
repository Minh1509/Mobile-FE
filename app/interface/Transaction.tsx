export interface ITransaction {
    id: number;
    date: string;
    amount: string;
    description: string;
    category: string;
    paymentMethod: string;
    notes: string;
    location: string;
}