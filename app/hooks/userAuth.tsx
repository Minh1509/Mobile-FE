import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";

export const useUserAuth = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                setDisplayName(user.displayName || "Người dùng");
                setEmail(user.email);
            } else {
                setUserId(null);
                setDisplayName(null);
                setEmail(null);
            }
            setLoading(false);
        });

        return () => unsubscribe(); // Cleanup khi unmount
    }, []);

    return { userId, displayName, email, loading };
};