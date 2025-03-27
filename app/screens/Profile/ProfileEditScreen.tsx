import React, { useState } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { RootStackParamList } from "@/app/Types/types";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

type ProfileEditScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ProfileEditScreen = () => {
  const [name, setName] = useState("Trần Ngọc Tiến");
  const [monthlyIncome, setMonthlyIncome] = useState("30.000.000 VND");
  const [dob, setDob] = useState("11/09/2022");
  const [gender, setGender] = useState("Male");
  const [image, setImage] = useState<string | null>(null);

  const navigation = useNavigation<ProfileEditScreenNavigationProp>();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Tài Khoản</Text>
        <TouchableOpacity>
          <Text style={styles.saveText}>Lưu</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.avatar} />
          ) : (
            <Image
              source={require("@/assets/images/default-avatar.jpg")} // Thay bằng ảnh mặc định nếu cần
              style={styles.avatar}
            />
          )}
          <View style={styles.editIcon}>
            <MaterialCommunityIcons name="plus-circle" size={24} color="#1E90FF" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Họ Tên</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} />

        <Text style={styles.label}>Tiền Hàng Tháng</Text>
        <TextInput value={monthlyIncome} onChangeText={setMonthlyIncome} style={styles.input} />

        <Text style={styles.label}>Ngày Sinh</Text>
        <TextInput value={dob} onChangeText={setDob} style={styles.input} />

        {/* Gender Selection */}
        <Text style={styles.label}>Giới Tính</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[styles.genderBox, gender === "Male" && styles.selectedGender]}
            onPress={() => setGender("Male")}
          >
            <Image source={require("@/assets/images/male-icon.jpg")} style={styles.genderIcon} />
            <Text style={styles.genderText}>Male</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.genderBox, gender === "Female" && styles.selectedGender]}
            onPress={() => setGender("Female")}
          >
            <Image source={require("@/assets/images/female-icon.jpg")} style={styles.genderIcon} />
            <Text style={styles.genderText}>Female</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8", paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
  },
  headerText: { fontSize: 18, fontWeight: "bold" },
  saveText: { color: "#1E90FF", fontWeight: "bold" },

  avatarContainer: { alignItems: "center", marginTop: 10 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 10,
    backgroundColor: "white",
    borderRadius: 12,
  },

  infoContainer: { marginTop: 20 },
  label: { fontSize: 16, fontWeight: "bold", marginTop: 10 },
  input: {
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    marginTop: 5,
  },

  genderContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  genderBox: {
    flex: 1,
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    marginHorizontal: 5,
    backgroundColor: "#FFF",
  },
  selectedGender: { borderColor: "#1E90FF", borderWidth: 2 },
  genderIcon: { width: 50, height: 50 },
  genderText: { marginTop: 5, fontSize: 14, fontWeight: "bold" },
});

export default ProfileEditScreen;
