import { db } from "@/firebase_config.env";
import { collection, addDoc, Timestamp } from "firebase/firestore";

// Hàm thêm thu nhập (Income)
export const addIncome = async (income: any) => {
    try {
        const docRef = await addDoc(collection(db, "transactions"), {
            ...income,
            date: Timestamp.fromDate(new Date()) // Lưu Timestamp Firestore
        });
        console.log("Thu nhập đã được thêm với ID:", docRef.id);
    } catch (error) {
        console.error("Lỗi khi thêm thu nhập:", error);
    }
};

// Hàm thêm chi tiêu (Expense)
export const addExpense = async (expense: any) => {
    try {
        const docRef = await addDoc(collection(db, "transactions"), {
            ...expense,
            date: Timestamp.fromDate(new Date()), // Lưu Timestamp Firestore
            time: Timestamp.fromDate(new Date()), // Lưu dạng string hoặc Timestamp nếu cần
        });
        console.log("Chi tiêu đã được thêm với ID:", docRef.id);
    } catch (error) {
        console.error("Lỗi khi thêm chi tiêu:", error);
    }
};

// Hàm thêm ngân sách (Budget)
export const addBudget = async (budget: any) => {
    try {
        const docRef = await addDoc(collection(db, "budgets"), {
            ...budget,
            start_date: Timestamp.fromDate(new Date()),
            end_date: Timestamp.fromDate(new Date("2025-12-31")),
        });
        console.log("Ngân sách đã được thêm với ID:", docRef.id);
    } catch (error) {
        console.error("Lỗi khi thêm ngân sách:", error);
    }
};