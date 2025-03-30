import AsyncStorage from '@react-native-async-storage/async-storage';

// Lấy userId từ AsyncStorage
export const getUserId = async () => {
    try {
        const userId = await AsyncStorage.getItem('@user_id');
        if (userId !== null) {
            return userId;
        }
        return null;
    } catch (e) {
        console.error('Failed to fetch user_id', e);
        return null;
    }
};
