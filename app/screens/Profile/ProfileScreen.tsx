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
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { auth } from "@/firebase_config.env";
import { signOut } from "firebase/auth";
import { RootStackParamList } from "@/app/Types/types";
import { ReportService } from "@/app/services/report.service";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useUserAuth } from "@/app/hooks/userAuth";

type ProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Profile"
>;

const ProfileScreen: React.FC = () => {
  const { displayName, email } = useUserAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [filePath, setFilePath] = useState(
    FileSystem.documentDirectory + "Download/reports.csv"
  );
  const [hasPermission, setHasPermission] = useState(false);
  const [isReportGenerating, setIsReportGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("01");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [isMonthYearModalVisible, setIsMonthYearModalVisible] = useState(false);
  const [isExportCsvModalVisible, setIsExportCsvModalVisible] = useState(false);

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === "android") {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        setHasPermission(status === "granted");
        if (status !== "granted") {
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

  const confirmExportCSV = () => setIsExportCsvModalVisible(true);

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);

      if (Platform.OS === "android" && !hasPermission) {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        setHasPermission(status === "granted");
        if (status !== "granted") {
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
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (Platform.OS === "android") {
        // Lưu file vào thư mục Downloads
        const asset = await MediaLibrary.createAssetAsync(tempFilePath);
        await MediaLibrary.createAlbumAsync("Downloads", asset, false);

        Alert.alert(
          "Thành công",
          "Báo cáo CSV đã được lưu thành công vào thư mục Downloads!",
          [
            {
              text: "OK",
            },
          ]
        );
      } else {
        const downloadDir = FileSystem.documentDirectory + "Download/";
        await FileSystem.makeDirectoryAsync(downloadDir, {
          intermediates: true,
        });
        await FileSystem.moveAsync({
          from: tempFilePath,
          to: downloadDir + "reports.csv",
        });
        Alert.alert("Thành công", "Báo cáo CSV đã được lưu thành công!");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Không xác định";
      Alert.alert("Lỗi", `Đã xảy ra lỗi khi xuất CSV: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsReportGenerating(true);

      // Tính toán startDate và endDate từ selectedMonth và selectedYear
      const startDate = new Date(`${selectedYear}-${selectedMonth}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + 1);
      endDate.setDate(0); // Đặt ngày cuối cùng của tháng

      const report = await ReportService.generateReport(startDate, endDate);

      if (report && report.startDate) {
        // Tách chuỗi startDate từ báo cáo
        const [day, month, year] = report.startDate.split("/");

        Alert.alert(
          "Thành công",
          `Đã tạo báo cáo cho tháng ${month}/${year} thành công!`
        );
      } else {
        Alert.alert("Lỗi", "Không thể tạo báo cáo. Vui lòng thử lại.");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tạo báo cáo. Vui lòng thử lại.");
    } finally {
      setIsReportGenerating(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileCard}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=3" }}
          style={styles.avatar}
        />
        <Text style={styles.username}>{displayName}</Text>
      </View>

      <View style={styles.settingSection}>
        <Text style={styles.sectionTitle}>Báo Cáo Tài Chính</Text>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setIsMonthYearModalVisible(true)}
        >
          <Icon name="bar-chart" size={20} style={styles.icon} />
          <Text style={styles.settingText}>Tạo báo cáo hàng tháng</Text>
        </TouchableOpacity>
        <TouchableSettingItem
          icon="file-text-o"
          title="Xuất báo cáo CSV"
          onPress={confirmExportCSV}
          isLoading={isExporting}
        />
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isMonthYearModalVisible}
        onRequestClose={() => setIsMonthYearModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn tháng và năm</Text>
            <View style={styles.modalBody}>
              <TextInput
                style={styles.input}
                placeholder="Tháng (01-12)"
                keyboardType="numeric"
                value={selectedMonth}
                onChangeText={setSelectedMonth}
                maxLength={2}
              />
              <TextInput
                style={styles.input}
                placeholder="Năm"
                keyboardType="numeric"
                value={selectedYear}
                onChangeText={setSelectedYear}
                maxLength={4}
              />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsMonthYearModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  setIsMonthYearModalVisible(false);
                  handleGenerateReport();
                }}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                  Xác nhận
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

      <Modal
        animationType="fade"
        transparent={true}
        visible={isExportCsvModalVisible}
        onRequestClose={() => setIsExportCsvModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xác nhận xuất CSV</Text>
            <View style={styles.modalBody}>
              <Text>File sẽ được lưu vào thư mục Downloads với tên:</Text>
              <Text style={styles.fileNameText}>reports.csv</Text>
              {Platform.OS === "android" && !hasPermission && (
                <Text style={styles.warningText}>
                  Ứng dụng cần quyền truy cập bộ nhớ để lưu file.
                </Text>
              )}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsExportCsvModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  setIsExportCsvModalVisible(false);
                  handleExportCSV();
                }}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                  Xác nhận
                </Text>
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
}> = ({ icon, title, onPress, isLoading = false }) => {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={isLoading}
    >
      <Icon name={icon} size={20} style={styles.icon} />
      <Text style={styles.settingText}>{title}</Text>
      {isLoading && (
        <ActivityIndicator size="small" style={{ marginLeft: 10 }} />
      )}
    </TouchableOpacity>
  );
};

const SettingItem: React.FC<{ icon: string; title: string }> = ({
  icon,
  title,
}) => (
  <TouchableOpacity style={styles.settingItem}>
    <Icon name={icon} size={20} style={styles.icon} />
    <Text style={styles.settingText}>{title}</Text>
    <Icon name="chevron-right" size={14} style={styles.iconRight} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  modalBody: {
    marginBottom: 18,
    alignItems: "center",
  },
  input: {
    width: "80%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingLeft: 10,
    marginBottom: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileCard: {
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#ffffff",
    paddingVertical: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#cbd5e0",
  },
  username: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a202c",
  },
  settingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#2d3748",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  icon: {
    marginRight: 12,
    color: "#FF6347",
  },
  settingText: {
    fontSize: 15,
    flex: 1,
    color: "#2d3748",
  },
  iconRight: {
    color: "#a0aec0",
  },
  logoutButton: {
    backgroundColor: "#e53e3e",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: "#a0aec0",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 14,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#2d3748",
  },

  fileNameText: {
    fontWeight: "bold",
    color: "#3182ce",
    marginTop: 6,
  },
  warningText: {
    color: "#e53e3e",
    fontSize: 13,
    marginTop: 10,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#edf2f7",
  },
  confirmButton: {
    backgroundColor: "#3182ce",
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});

export default ProfileScreen;
