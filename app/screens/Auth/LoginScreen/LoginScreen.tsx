import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from "../../../Types/types";
import styles from './styles';
import { auth } from '@/firebase_config.env'; // Import auth từ firebase config
import { signInWithEmailAndPassword } from 'firebase/auth';

const LoginScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const handleLogin = async () => {
        // Validation cơ bản
        if (!email || !password) {
            console.log('Validation failed: Missing email or password');
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ email và mật khẩu');
            return;
        }

        setLoading(true);

        try {
            // Đăng nhập với Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Đăng nhập thành công cho email:', email);
            Alert.alert('Thành công', 'Đăng nhập thành công!');
            // Điều hướng đến màn hình chính sau khi đăng nhập (ví dụ: 'Home')
            // navigation.navigate('Home'); // Uncomment và thay 'Home' bằng route của bạn
            navigation.navigate('Tabs');

        } catch (error: any) {
            console.error('Lỗi đăng nhập:', error.message);
            switch (error.code) {
                case 'auth/invalid-email':
                    Alert.alert('Lỗi', 'Email không hợp lệ');
                    break;
                case 'auth/user-not-found':
                    Alert.alert('Lỗi', 'Không tìm thấy người dùng với email này');
                    break;
                case 'auth/wrong-password':
                    Alert.alert('Lỗi', 'Mật khẩu không đúng');
                    break;
                case 'auth/too-many-requests':
                    Alert.alert('Lỗi', 'Quá nhiều yêu cầu, vui lòng thử lại sau');
                    break;
                default:
                    Alert.alert('Lỗi', 'Đã có lỗi xảy ra: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Welcome Text */}
            <Text style={styles.welcomeText}>Chào mừng trở lại!</Text>
            <Text style={styles.subText}>Chào mừng trở lại bạn đã bỏ lỡ!</Text>

            {/* Email Input */}
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            {/* Password Input */}
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Mật Khẩu"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                />
                <Text style={styles.forgotPassword}>Quên Mật Khẩu?</Text>
            </View>

            {/* Login Button */}
            <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
            >
                <Text style={styles.loginButtonText}>
                    {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                </Text>
            </TouchableOpacity>

            {/* Social Login Options */}
            <Text style={styles.orText}>Hoặc tiếp tục với</Text>

            <View style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton}>
                    <Image
                        source={require('@/assets/images/icon/google.png')}
                        style={styles.socialIcon}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={styles.socialButton}>
                    <Image
                        source={require('@/assets/images/icon/facebook.png')}
                        style={styles.socialIcon}
                    />
                </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <Text style={styles.signUpText}>
                Không có tài khoản?{' '}
                <Text
                    style={styles.signUpLink}
                    onPress={() => navigation.navigate('Register')}
                >
                    Đăng ký ngay
                </Text>
            </Text>
        </View>
    );
};

export default LoginScreen;