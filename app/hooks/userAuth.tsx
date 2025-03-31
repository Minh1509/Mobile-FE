import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";

export const useUserAuth = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUserId(user ? user.uid : null);
            setLoading(false);
        });

        return () => unsubscribe(); // Cleanup khi unmount
    }, []);

    return { userId, loading };
};
