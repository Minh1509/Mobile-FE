import React, { useState } from "react";
import {
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
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { Image } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import ExpenseComponentV2 from "@/app/Components/ExpenseComponentV2";

const ExpenseScreen = () => {
  const [money, setMoney] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("Chọn loại");
  const [location, setLocation] = useState("Chọn địa điểm");
  const [date, setDate] = useState(new Date());
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");

  const [imageUri, setImageUri] = useState<string | null>(null);

  const categories = ["Ăn uống", "Mua sắm", "Di chuyển", "Hóa đơn", "Khác"];
  const locations = ["Nhà riêng", "Công ty", "Trung tâm thương mại", "Khác"];

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
  
  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <TouchableOpacity onPress={() => {}}>
          <Text className="text-lg">{"<"}</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold">Thêm Chi Tiêu</Text>
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

      {showDetails && (
        <>
          {/* Các mục chi tiêu */}
          <View className="bg-white rounded-lg p-4 my-3">
            <ExpenseComponent
              icon="help-circle-outline"
              text={category}
              onPress={() => setShowCategoryModal(true)}
            />
            <ExpenseComponent
              icon="map-marker"
              text={location}
              onPress={() => setShowLocationModal(true)}
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
              onPress={() => {}}
            />
          </View>

          {/* Input ghi chú */}
          <TextInput
            className="bg-white p-4 text-base rounded-lg my-3"
            placeholder="Nhập ghi chú"
            value={note}
            onChangeText={setNote}
          />

          <View className="bg-white rounded-lg p-4 my-3">
            {imageUri && <Image source={{ uri: imageUri }} className="w-full h-60 mt-3 rounded-lg object-cover" />}
            {/* <ExpenseComponent icon="image" text="Chọn ảnh" onPress={pickImage} />
            <ExpenseComponent icon="camera" text="Chụp ảnh" onPress={takePhoto} /> */}
            <View className="flex-row items-center justify-between mt-4">
              <ExpenseComponentV2 icon="image" text="Chọn ảnh" onPress={pickImage} />
              <View className="w-px h-10 bg-gray-300" /> {/* Đường kẻ phân cách */}
              <ExpenseComponentV2 icon="camera" text="Chụp ảnh" onPress={takePhoto} />
            </View>
          </View>
        </>  
      )}

      {/* Nút ẩn/hiện chi tiết */}
      <TouchableOpacity
        className="p-3 bg-blue-500 rounded-lg my-3"
        onPress={() => setShowDetails(!showDetails)}
      >
        <Text className="text-white text-center">
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
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-5 rounded-lg w-4/5">
            <Text className="text-lg font-bold">Chọn loại chi tiêu</Text>
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

      {/* Modal Chọn Địa Điểm */}
      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-5 rounded-lg w-4/5">
            <Text className="text-lg font-bold">Chọn địa điểm</Text>
            <FlatList
              data={locations}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="p-3 border-b border-gray-200"
                  onPress={() => {
                    setLocation(item);
                    setShowLocationModal(false);
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
  );
};

export default ExpenseScreen;
