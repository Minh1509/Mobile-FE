import { db, storage } from "@/firebase_config.env";
import { ref, uploadString } from 'firebase/storage';
import * as functions from 'firebase-functions/v1';
import { getFirestore, collection, query, where, getDocs, addDoc, serverTimestamp, DocumentData } from 'firebase/firestore';
import { parse } from 'json2csv';

// Hàm tính toán báo cáo ngân sách
export async function generateReport() {
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

    transactionsSnapshot.forEach(doc => {
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

// Cron job
export const generateMonthlyReport = functions.pubsub.schedule('0 0 1 * *') // Mùng 1 mỗi tháng lúc 00:00
    .timeZone('Asia/Ho_Chi_Minh')  // Đảm bảo múi giờ phù hợp
    .onRun(async (context) => {
        console.log('Đang chạy chức năng tạo báo cáo hàng tháng...');
        const report = await generateReport(); // Gọi hàm generateReport để tính toán và tạo báo cáo
        console.log('Báo cáo đã được tạo thành công:', report);
    });


async function exportCsv() {
    const reportsRef = collection(db, 'reports');
    const reportsSnapshot = await getDocs(reportsRef);

    const reports: DocumentData[] = [];
    reportsSnapshot.forEach(doc => {
        reports.push(doc.data());
    });

    // Chuyển đổi dữ liệu báo cáo thành CSV
    const csvData = parse(reports);

    return csvData;
}

// Cloud Function để xuất CSV
export const exportReportCsv = functions.https.onRequest(async (req, res) => {
    try {
        const csvData = await exportCsv();

        // Trả về CSV cho client
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="report.csv"');
        res.status(200).send(csvData);  // Gửi file CSV cho client tải về
    } catch (error) {
        console.error('Error generating CSV:', error);
        res.status(500).send('Failed to generate CSV');
    }
});