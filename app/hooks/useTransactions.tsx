import { useEffect, useState, useCallback } from "react";
import { TransactionService } from "@/app/services/transaction.service";
import { ITransaction } from "@/app/interface/Transaction";
import { useUserAuth } from "@/app/hooks/userAuth";

export const useTransactions = () => {
    const { userId, loading: authLoading } = useUserAuth();
    const [transactions, setTransactions] = useState<ITransaction[]>([]);
    const [loading, setLoading] = useState(true);

    // Hàm fetch dữ liệu giao dịch
    const fetchTransactions = useCallback(async () => {
        if (!userId || authLoading) return; // Kiểm tra trước khi gọi API

        setLoading(true);
        try {
            const data = await TransactionService.fetchUserTransactions(); // Truyền userId vào fetchUserTransactions
            if (data && JSON.stringify(data) !== JSON.stringify(transactions)) {
                setTransactions(data); // Chỉ cập nhật nếu dữ liệu khác
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    }, [userId, authLoading, transactions]);

    // Fetch lại khi userId hoặc authLoading thay đổi
    useEffect(() => {
        if (userId && !authLoading) {
            fetchTransactions(); // Fetch dữ liệu khi userId hợp lệ và không còn loading
        }
    }, [userId, authLoading, fetchTransactions]);

    return { transactions, loading };
};
