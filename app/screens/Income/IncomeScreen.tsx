import React, { useState, useEffect } from "react";
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
import ExpenseComponent from "@/app/Components/ExpenseComponent";
import ExpenseComponentV2 from "@/app/Components/ExpenseComponentV2";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { RootStackParamList } from "@/app/Types/types";
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from "react-native";
import { addIncome } from "@/app/services/firestore.service";
import { ITransaction, PayMethod, TransactionType } from "@/app/interface/Transaction";
import { useUserAuth } from "@/app/hooks/userAuth";
import { getCategories } from "@/app/services/firestore.service";
import { ICategory } from "@/app/interface/Category";
import { formatDate, formatTime } from "@/app/utils/normalizeDate";

type IncomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const IncomeScreen = () => {
  const [money, setMoney] = useState("");
  const [note, setNote] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [categoryName, setCategoryName] = useState<string>("Chọn loại");
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
  const [categories, setCategories] = useState<ICategory[]>([]); // Thay đổi kiểu thành string[]
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const paymentMethods = ["Tiền mặt", "Thẻ tín dụng", "Ví điện tử"];
  const navigation = useNavigation<IncomeScreenNavigationProp>();
  const { userId, loading } = useUserAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const fetchedCategories = await getCategories();
        console.log("Danh mục:", fetchedCategories); // Log để kiểm tra
        setCategories(fetchedCategories); // Ép kiểu thành string[]
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
        Alert.alert("Lỗi", "Không thể lấy danh sách danh mục. Vui lòng thử lại.");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

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

      if (!categoryId) {
        Alert.alert("Lỗi", "Vui lòng chọn loại thu nhập.");
        return;
      }

      const incomeData: Omit<ITransaction, 'id' | 'type' | 'createdAt' | 'updatedAt'> = {
        userId: userId,
        category: categoryName, // Lưu categoryId (ở đây là tên danh mục)
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

  if (loading || categoriesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={navigation.goBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Thêm Thu Nhập</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveText}>Lưu</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Nhập số tiền"
          keyboardType="numeric"
          value={money}
          onChangeText={setMoney}
        />

        {showDetails && (
          <>
            <View style={styles.card}>
              <ExpenseComponent
                icon="help-circle-outline"
                text={categoryName}
                onPress={() => setShowCategoryModal(true)}
              />
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
                text={formatDate(date)}
                onPress={showDatePicker}
              />
              <ExpenseComponent
                icon="clock-outline"
                text={formatDisplayTime(date)}
                onPress={showTimePicker}
              />
              <ExpenseComponent
                icon="pencil"
                text={note || "Ghi Chú"}
                onPress={() => {}}
              />
            </View>

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

        <Modal
          visible={showCategoryModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Chọn loại chi tiêu</Text>
              <ScrollView>
                {categories.map((item, index) => (
                  <TouchableOpacity
                    key={index.toString()} // Sử dụng index làm key
                    style={styles.listItem}
                    onPress={() => {
                      setCategoryId(item.id);
                      setCategoryName(item.name);
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

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
                data={paymentMethods}
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
  modalContainer: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%', maxHeight: "60%" },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  listItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  inputDescription: { backgroundColor: "#f8f9fa", borderRadius: 10, padding: 10, fontSize: 16, color: "#333", marginVertical: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
});

export default IncomeScreen;