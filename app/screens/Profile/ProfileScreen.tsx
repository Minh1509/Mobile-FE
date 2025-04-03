import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  Platform
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { auth } from "@/firebase_config.env";
import { signOut } from "firebase/auth";
import { RootStackParamList } from "@/app/Types/types";
import { ReportService } from "@/app/services/report.service";
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { useUserAuth } from "@/app/hooks/userAuth";

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, "Profile">;

const ProfileScreen: React.FC = () => {
  const { displayName, email } = useUserAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [filePath, setFilePath] = useState(FileSystem.documentDirectory + "Download/reports.csv");
  const [hasPermission, setHasPermission] = useState(false);
  const [isReportGenerating, setIsReportGenerating] = useState(false);

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        setHasPermission(status === 'granted');
        if (status !== 'granted') {
          Alert.alert(
            "Cần quyền truy cập",
            "Ứng dụng cần quyền truy cập bộ nhớ để lưu file CSV vào thư mục Downloads.",
            [{ text: "OK" }]
          );
        }
      }
    };
    requestPermission();
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut(auth);
      navigation.replace("Login");
    } catch (error) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmExportCSV = () => setIsDialogVisible(true);

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      setIsDialogVisible(false);

      if (Platform.OS === 'android' && !hasPermission) {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        setHasPermission(status === 'granted');
        if (status !== 'granted') {
          Alert.alert(
            "Quyền truy cập bị từ chối",
            "Không thể lưu file vào thư mục Downloads. Vui lòng cấp quyền trong cài đặt ứng dụng.",
            [{ text: "OK" }]
          );
          setIsExporting(false);
          return;
        }
      }

      const csvData = await ReportService.exportCsv();
      if (!csvData) throw new Error("Dữ liệu CSV rỗng");

      // Thêm BOM (Byte Order Mark) để Excel nhận diện UTF-8
      const BOM = "\uFEFF";
      const csvWithBOM = BOM + csvData;

      const tempFilePath = FileSystem.documentDirectory + "reports.csv";

      // Sử dụng UTF-8 encoding cho nội dung tiếng Việt
      await FileSystem.writeAsStringAsync(tempFilePath, csvWithBOM, {
        encoding: FileSystem.EncodingType.UTF8
      });

      if (Platform.OS === 'android') {
        // Lưu file vào thư mục Downloads
        const asset = await MediaLibrary.createAssetAsync(tempFilePath);
        await MediaLibrary.createAlbumAsync("Downloads", asset, false);

        Alert.alert(
          "Thành công",
          "Báo cáo CSV đã được lưu thành công vào thư mục Downloads!",
          [
            {
              text: "OK"
            }
          ]
        );
      } else {
        const downloadDir = FileSystem.documentDirectory + "Download/";
        await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
        await FileSystem.moveAsync({ from: tempFilePath, to: downloadDir + "reports.csv" });
        Alert.alert("Thành công", "Báo cáo CSV đã được lưu thành công!");
      }
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : 'Không xác định';
      Alert.alert("Lỗi", `Đã xảy ra lỗi khi xuất CSV: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsReportGenerating(true); // Bật trạng thái khi tạo báo cáo
      const report = await ReportService.generateReport();
      if (report) {
        Alert.alert("Thành công", `Đã tạo báo cáo cho tháng ${report.month}/${report.year} thành công!`);
      } else {
        Alert.alert("Lỗi", "Không thể tạo báo cáo. Vui lòng thử lại.");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tạo báo cáo. Vui lòng thử lại.");
    } finally {
      setIsReportGenerating(false); // Tắt trạng thái khi xong
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileCard}>
        <Image source={{ uri: "https://i.pravatar.cc/150?img=3" }} style={styles.avatar} />
        <Text style={styles.username}>{displayName}</Text>
      </View>

      <View style={styles.settingSection}>
        <Text style={styles.sectionTitle}>Báo Cáo Tài Chính</Text>
        <TouchableSettingItem
          icon="bar-chart"
          title="Tạo báo cáo tháng này"
          onPress={handleGenerateReport}
          isLoading={isReportGenerating} // Sử dụng isReportGenerating cho nút tạo báo cáo
        />
        <TouchableSettingItem
          icon="file-text-o"
          title="Xuất báo cáo CSV"
          onPress={confirmExportCSV}
          isLoading={isExporting}
        />
      </View>

      <View style={styles.settingSection}>
        <Text style={styles.sectionTitle}>Cài Đặt</Text>
        <SettingItem icon="user" title="Tài khoản" />
        <SettingItem icon="lock" title="Đổi mật khẩu" />
        <SettingItem icon="language" title="Ngôn ngữ" />
        <SettingItem icon="history" title="Lịch sử" />
        <SettingItem icon="info-circle" title="Giới thiệu" />
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, isLoading && styles.disabledButton]}
        onPress={handleLogout}
        disabled={isLoading}
      >
        {isLoading ? (
          <View style={styles.buttonContent}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.buttonText}>Đang đăng xuất...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Đăng xuất</Text>
        )}
      </TouchableOpacity>

      <Modal animationType="fade" transparent={true} visible={isDialogVisible} onRequestClose={() => setIsDialogVisible(false)} >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xác nhận xuất CSV</Text>
            <View style={styles.modalBody}>
              <Text>File sẽ được lưu vào thư mục Downloads với tên:</Text>
              <Text style={styles.fileNameText}>reports.csv</Text>
              {Platform.OS === 'android' && !hasPermission && (
                <Text style={styles.warningText}>Ứng dụng cần quyền truy cập bộ nhớ để lưu file.</Text>
              )}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsDialogVisible(false)}>
                <Text style={styles.modalButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={handleExportCSV}>
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const TouchableSettingItem: React.FC<{
  icon: string;
  title: string;
  onPress: () => void;
  isLoading?: boolean;
}> = ({ icon, title, onPress, isLoading = false }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={isLoading}>
    <Icon name={icon} size={20} style={styles.icon} />
    <Text style={styles.settingText}>{title}</Text>
    {isLoading ? <ActivityIndicator size="small" color="#999" /> : <Icon name="chevron-right" size={14} style={styles.iconRight} />}
  </TouchableOpacity>
);

const SettingItem: React.FC<{ icon: string; title: string }> = ({ icon, title }) => (
  <TouchableOpacity style={styles.settingItem}>
    <Icon name={icon} size={20} style={styles.icon} />
    <Text style={styles.settingText}>{title}</Text>
    <Icon name="chevron-right" size={14} style={styles.iconRight} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    padding: 15,
  },
  profileCard: {
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "#fff",
    paddingVertical: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  settingSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#444",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    justifyContent: "space-between",
  },
  icon: {
    marginRight: 10,
    color: "#4b4b4b",
  },
  settingText: {
    fontSize: 16,
    flex: 1,
    color: "#4b4b4b",
  },
  iconRight: {
    color: "#4b4b4b",
  },
  logoutButton: {
    backgroundColor: "#FF5C5C",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 5,
  },
  disabledButton: {
    backgroundColor: "#ddd",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  modalContent: {
    width: 300,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 10,
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalBody: {
    marginBottom: 20,
    alignItems: "center",
  },
  fileNameText: {
    fontWeight: "bold",
    color: "#333",
  },
  warningText: {
    color: "red",
    fontSize: 14,
    marginTop: 5,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  confirmButton: {
    backgroundColor: "#28a745",
  },
  modalButtonText: {
    fontSize: 16,
    color: "#444",
  },
});

export default ProfileScreen;
