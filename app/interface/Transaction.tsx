import { FieldValue } from "firebase/firestore";

export enum TransactionType {
    EXPENSE = 'expense',
    INCOME = 'income',
}
export enum PayMethod {
    CASH = "Tiền mặt",
    CARD = "Thẻ tín dụng",
    BANK_TRANSFER = "Ví điện tử",
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
    createdAt?: string | FieldValue; // Thêm createdAt (tùy chọn vì được tạo tự động)
    updatedAt?: string | FieldValue; // Thêm updatedAt (tùy chọn vì được tạo tự động)
}