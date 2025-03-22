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
  Platform
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import ExpenseComponent from "@/app/Components/ExpenseComponent";

const BudgetScreen = () => {
  const [money, setMoney] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("Chọn loại ngân sách");
  const [date, setDate] = useState(new Date());
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [expanded, setExpanded] = useState(false); // Trạng thái ẩn/hiện

  const categories = ["Ăn uống", "Mua sắm", "Di chuyển", "Hóa đơn", "Khác"];

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (event.type === "set" && selectedDate) {
      setDate(selectedDate);
    }
  };

  const showDatePicker = () => {
    setShowPicker(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => {}}>
            <Text className="text-lg">{"<"}</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold">Thêm Ngân Sách</Text>
          <TouchableOpacity>
            <Text className="text-blue-500 font-bold">Lưu</Text>
          </TouchableOpacity>
        </View>

        {/* Input số tiền */}
        <TextInput
          className="bg-white p-4 text-lg rounded-lg my-3"
          placeholder="Nhập số tiền"
          keyboardType="numeric"
          value={money}
          onChangeText={setMoney}
        />

        {/* Nút ẩn/hiện chi tiết */}
        <TouchableOpacity
          className="flex-row justify-between items-center bg-white p-4 rounded-lg my-3"
          onPress={() => setExpanded(!expanded)}
        >
          <Text className="text-base font-bold">Chi tiết</Text>
          <Text className="text-blue-500">{expanded ? "Ẩn bớt ▲" : "Hiện thêm ▼"}</Text>
        </TouchableOpacity>

        {/* Phần chi tiết (ẩn/hiện) */}
        {expanded && (
          <View className="bg-white rounded-lg p-4 my-3">
            <ExpenseComponent
              icon="help-circle-outline"
              text={category}
              onPress={() => setShowCategoryModal(true)}
            />
            <ExpenseComponent
              icon="calendar"
              text={date.toLocaleDateString()}
              onPress={showDatePicker}
            />
            <ExpenseComponent
              icon="pencil"
              text={note || "Ghi Chú"}
              onPress={() => {}}
            />
          </View>
        )}

        {/* Input ghi chú (nếu cần hiển thị riêng) */}
        {expanded && (
          <TextInput
            className="bg-white p-4 text-base rounded-lg my-3"
            placeholder="Nhập ghi chú"
            value={note}
            onChangeText={setNote}
          />
        )}

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={onChangeDate}
          />
        )}

        {/* Modal Chọn Loại Ngân Sách */}
        <Modal
          visible={showCategoryModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
            <View className="bg-white p-5 rounded-lg w-4/5">
              <Text className="text-lg font-bold">Chọn loại ngân sách</Text>
              <FlatList
                data={categories}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="p-3 border-b border-gray-200"
                    onPress={() => {
                      setCategory(item);
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text>{item}</Text>
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
