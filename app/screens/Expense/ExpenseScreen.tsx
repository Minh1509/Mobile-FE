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

} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import ExpenseComponent from "@/app/Components/ExpenseComponent";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { Image } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import ExpenseComponentV2 from "@/app/Components/ExpenseComponentV2";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { RootStackParamList } from "@/app/Types/types";
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import VNDFormat from "@/app/utils/MoneyParse";

type ExpenseScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ExpenseScreen = () => {
  const [money, setMoney] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("Chọn loại");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date());
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);


  const [imageUri, setImageUri] = useState<string | null>(null);

  const categories = ["Ăn uống", "Mua sắm", "Di chuyển", "Tiền điện", "Tiền nước", "Học tập", "Giải trí", "Thuê nhà", "Internet", "Khác"];
  // const locations = ["Nhà riêng", "Công ty", "Trung tâm thương mại", "Khác"];

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (event.type === "set" && selectedDate) {
      setDate(selectedDate);
    }
  };

  const onChangeTime = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowPicker(false);
    if (event.type === "set" && selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
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

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
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

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleMoneyChange = (text: string) => {
    // Loại bỏ tất cả ký tự không phải số
    const numericValue = text.replace(/[^0-9]/g, "");

    // Nếu có giá trị nhập vào, format lại số tiền
    if (numericValue) {
      setMoney(String(Number(numericValue)));
    } else {
      setMoney(""); // Nếu người dùng xóa hết thì trả về chuỗi rỗng
    }
  };

  const navigation = useNavigation<ExpenseScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={navigation.goBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Thêm Chi Tiêu</Text>
          <TouchableOpacity>
            <Text style={styles.saveText}>Lưu</Text>
          </TouchableOpacity>
        </View>

        {/* Input số tiền */}
        <TextInput
          style={styles.input}
          placeholder="Nhập số tiền"
          keyboardType="numeric"
          value={money}
          onChangeText={handleMoneyChange}
        />

        {showDetails && (
          <>
            {/* Các mục chi tiêu */}
            <View style={styles.card}>
              <ExpenseComponent
                icon="help-circle-outline"
                text={category}
                onPress={() => setShowCategoryModal(true)}
              />
              {/* Ô nhập mô tả */}
              <TextInput
                style={styles.inputDescription}
                placeholder="Nhập mô tả"
                value={description}
                onChangeText={setDescription}
              />
              <TextInput
                style={styles.inputDescription}
                placeholder="Nhập địa điểm"
                value={location}
                onChangeText={setLocation}
              />
              <ExpenseComponent
                icon="credit-card"
                text={paymentMethod || "Chọn phương thức thanh toán"}
                onPress={() => setShowPaymentModal(true)}
              />
              <ExpenseComponent
                icon="calendar"
                text={date.toLocaleDateString()}
                onPress={showDatePicker}
              />

              <ExpenseComponent
                icon="clock-outline"
                text={date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
                onPress={showTimePicker}
              />
              <ExpenseComponent
                icon="pencil"
                text={note || "Ghi Chú"}
                onPress={() => { }}
              />
            </View>

            {/* Input ghi chú */}
            <TextInput
              className="bg-white p-4 text-base rounded-lg my-3"
              placeholder="Nhập ghi chú"
              value={note}
              onChangeText={setNote}
            />

            <View className="bg-white rounded-lg p-2 my-3">
              {imageUri && <Image source={{ uri: imageUri }} className="w-full h-60 mt-3 rounded-lg object-cover" />}
              <View className="flex-row items-center justify-between mt-2">
                <ExpenseComponentV2 icon="image" text="Chọn ảnh" onPress={pickImage} />
                <View className="w-px h-10 bg-gray-300" />
                <ExpenseComponentV2 icon="camera" text="Chụp ảnh" onPress={takePhoto} />
              </View>
            </View>
          </>
        )}

        {/* Nút ẩn/hiện chi tiết */}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowDetails(!showDetails)}
        >
          <Text style={styles.toggleButtonText}>
            {showDetails ? "Ẩn bớt" : "Hiển thêm"}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode={pickerMode}
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={pickerMode === "date" ? onChangeDate : onChangeTime}
          />
        )}

        {/* Modal Chọn Loại Chi Tiêu */}
        <Modal
          visible={showCategoryModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Chọn loại chi tiêu</Text>
              <FlatList
                data={categories}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => {
                      setCategory(item);
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text>{String(item)}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Modal Chọn Địa Điểm */}
        {/* <Modal
          visible={showLocationModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowLocationModal(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Chọn địa điểm</Text>
              <FlatList
                data={locations}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => {
                      setLocation(item);
                      setShowLocationModal(false);
                    }}
                  >
                    <Text>{String(item)}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal> */}

        {/* Modal Chọn Phương Thức Thanh Toán */}
        <Modal
          visible={showPaymentModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPaymentModal(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Chọn phương thức thanh toán</Text>
              <FlatList
                data={["Tiền mặt", "Thẻ tín dụng", "Ví điện tử"]}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => {
                      setPaymentMethod(item);
                      setShowPaymentModal(false);
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  scrollContainer: { flexGrow: 1, padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  headerText: { fontSize: 18, fontWeight: "bold" },
  saveText: { color: "#1E90FF", fontWeight: "bold", fontSize: 18 },
  input: { backgroundColor: "#fff", padding: 16, fontSize: 18, borderRadius: 8, marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 8, padding: 16, marginBottom: 12 },
  toggleButton: { backgroundColor: "#1E90FF", padding: 12, borderRadius: 8, alignItems: "center" },
  toggleButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContainer: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  listItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  inputDescription: { backgroundColor: "#f8f9fa", borderRadius: 10, padding: 10, fontSize: 16, color: "#333", marginVertical: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
});


export default ExpenseScreen;


