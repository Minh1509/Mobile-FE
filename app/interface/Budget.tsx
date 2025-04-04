interface Budget {
    id?: string;
    userId: string;
    amountLimit: number;
    category: string;
    note: string;
    startDate: string;
    endDate: string;
}