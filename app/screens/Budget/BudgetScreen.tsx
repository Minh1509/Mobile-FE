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
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import ExpenseComponent from "@/app/Components/ExpenseComponent";
import { RootStackParamList } from "@/app/Types/types";
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { formatDate, normalizeDate } from "@/app/utils/normalizeDate";
import { addBudget } from "@/app/services/budget.service";
import { useUserAuth } from "@/app/hooks/userAuth"; // Lấy userId từ context

type BudgetScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const BudgetScreen = () => {
  const { userId } = useUserAuth(); // Giả định có userId ở đây

  const [money, setMoney] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("Chọn loại ngân sách");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const categories = ["Di chuyển", "Ăn uống", "Tiền điện", "Mua sắm", "Tiền nước", "Học tập", "Giải trí", "Thuê nhà", "Internet", "Khác"];

  const onChangeFromDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowFromDatePicker(false);
    if (event.type === "set" && selectedDate) {
      setFromDate(selectedDate);
    }
  };

  const onChangeToDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowToDatePicker(false);
    if (event.type === "set" && selectedDate) {
      setToDate(selectedDate);
    }
  };

  const handleSaveBudget = async () => {
    if (!money || category === "Chọn loại ngân sách") {
      Alert.alert("Lỗi", "Vui lòng nhập số tiền và chọn loại ngân sách!");
      return;
    }

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
      Alert.alert("Thành công", "Ngân sách đã được lưu thành công!");
      navigation.goBack();
    } catch (error) {
      console.error("Lỗi khi lưu ngân sách:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi lưu ngân sách!");
    }
  };

  const navigation = useNavigation<BudgetScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={navigation.goBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Thêm ngân sách</Text>
          <TouchableOpacity onPress={handleSaveBudget}>
            <Text style={styles.saveText}>Lưu</Text>
          </TouchableOpacity>
        </View>

        {/* Input số tiền */}
        <TextInput
          style={styles.input}
          placeholder="Nhập số tiền"
          keyboardType="numeric"
          value={money}
          onChangeText={setMoney}
        />

        {/* Nút ẩn/hiện chi tiết */}
        <TouchableOpacity style={styles.toggleButton} onPress={() => setExpanded(!expanded)}>
          <Text style={styles.toggleText}>Chi tiết</Text>
          <MaterialCommunityIcons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#007bff"
          />
        </TouchableOpacity>

        {/* Phần chi tiết (ẩn/hiện) */}
        {expanded && (
          <View style={styles.detailsContainer}>
            <ExpenseComponent
              icon="help-circle-outline"
              text={category}
              onPress={() => setShowCategoryModal(true)}
            />
            <ExpenseComponent icon="calendar" text={`Từ ngày: ${formatDate(fromDate)}`} onPress={() => setShowFromDatePicker(true)} />
            <ExpenseComponent icon="calendar" text={`Đến ngày: ${formatDate(toDate)}`} onPress={() => setShowToDatePicker(true)} />
            <ExpenseComponent icon="pencil" text={note || "Ghi Chú"} onPress={() => { }} />
          </View>
        )}

        {/* Input ghi chú */}
        {expanded && (
          <TextInput
            style={styles.input}
            placeholder="Nhập ghi chú"
            value={note}
            onChangeText={setNote}
          />
        )}

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

        {/* Modal Chọn Loại ngân sách */}
        <Modal
          visible={showCategoryModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Chọn loại ngân sách</Text>
              <FlatList
                data={categories}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setCategory(item);
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text style={styles.modalText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BudgetScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f9",
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  saveText: {
    color: "#007bff",
    fontWeight: "bold",
    fontSize: 18
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    fontSize: 16,
    borderRadius: 10,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginVertical: 6,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  detailsContainer: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  modalText: {
    fontSize: 16,
  },
});