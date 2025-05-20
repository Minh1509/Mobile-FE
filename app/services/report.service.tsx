import { db } from "@/firebase_config.env";
import {
  addDoc,
  collection,
  DocumentData,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { json2csv } from "json-2-csv";
import { formatDate, normalizeDate } from "../utils/normalizeDate";
import { Alert } from "react-native";

interface TransactionBreakdown {
  category: string;
  amount: number;
}

export class ReportService {
  static async generateReport(
    startDate: Date,
    endDate: Date
  ): Promise<DocumentData> {
    try {
      const startDateStr = formatDate(startDate); // dd/MM/yyyy
      const endDateStr = formatDate(endDate); // dd/MM/yyyy
      const normalizedStartDate = normalizeDate(startDateStr); // yyyy-MM-dd
      const normalizedEndDate = normalizeDate(endDateStr); // yyyy-MM-dd

      // Lấy toàn bộ transactions và lọc bằng JS
      const transactionsSnapshot = await getDocs(
        collection(db, "transactions")
      );

      const filteredTransactions = transactionsSnapshot.docs.filter((doc) => {
        const data = doc.data();
        const date = normalizeDate(data.date); // dd/MM/yyyy -> yyyy-MM-dd
        return date >= normalizedStartDate && date <= normalizedEndDate;
      });

      let totalIncome = 0;
      let totalExpense = 0;
      const incomeByCategory: Record<string, number> = {};
      const expenseByCategory: Record<string, number> = {};

      filteredTransactions.forEach((doc) => {
        const data = doc.data();
        const type = data.type;
        const category = data.category || "Không phân loại";
        const amount = Number(data.amount) || 0;

        if (type === "income") {
          totalIncome += amount;
          incomeByCategory[category] =
            (incomeByCategory[category] || 0) + amount;
        } else if (type === "expense") {
          totalExpense += amount;
          expenseByCategory[category] =
            (expenseByCategory[category] || 0) + amount;
        }
      });

      // Lấy toàn bộ budgets và lọc
      const budgetsSnapshot = await getDocs(collection(db, "budgets"));

      const filteredBudgets = budgetsSnapshot.docs.filter((doc) => {
        const data = doc.data();
        const start = normalizeDate(data.startDate); // dd/MM/yyyy -> yyyy-MM-dd
        const end = normalizeDate(data.endDate); // dd/MM/yyyy -> yyyy-MM-dd
        return end >= normalizedStartDate && start <= normalizedEndDate;
      });

      let totalPredictedExpense = 0;
      filteredBudgets.forEach((doc) => {
        const data = doc.data();
        const limit: number = Number(data.amountLimit) || 0;
        totalPredictedExpense += limit;
      });

      const report = {
        startDate: startDateStr,
        endDate: endDateStr,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        predictedExpense: totalPredictedExpense,
        predictedBalance: totalIncome - totalPredictedExpense,
        incomeBreakdown: Object.entries(incomeByCategory).map(
          ([category, amount]) => ({ category, amount })
        ),
        expenseBreakdown: Object.entries(expenseByCategory).map(
          ([category, amount]) => ({ category, amount })
        ),
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "reports"), report);
      return { id: docRef.id, ...report };
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo báo cáo. Vui lòng thử lại sau.");
      throw error;
    }
  }

  // Hàm xuất dữ liệu báo cáo thành CSV
  static async exportCsv(): Promise<string> {
    const reportsRef = collection(db, "reports");
    const reportsSnapshot = await getDocs(reportsRef);

    const reports: any[] = [];
    reportsSnapshot.forEach((doc) => {
      const data = { ...doc.data() };

      // Xử lý timestamp
      if (data.createdAt) {
        data.createdAt = data.createdAt.toDate().toISOString();
      }
      if (data.startDate) {
        data.startDate =
          typeof data.startDate.toDate === "function"
            ? data.startDate.toDate().toISOString()
            : data.startDate;
      }
      if (data.endDate) {
        data.endDate =
          typeof data.endDate.toDate === "function"
            ? data.endDate.toDate().toISOString()
            : data.endDate;
      }

      // Chuyển đổi mảng JSON thành chuỗi
      if (data.incomeBreakdown) {
        data.incomeBreakdown = JSON.stringify(data.incomeBreakdown).replace(
          /"/g,
          '""'
        ); // Escape double quotes for CSV compatibility
      }

      if (data.expenseBreakdown) {
        data.expenseBreakdown = JSON.stringify(data.expenseBreakdown).replace(
          /"/g,
          '""'
        );
      }

      reports.push(data);
    });

    // Tạo CSV với các option tùy chỉnh
    const options = {
      delimiter: {
        field: ",", // Use comma as field delimiter
      },
      prependHeader: true,
      sortHeader: false,
      excelBOM: true, // Add BOM for Excel
    };

    try {
      return json2csv(reports, options);
    } catch (err) {
      console.error("Error converting to CSV:", err);
      return "";
    }
  }
}
