import { db } from "@/firebase_config.env";
import { collection, addDoc, Timestamp, getDocs, serverTimestamp, query, where } from "firebase/firestore";
import { ITransaction, TransactionType } from "../interface/Transaction";
import { ICategory } from "../interface/Category";

// Hàm thêm thu nhập (Income)
export const addIncome = async (income: Omit<ITransaction, 'id' | 'type' | 'createdAt' | 'updatedAt'>) => {
    try {
        const transactionData: Omit<ITransaction, 'id'> = {
            ...income,
            type: TransactionType.INCOME,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
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
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
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
        });
        console.log("Ngân sách đã được thêm với ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Lỗi khi thêm ngân sách:", error);
        throw error;
    }
};

// Lấy danh sách ngân sách của user
export const getBudgets = async (userId: string): Promise<Budget[]> => {
    try {
      const budgetsQuery = query(
        collection(db, 'budgets'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(budgetsQuery);
      const budgets: Budget[] = [];
      querySnapshot.forEach((doc) => {
        budgets.push({ id: doc.id, ...doc.data() } as Budget);
      });
      return budgets;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách ngân sách:', error);
      return [];
    }
  };
  
  // Lấy danh sách chi tiêu của user
  export const getExpenses = async (userId: string): Promise<ITransaction[]> => {
    try {
      const expensesQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        where('type', '==', TransactionType.EXPENSE)
      );
      const querySnapshot = await getDocs(expensesQuery);
      const expenses: ITransaction[] = [];
      querySnapshot.forEach((doc) => {
        expenses.push({ id: doc.id, ...doc.data() } as ITransaction);
      });
      return expenses;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách chi tiêu:', error);
      return [];
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

