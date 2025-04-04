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
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import ExpenseComponent from "@/app/Components/ExpenseComponent";
import { RootStackParamList } from "@/app/Types/types";
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { formatDate } from "@/app/utils/normalizeDate";
import { addBudget } from "@/app/services/budget.service";
import { useUserAuth } from "@/app/hooks/userAuth";

type BudgetScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const BudgetScreen = () => {
  const { userId, loading } = useUserAuth();
  const navigation = useNavigation<BudgetScreenNavigationProp>();

  const [money, setMoney] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("Chọn loại ngân sách");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const categories = ["Tổng", "Tiền điện", "Thuê nhà", "Internet", "Di chuyển", "Giải trí", "Mua sắm", "Học tập", "Tiền nước", "Ăn uống", "Khác"];

  const onChangeFromDate = (event: any, selectedDate?: Date) => {
    setShowFromDatePicker(false);
    if (selectedDate) {
      setFromDate(selectedDate);
      // Đảm bảo fromDate không lớn hơn toDate
      if (selectedDate > toDate) setToDate(selectedDate);
    } 
  };

  const onChangeToDate = (event: any, selectedDate?: Date) => {
    setShowToDatePicker(false);
    if (selectedDate) {
      // Đảm bảo toDate không nhỏ hơn fromDate
      if (selectedDate < fromDate) {
        Alert.alert("Lỗi", "Ngày kết thúc không thể nhỏ hơn ngày bắt đầu!");
        return;
      }
      setToDate(selectedDate); 
    } 
  };

  const handleSaveBudget = async () => {
    if (!money || parseFloat(money) <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập số tiền hợp lệ (lớn hơn 0)!");
      return;
    }
    if (!userId) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập để thêm ngân sách!");
      return;
    }
    if (fromDate > toDate) {
      Alert.alert("Lỗi", "Ngày bắt đầu không thể lớn hơn ngày kết thúc!");
      return;
    }
    // Nếu không chọn category, mặc định là "Tổng"
    const finalCategory = category === "Chọn loại ngân sách" ? "Tổng" : category;

    const budgetData = {
      userId,
      amountLimit: parseFloat(money),
      category,
      note,
      startDate: formatDate(fromDate),
      endDate: formatDate(toDate),
    };

    try {
      await addBudget(budgetData);
      Alert.alert("Thành công", `Ngân sách cho "${finalCategory}" đã được lưu từ ${formatDate(fromDate)} đến ${formatDate(toDate)}!`);
      navigation.goBack();
    } catch (error) {
      console.error("Lỗi khi lưu ngân sách:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi lưu ngân sách!");
    }
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
            <TouchableOpacity onPress={navigation.goBack} style={styles.iconButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerText} numberOfLines={1} ellipsizeMode="tail">
              Thêm Ngân Sách
            </Text>
            <TouchableOpacity onPress={handleSaveBudget} style={styles.saveButton}>
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

          {/* Toggle Details */}
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setExpanded(!expanded)}
          >
            <Text style={styles.toggleButtonText}>
              {expanded ? "Ẩn chi tiết" : "Hiện chi tiết"}
            </Text>
          </TouchableOpacity>

          {/* Details Section */}
          {expanded && (
            <View style={styles.detailsCard}>
              <ExpenseComponent
                icon="help-circle-outline"
                text={category}
                onPress={() => setShowCategoryModal(true)}
              />
              <ExpenseComponent
                icon="calendar"
                text={`Từ ngày: ${formatDate(fromDate)}`}
                onPress={() => setShowFromDatePicker(true)}
              />
              <ExpenseComponent
                icon="calendar"
                text={`Đến ngày: ${formatDate(toDate)}`}
                onPress={() => setShowToDatePicker(true)}
              />
              <TextInput
                style={styles.inputField}
                placeholder="Ghi chú"
                value={note}
                onChangeText={setNote}
              />
            </View>
          )}

          {/* Date Pickers */}
          {showFromDatePicker && (
            <DateTimePicker
              value={fromDate}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={onChangeFromDate}
            />
          )}
          {showToDatePicker && (
            <DateTimePicker
              value={toDate}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={onChangeToDate}
            />
          )}

          {/* Category Modal */}
          <Modal visible={showCategoryModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Chọn loại ngân sách</Text>
                <FlatList
                  data={categories}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => {
                        setCategory(item);
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
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
    marginHorizontal: 12,
    textAlign: "center",
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
    color: "#4CAF50",
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
    color: "#4CAF50",
  },
  toggleButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    elevation: 3,
    marginBottom: 20,
  },
  toggleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
    backgroundColor: "#4CAF50",
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
});

export default BudgetScreen;