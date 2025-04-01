import { db } from "@/firebase_config.env";
import { collection, addDoc, Timestamp, getDocs } from "firebase/firestore";
import { ITransaction, TransactionType } from "../interface/Transaction";
import { ICategory } from "../interface/Category";

// Hàm thêm thu nhập (Income)
export const addIncome = async (income: Omit<ITransaction, 'id' | 'type' | 'createdAt' | 'updatedAt'>) => {
    try {
        const transactionData: Omit<ITransaction, 'id'> = {
            ...income,
            type: TransactionType.INCOME,
            createdAt: Timestamp.fromDate(new Date()).toDate().toISOString(),
            updatedAt: Timestamp.fromDate(new Date()).toDate().toISOString(),
        };

        const docRef = await addDoc(collection(db, "transactions"), transactionData);
        console.log("Thu nhập đã được thêm với ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Lỗi khi thêm thu nhập:", error);
        throw error;
    }
};

// Hàm thêm chi tiêu (Expense)
export const addExpense = async (expense: Omit<ITransaction, 'id' | 'type' | 'createdAt' | 'updatedAt'>) => {
    try {
        const transactionData: Omit<ITransaction, 'id'> = {
            ...expense,
            type: TransactionType.EXPENSE,
            createdAt: Timestamp.fromDate(new Date()).toDate().toISOString(),
            updatedAt: Timestamp.fromDate(new Date()).toDate().toISOString(),
        };

        const docRef = await addDoc(collection(db, "transactions"), transactionData);
        console.log("Chi tiêu đã được thêm với ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Lỗi khi thêm chi tiêu:", error);
        throw error;
    }
};

// Hàm thêm ngân sách (Budget) - Giữ nguyên, nhưng có thể cải tiến tương tự nếu cần
export const addBudget = async (budget: any) => {
    try {
        const docRef = await addDoc(collection(db, "budgets"), {
            ...budget,
            start_date: Timestamp.fromDate(new Date()),
            end_date: Timestamp.fromDate(new Date("2025-12-31")),
        });
        console.log("Ngân sách đã được thêm với ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Lỗi khi thêm ngân sách:", error);
        throw error;
    }
};

export const getCategories = async (): Promise<ICategory[]> => {
    try {
      const categoriesCollection = collection(db, "categories");
      const categoriesSnapshot = await getDocs(categoriesCollection);
      const categoriesList: ICategory[] = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name, // Đảm bảo Firestore có trường "name"
      }));
      return categoriesList;
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
      throw error;
    }
  };

