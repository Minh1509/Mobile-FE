export enum TransactionType {
    EXPENSE = 'expense',
    INCOME = 'income',
}
export enum PayMethod {
    CASH = "cash",
    CARD = "card",
    BANK_TRANSFER = "bank_transfer",
}
export interface ITransaction {
    id: string;
    userId: string,
    date: string;
    time: string;  
    amount: number;
    description: string;
    category: string;
    paymentMethod: PayMethod;
    note: string;
    location: string;
    image: string;
    type: TransactionType;
    createdAt?: string; // Thêm createdAt (tùy chọn vì được tạo tự động)
    updatedAt?: string; // Thêm updatedAt (tùy chọn vì được tạo tự động)
}