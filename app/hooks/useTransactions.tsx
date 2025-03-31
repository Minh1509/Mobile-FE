import { useEffect, useState } from "react";
import { TransactionService } from "@/app/services/transaction.service";
import { ITransaction } from "@/app/interface/Transaction";
import { useUserAuth } from "@/app/hooks/userAuth";
import { useIsFocused } from "@react-navigation/native";

export const useTransactions = () => {
    const { userId, loading: authLoading } = useUserAuth();
    const [transactions, setTransactions] = useState<ITransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const isFocused = useIsFocused(); // Kiểm tra xem màn hình có đang active không

    const fetchTransactions = () => {
        if (!userId || authLoading) return;

        setLoading(true);
        TransactionService.fetchUserTransactions()
            .then((data) => {
                if (data) setTransactions(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        if (isFocused) {
            fetchTransactions(); // Fetch lại khi màn hình được focus
        }
    }, [isFocused, userId, authLoading]);

    return { transactions, loading };
};
