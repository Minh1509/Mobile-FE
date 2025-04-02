import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, Appearance, StyleSheet } from "react-native";
import { Avatar, Switch, Button } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { auth } from "@/firebase_config.env";
import { signOut } from "firebase/auth";
import { RootStackParamList } from "@/app/Types/types";

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, "Profile">;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [darkMode, setDarkMode] = useState(Appearance.getColorScheme() === "dark");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setDarkMode(colorScheme === "dark");
    });
    return () => subscription.remove();
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut(auth);
      navigation.replace("Login");
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      alert("Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // StyleSheet để quản lý style tập trung
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#1a1a1a" : "#f5f5f5", // Màu nền nhẹ hơn
      padding: 20,
    },
    profileCard: {
      alignItems: "center",
      backgroundColor: darkMode ? "#2a2a2a" : "#fff",
      borderRadius: 15,
      padding: 20,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: darkMode ? 0.5 : 0.1,
      shadowRadius: 5,
      elevation: 5, // Bóng đổ cho Android
    },
    avatar: {
      backgroundColor: darkMode ? "#333" : "#e0e0e0",
    },
    username: {
      fontSize: 20,
      fontWeight: "bold",
      marginTop: 15,
      color: darkMode ? "#fff" : "#333",
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "#444" : "#ddd",
    },
    settingText: {
      flex: 1,
      fontSize: 16,
      color: darkMode ? "#fff" : "#333",
    },
    icon: {
      width: 30,
      color: darkMode ? "#bbb" : "#666",
    },
    switchContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "#444" : "#ddd",
    },
    logoutButton: {
      marginTop: 30,
      borderRadius: 10,
      backgroundColor: darkMode ? "#d32f2f" : "#ff5252",
      paddingVertical: 5,
    },
    logoutText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Thông tin User */}
      <View style={styles.profileCard}>
        <Avatar.Image
          size={120}
          source={{ uri: "https://i.pravatar.cc/150?img=3" }}
          style={styles.avatar}
        />
        <Text style={styles.username}>Tên Người Dùng</Text>
      </View>

      {/* Menu cài đặt */}
      <View style={{ backgroundColor: darkMode ? "#2a2a2a" : "#fff", borderRadius: 15, paddingHorizontal: 10 }}>
        <SettingItem icon="user" title="Tài khoản" darkMode={darkMode} />
        <SettingItem icon="lock" title="Đổi mật khẩu" darkMode={darkMode} />
        <SettingItem icon="language" title="Ngôn ngữ" darkMode={darkMode} />
        
        <View style={styles.switchContainer}>
          <Icon name="moon-o" size={24} style={styles.icon} />
          <Text style={styles.settingText}>Chế độ tối</Text>
          <Switch
            value={darkMode}
            onValueChange={() => setDarkMode(prev => !prev)}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={darkMode ? "#f5dd4b" : "#f4f3f4"}
          />
        </View>

        <SettingItem icon="history" title="Lịch sử" darkMode={darkMode} />
        <SettingItem icon="info-circle" title="Giới thiệu" darkMode={darkMode} />
      </View>

      {/* Nút Đăng Xuất */}
      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        loading={isLoading}
        disabled={isLoading}
        labelStyle={styles.logoutText}
      >
        {isLoading ? "Đang đăng xuất..." : "Đăng xuất"}
      </Button>
    </ScrollView>
  );
};

const SettingItem: React.FC<{
  icon: string;
  title: string;
  darkMode: boolean;
}> = ({ icon, title, darkMode }) => {
  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "#444" : "#ddd",
    },
    icon: {
      width: 30,
      color: darkMode ? "#bbb" : "#666",
    },
    text: {
      flex: 1,
      fontSize: 16,
      color: darkMode ? "#fff" : "#333",
    },
    chevron: {
      color: darkMode ? "#bbb" : "#666",
    },
  });

  return (
    <View style={styles.container}>
      <Icon name={icon} size={24} style={styles.icon} />
      <Text style={styles.text}>{title}</Text>
      <Icon name="chevron-right" size={16} style={styles.chevron} />
    </View>
  );
};

export default ProfileScreen;