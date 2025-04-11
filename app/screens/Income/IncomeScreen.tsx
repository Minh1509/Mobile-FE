import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import ExpenseComponent from "@/app/Components/ExpenseComponent";
import ExpenseComponentV2 from "@/app/Components/ExpenseComponentV2";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { RootStackParamList } from "@/app/Types/types";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import { addIncome } from "@/app/services/budget.service";
import { ITransaction, PayMethod } from "@/app/interface/Transaction";
import { useUserAuth } from "@/app/hooks/userAuth";
import { formatDate, formatTime } from "@/app/utils/normalizeDate";

type IncomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const IncomeScreen = () => {
  const [money, setMoney] = useState("");
  const [note, setNote] = useState("");
  const [categoryName, setCategoryName] = useState<string>("Chọn loại");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date());
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const categories = ["Lương", "Thưởng", "Đầu tư", "Khác"];
  const paymentMethods = ["Tiền mặt", "Thẻ tín dụng", "Ví điện tử"];
  const navigation = useNavigation<IncomeScreenNavigationProp>();
  const { userId, loading } = useUserAuth();

  const mapPaymentMethodToEnum = (method: string): PayMethod => {
    switch (method) {
      case "Tiền mặt":
        return PayMethod.CASH;
      case "Thẻ tín dụng":
        return PayMethod.CARD;
      case "Ví điện tử":
        return PayMethod.BANK_TRANSFER;
      default:
        return PayMethod.CASH;
    }
  };

  const formatDisplayTime = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleSave = async () => {
    try {
      if (loading) {
        Alert.alert("Đang tải", "Vui lòng chờ trong giây lát...");
        return;
      }
      if (!userId) {
        Alert.alert("Lỗi", "Bạn cần đăng nhập để thêm thu nhập.");
        return;
      }
      if (!money || parseFloat(money) <= 0) {
        Alert.alert("Lỗi", "Vui lòng nhập số tiền hợp lệ (lớn hơn 0).");
        return;
      }
      if (!categoryName || categoryName === "Chọn loại") {
        Alert.alert("Lỗi", "Vui lòng chọn loại thu nhập.");
        return;
      }

      const incomeData: Omit<
        ITransaction,
        "id" | "type" | "createdAt" | "updatedAt"
      > = {
        userId: userId,
        category: categoryName,
        date: formatDate(date),
        time: formatTime(date),
        amount: parseFloat(money),
        description,
        paymentMethod: mapPaymentMethodToEnum(paymentMethod),
        note,
        location,
        image: imageUri || "",
      };

      const transactionId = await addIncome(incomeData);
      Alert.alert("Thành công", "Thu nhập đã được thêm thành công!");
      navigation.goBack();
    } catch (error) {
      console.error("Lỗi khi lưu thu nhập:", error);
      Alert.alert("Lỗi", "Không thể thêm thu nhập. Vui lòng thử lại.");
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const onChangeTime = (event: any, selectedTime?: Date) => {
    setShowPicker(false);
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0);
      setDate(newDate);
    }
  };

  const showDatePicker = () => {
    setPickerMode("date");
    setShowPicker(true);
  };

  const showTimePicker = () => {
    setPickerMode("time");
    setShowPicker(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== "granted") {
      alert("Bạn cần cấp quyền để sử dụng camera");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={navigation.goBack}
              style={styles.iconButton}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={28}
                color="#fff"
              />
            </TouchableOpacity>
            <Text style={styles.headerText}>Thêm Thu Nhập</Text>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveText}>Lưu</Text>
            </TouchableOpacity>
          </View>

          {/* Money Input */}
          <View style={styles.moneyInputContainer}>
            <TextInput
              style={styles.moneyInput}
              placeholder="0.00"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={money}
              onChangeText={setMoney}
            />
            <Text style={styles.currencyText}>VND</Text>
          </View>

          {/* Details Section */}
          {showDetails && (
            <View style={styles.detailsCard}>
              <ExpenseComponent
                icon="help-circle-outline"
                text={categoryName}
                onPress={() => setShowCategoryModal(true)}
              />
              <TextInput
                style={styles.inputField}
                placeholder="Mô tả thu nhập"
                value={description}
                onChangeText={setDescription}
              />
              <TextInput
                style={styles.inputField}
                placeholder="Địa điểm"
                value={location}
                onChangeText={setLocation}
              />
              <ExpenseComponent
                icon="credit-card"
                text={paymentMethod || "Phương thức thanh toán"}
                onPress={() => setShowPaymentModal(true)}
              />
              <ExpenseComponent
                icon="calendar"
                text={formatDate(date)}
                onPress={showDatePicker}
              />
              <ExpenseComponent
                icon="clock-outline"
                text={formatDisplayTime(date)}
                onPress={showTimePicker}
              />
              <TextInput
                style={styles.inputField}
                placeholder="Ghi chú"
                value={note}
                onChangeText={setNote}
              />
              <View style={styles.imageContainer}>
                {imageUri && (
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.previewImage}
                  />
                )}
                <View style={styles.imageButtons}>
                  <ExpenseComponentV2
                    icon="image"
                    text="Chọn ảnh"
                    onPress={pickImage}
                  />
                  <ExpenseComponentV2
                    icon="camera"
                    text="Chụp ảnh"
                    onPress={takePhoto}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Toggle Details */}
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowDetails(!showDetails)}
          >
            <Text style={styles.toggleButtonText}>
              {showDetails ? "Ẩn chi tiết" : "Hiện chi tiết"}
            </Text>
          </TouchableOpacity>

          {/* DateTime Picker */}
          {showPicker && (
            <DateTimePicker
              value={date}
              mode={pickerMode}
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={pickerMode === "date" ? onChangeDate : onChangeTime}
            />
          )}

          {/* Category Modal */}
          <Modal visible={showCategoryModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Chọn loại thu nhập</Text>
                <FlatList
                  data={categories}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => {
                        setCategoryName(item);
                        setShowCategoryModal(false);
                      }}
                    >
                      <Text style={styles.modalItemText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item}
                />
                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={() => setShowCategoryModal(false)}
                >
                  <Text style={styles.closeModalText}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Payment Method Modal */}
          <Modal visible={showPaymentModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Phương thức thanh toán</Text>
                <FlatList
                  data={paymentMethods}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => {
                        setPaymentMethod(item);
                        setShowPaymentModal(false);
                      }}
                    >
                      <Text style={styles.modalItemText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item}
                />
                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={() => setShowPaymentModal(false)}
                >
                  <Text style={styles.closeModalText}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: {
    flex: 1,
    backgroundColor: "#f0f4f8", // Màu nền xám nhạt thay gradient
  },
  scrollContainer: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#34d399", // Header xanh lá
    paddingVertical: 12, // Giảm padding dọc
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    flex: 1, // Cho phép co giãn
    marginHorizontal: 12, // Khoảng cách hai bên
    textAlign: "center", // Căn giữa
  },
  iconButton: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 3,
  },
  saveText: {
    color: "#34d399",
    fontSize: 14,
    fontWeight: "600",
  },
  moneyInputContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  moneyInput: {
    flex: 1,
    fontSize: 26,
    fontWeight: "600",
    color: "#333",
  },
  currencyText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#34d399",
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputField: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#333",
    marginVertical: 8,
    elevation: 1,
  },
  imageContainer: {
    marginTop: 12,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  imageButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  toggleButton: {
    backgroundColor: "#2196F3", // Nút xanh dương
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    elevation: 3,
  },
  toggleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "85%",
    maxHeight: "70%",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
  },
  closeModalButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: "#2196F3",
    borderRadius: 12,
    alignItems: "center",
  },
  closeModalText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#34d399", // Xanh lá cho loading
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
});

export default IncomeScreen;
