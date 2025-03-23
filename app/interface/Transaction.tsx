export interface ITransaction {
    id: number;
    date: string;
    time: string;
    amount: string;
    description: string;
    category: string;
    paymentMethod: string;
    notes: string;
    location: string;
    image: string
}