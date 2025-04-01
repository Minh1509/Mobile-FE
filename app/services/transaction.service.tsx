import { collection, getDocs, query, where, addDoc, deleteDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebase_config.env";
import { ITransaction } from "@/app/interface/Transaction";
import { getAuth } from "firebase/auth";

export class TransactionService {
    private static getTransactionsCollection(userId: string) {
        return query(collection(db, "transactions"), where("userId", "==", userId));
    }

    static async fetchUserTransactions(): Promise<ITransaction[] | null> {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) return null;

            const q = this.getTransactionsCollection(user.uid);
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as ITransaction[];
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
            return null;
        }
    }

    static async addTransaction(transaction: Omit<ITransaction, "id" | "userId">): Promise<string | null> {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) return null;

            const docRef = await addDoc(collection(db, "transactions"), { ...transaction, userId: user.uid });
            return docRef.id;
        } catch (error) {
            console.error("Error adding transaction:", error);
            return null;
        }
    }

    static async updateTransaction(id: string, transaction: Partial<ITransaction>): Promise<boolean> {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) return false;

            await updateDoc(doc(db, "transactions", id), { ...transaction, userId: user.uid });
            return true;
        } catch (error) {
            console.error("Error updating transaction:", error);
            return false;
        }
    }

    static async deleteTransaction(id: string): Promise<{ success: boolean; error?: string }> {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) {
                return { success: false, error: "Người dùng chưa đăng nhập." };
            }

            const transactionRef = doc(db, "transactions", id);
            const transactionSnap = await getDoc(transactionRef);
            if (!transactionSnap.exists()) {
                return { success: false, error: "Giao dịch không tồn tại." };
            }

            const transactionData = transactionSnap.data() as ITransaction;
            if (transactionData.userId !== user.uid) {
                return { success: false, error: "Bạn không có quyền xóa giao dịch này." };
            }

            await deleteDoc(transactionRef);
            return { success: true };
        } catch (error: any) {
            console.error("Lỗi khi xóa giao dịch:", error.message || error);
            return { success: false, error: error.message || "Lỗi không xác định khi xóa giao dịch." };
        }
    }
}
