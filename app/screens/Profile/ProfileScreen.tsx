import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, Appearance, StyleSheet, Share, Platform, TouchableOpacity } from "react-native";
import { Avatar, Switch, Button, ActivityIndicator } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { auth } from "@/firebase_config.env";
import { signOut } from "firebase/auth";
import { RootStackParamList } from "@/app/Types/types";
import { ReportService } from "@/app/services/report.service";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from "react-native";

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, "Profile">;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [darkMode, setDarkMode] = useState(Appearance.getColorScheme() === "dark");
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Nếu displayName tồn tại thì dùng, nếu không thì dùng email
      setUserName(currentUser.displayName || currentUser.email || "Người dùng chưa đặt tên");
    }

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

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);

      // Generate the CSV data
      const csvData = await ReportService.exportCsv();

      if (Platform.OS === 'web') {
        // For web, we can create a download link
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reports.csv';
        a.click();
      } else {
        // For mobile, save to a temporary file and share
        const fileName = `${FileSystem.documentDirectory}reports.csv`;
        await FileSystem.writeAsStringAsync(fileName, csvData);

        // Check if sharing is available
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileName);
        } else {
          alert('Sharing is not available on this device');
        }
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Đã xảy ra lỗi khi xuất CSV. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsLoading(true);
      const report = await ReportService.generateReport();

      // Check what the report data looks like
      console.log("Generated report:", report);

      if (report) {
        // Make sure report is not null/undefined
        Alert.alert(
          "Thành công",
          `Đã tạo báo cáo cho tháng ${report.month}/${report.year} thành công!`,
          [{ text: "OK", onPress: () => console.log("Alert closed") }]
        );
      } else {
        alert("Không thể tạo báo cáo. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi tạo báo cáo:", error);
      alert("Đã xảy ra lỗi khi tạo báo cáo. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };


  // StyleSheet để quản lý style tập trung
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#1a1a1a" : "#f5f5f5",
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
      elevation: 5,
    },
    avatar: {
      backgroundColor: darkMode ? "#333" : "#e0e0e0",
    },
    username: {
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 15,
      color: darkMode ? "#fff" : "#333",
    },
    settingSection: {
      backgroundColor: darkMode ? "#2a2a2a" : "#fff",
      borderRadius: 15,
      paddingHorizontal: 10,
      marginBottom: 20,
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
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: darkMode ? "#fff" : "#333",
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "#444" : "#ddd",
    },
    logoutButton: {
      marginTop: 30,
      borderRadius: 10,
      backgroundColor: darkMode ? "#d32f2f" : "#ff5252",
      paddingVertical: 5,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
    loadingIndicator: {
      marginLeft: 10,
    },
    chevron: {
      color: darkMode ? "#bbb" : "#666",
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
        <Text style={styles.username}>{userName || "Đang tải..."}</Text>
      </View>

      {/* Phần Báo Cáo */}
      <View style={styles.settingSection}>
        <Text style={styles.sectionTitle}>Báo Cáo Tài Chính</Text>

        <TouchableSettingItem
          icon="bar-chart"
          title="Tạo báo cáo tháng này"
          darkMode={darkMode}
          onPress={handleGenerateReport}
          isLoading={isLoading}
        />

        <TouchableSettingItem
          icon="file-text-o"
          title="Xuất báo cáo CSV"
          darkMode={darkMode}
          onPress={handleExportCSV}
          isLoading={isExporting}
        />
      </View>

      {/* Menu cài đặt */}
      <View style={styles.settingSection}>
        <Text style={styles.sectionTitle}>Cài Đặt</Text>
        <SettingItem icon="user" title="Tài khoản" darkMode={darkMode} />
        <SettingItem icon="lock" title="Đổi mật khẩu" darkMode={darkMode} />
        <SettingItem icon="language" title="Ngôn ngữ" darkMode={darkMode} />
        {/* 
        <View style={styles.switchContainer}>
          <Icon name="moon-o" size={24} style={styles.icon} />
          <Text style={styles.settingText}>Chế độ tối</Text>
          <Switch
            value={darkMode}
            onValueChange={() => setDarkMode(prev => !prev)}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={darkMode ? "#f5dd4b" : "#f4f3f4"}
          />
        </View> */}

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
        labelStyle={styles.buttonText}
      >
        {isLoading ? "Đang đăng xuất..." : "Đăng xuất"}
      </Button>
    </ScrollView>
  );
};

// TouchableSettingItem component for interactive settings
const TouchableSettingItem: React.FC<{
  icon: string;
  title: string;
  darkMode: boolean;
  onPress: () => void;
  isLoading?: boolean;
}> = ({ icon, title, darkMode, onPress, isLoading = false }) => {
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
    activityIndicator: {
      marginRight: 10,
    }
  });

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} disabled={isLoading}>
      <Icon name={icon} size={24} style={styles.icon} />
      <Text style={styles.text}>{title}</Text>
      {isLoading ? (
        <ActivityIndicator size="small" color={darkMode ? "#bbb" : "#666"} style={styles.activityIndicator} />
      ) : (
        <Icon name="chevron-right" size={16} style={styles.chevron} />
      )}
    </TouchableOpacity>
  );
};

// Static SettingItem component
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