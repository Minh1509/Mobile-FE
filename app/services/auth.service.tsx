// src/services/authService.ts
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/firebase_config.env';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const loginWithEmailPassword = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // Lưu UID của người dùng vào AsyncStorage
        await AsyncStorage.setItem('@user_id', user.uid);
        console.log(user.uid);
        return { user, error: null };
    } catch (error: any) {
        return { user: null, error };
    }
};

export const handleAuthError = (error: any) => {
    switch (error.code) {
        case 'auth/invalid-email':
            return 'Email không hợp lệ';
        case 'auth/user-not-found':
            return 'Không tìm thấy người dùng với email này';
        case 'auth/wrong-password':
            return 'Mật khẩu không đúng';
        case 'auth/too-many-requests':
            return 'Quá nhiều yêu cầu, vui lòng thử lại sau';
        default:
            return `Đã có lỗi xảy ra: ${error.message}`;
    }
};


