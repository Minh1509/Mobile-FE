import { db } from '@/firebase_config.env';
import { addDoc, collection, DocumentData, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { json2csv } from 'json-2-csv';
import { formatDate } from '../utils/normalizeDate';

interface TransactionBreakdown {
    category: string;
    amount: number;
}

export class ReportService {
    // Hàm tính toán báo cáo ngân sách
    static async generateReport(): Promise<DocumentData> {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        const endDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

        // Truy vấn dữ liệu trong tháng trước từ Firestore
        const transactionsRef = collection(db, 'transactions');
        const q = query(
            transactionsRef,
            where('date', '>=', formatDate(startDate)),
            where('date', '<=', formatDate(endDate))
        );

        const transactionsSnapshot = await getDocs(q);

        let totalIncome = 0;
        let totalExpense = 0;

        // Tạo các đối tượng để theo dõi phân tích theo danh mục
        const incomeByCategory: Record<string, number> = {};
        const expenseByCategory: Record<string, number> = {};

        transactionsSnapshot.forEach((doc) => {
            const transaction = doc.data();
            const category = transaction.category || 'Không phân loại';
            const amount = transaction.amount || 0;

            if (transaction.type === 'income') {
                totalIncome += amount;

                // Thêm vào phân tích thu nhập theo danh mục
                if (incomeByCategory[category]) {
                    incomeByCategory[category] += amount;
                } else {
                    incomeByCategory[category] = amount;
                }
            } else if (transaction.type === 'expense') {
                totalExpense += amount;

                // Thêm vào phân tích chi tiêu theo danh mục
                if (expenseByCategory[category]) {
                    expenseByCategory[category] += amount;
                } else {
                    expenseByCategory[category] = amount;
                }
            }
        });

        // Chuyển đổi phân tích sang định dạng mảng các đối tượng
        const incomeBreakdown: TransactionBreakdown[] = Object.keys(incomeByCategory).map(category => ({
            category,
            amount: incomeByCategory[category]
        }));

        const expenseBreakdown: TransactionBreakdown[] = Object.keys(expenseByCategory).map(category => ({
            category,
            amount: expenseByCategory[category]
        }));

        const report = {
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
            incomeBreakdown,
            expenseBreakdown,
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

        const reports: any[] = [];
        reportsSnapshot.forEach((doc) => {
            const data = { ...doc.data() };

            // Xử lý timestamp
            if (data.createdAt) {
                data.createdAt = data.createdAt.toDate().toISOString();
            }
            if (data.startDate) {
                data.startDate = typeof data.startDate.toDate === 'function'
                    ? data.startDate.toDate().toISOString()
                    : data.startDate;
            }
            if (data.endDate) {
                data.endDate = typeof data.endDate.toDate === 'function'
                    ? data.endDate.toDate().toISOString()
                    : data.endDate;
            }

            // Chuyển đổi mảng JSON thành chuỗi
            if (data.incomeBreakdown) {
                data.incomeBreakdown = JSON.stringify(data.incomeBreakdown)
                    .replace(/"/g, '""'); // Escape double quotes for CSV compatibility
            }

            if (data.expenseBreakdown) {
                data.expenseBreakdown = JSON.stringify(data.expenseBreakdown)
                    .replace(/"/g, '""');
            }

            reports.push(data);
        });

        // Tạo CSV với các option tùy chỉnh
        const options = {
            delimiter: {
                field: ',', // Use comma as field delimiter
            },
            prependHeader: true,
            sortHeader: false,
            excelBOM: true // Add BOM for Excel
        };

        try {
            return json2csv(reports, options);
        } catch (err) {
            console.error("Error converting to CSV:", err);
            return "";
        }
    }
}