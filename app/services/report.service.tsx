import { db } from '@/firebase_config.env'; // Đảm bảo file này export Firestore instance
import { addDoc, collection, DocumentData, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { json2csv } from 'json-2-csv'; // Giữ nguyên theo yêu cầu, nhưng có thể gây lỗi trong React Native

export class ReportService {
    // Hàm tính toán báo cáo ngân sách
    static async generateReport(): Promise<DocumentData> {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const startOfMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        const endOfMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

        // Truy vấn dữ liệu trong tháng trước từ Firestore
        const transactionsRef = collection(db, 'transactions');
        const q = query(
            transactionsRef,
            where('date', '>=', startOfMonth),
            where('date', '<=', endOfMonth)
        );

        const transactionsSnapshot = await getDocs(q);

        let totalIncome = 0;
        let totalExpense = 0;

        transactionsSnapshot.forEach((doc) => {
            const transaction = doc.data();
            if (transaction.type === 'income') {
                totalIncome += transaction.amount;
            } else if (transaction.type === 'expense') {
                totalExpense += transaction.amount;
            }
        });

        const report = {
            month: lastMonth.getMonth() + 1,
            year: lastMonth.getFullYear(),
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
            createdAt: serverTimestamp(),
        };

        // Lưu báo cáo vào bảng 'reports'
        const reportsRef = collection(db, 'reports');
        await addDoc(reportsRef, report);

        return report;
    }

    // Hàm xuất dữ liệu báo cáo thành CSV
    static async exportCsv(): Promise<string> {
        const reportsRef = collection(db, 'reports');
        const reportsSnapshot = await getDocs(reportsRef);

        const reports: DocumentData[] = [];
        reportsSnapshot.forEach((doc) => {
            const data = doc.data();
            // Chuyển đổi createdAt (Timestamp) thành chuỗi nếu cần
            if (data.createdAt) {
                data.createdAt = data.createdAt.toDate().toISOString();
            }
            reports.push(data);
        });

        // Chuyển đổi dữ liệu báo cáo thành CSV
        return json2csv(reports); // Giữ nguyên theo yêu cầu
    }
}