import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect
import { TransactionService } from "@/app/services/transaction.service";
import { ITransaction } from "@/app/interface/Transaction";
import { useUserAuth } from "@/app/hooks/userAuth";

export const useTransactions = () => {
    const { userId, loading: authLoading } = useUserAuth();
    const [transactions, setTransactions] = useState<ITransaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchTransactions = useCallback(async () => {
        if (!userId || authLoading) return;

        setLoading(true);
        try {
            const data = await TransactionService.fetchUserTransactions();
            if (Array.isArray(data)) {
                setTransactions(data);
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    }, [userId, authLoading]);

    // Use useFocusEffect to trigger data fetch when the screen is focused
    useFocusEffect(
        useCallback(() => {
            if (userId && !authLoading) {
                fetchTransactions();
            }
        }, [userId, authLoading, fetchTransactions])
    );

    return { transactions, loading };
};
