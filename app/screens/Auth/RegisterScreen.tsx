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
import { RootStackParamList } from '@/app/screens/Auth/LoginScreen/types';
import styles from './RegisterScreen/styles';
import { auth } from '@/firebase_config.env'; // Import auth từ firebase config
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

const SignUpScreen: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('Nam');
  const [birthDate, setBirthDate] = useState('04/12/2022');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleSignUp = async () => {
    // Kiểm tra validation cơ bản
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    try {
      // Tạo tài khoản với email và password
      const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
      );

      // Cập nhật profile với fullName
      await updateProfile(userCredential.user, {
        displayName: fullName
      });

      // Có thể lưu thêm thông tin gender, birthDate vào Firestore nếu cần
      Alert.alert('Thành công', 'Đăng ký tài khoản thành công!');
      navigation.navigate('Login');

    } catch (error: any) {
      // Xử lý các lỗi cụ thể từ Firebase
      switch (error.code) {
        case 'auth/email-already-in-use':
          Alert.alert('Lỗi', 'Email này đã được sử dụng');
          console.log('Email này đã được sử dụng');
          break;
        case 'auth/invalid-email':
          Alert.alert('Lỗi', 'Email không hợp lệ');
          console.log('Email không hợp lệ');
          break;
        case 'auth/weak-password':
          Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
          console.log('Mật khẩu phải có ít nhất 6 ký tự');
          break;
        default:
          Alert.alert('Lỗi', 'Đã có lỗi xảy ra: ' + error.message);
          console.log('Đã có lỗi xảy ra: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <View style={styles.container}>
        <Text style={styles.welcomeText}>Chào người dùng mới!</Text>
        <Text style={styles.subText}>Chào mừng bạn đến với ứng dụng</Text>

        <TextInput
            style={styles.input}
            placeholder="Họ Tên"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
        />

        <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
        />

        <View style={styles.genderContainer}>
          <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'Nam' && styles.genderButtonSelected,
              ]}
              onPress={() => setGender('Nam')}
          >
            <Image
                source={require('../../../../assets/images/icon/man.png')}
                style={styles.genderIcon}
            />
            <Text style={styles.genderText}>Nam</Text>
          </TouchableOpacity>
          <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'Nữ' && styles.genderButtonSelected,
              ]}
              onPress={() => setGender('Nữ')}
          >
            <Image
                source={require('../../../../assets/images/icon/woman.png')}
                style={styles.genderIcon}
            />
            <Text style={styles.genderText}>Nữ</Text>
          </TouchableOpacity>
        </View>

        <TextInput
            style={styles.input}
            placeholder="Ngày sinh"
            value={birthDate}
            onChangeText={setBirthDate}
            keyboardType="numeric"
        />

        <TextInput
            style={styles.input}
            placeholder="Mật Khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
        />

        <TextInput
            style={styles.input}
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
        />

        <TouchableOpacity
            style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
        >
          <Text style={styles.signUpButtonText}>
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.loginText}>
          Đã có tài khoản?{' '}
          <Text
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
          >
            Đăng nhập ngay
          </Text>
        </Text>
      </View>
  );
};

export default SignUpScreen;