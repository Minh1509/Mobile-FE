import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, Text, Appearance } from "react-native";
import { Avatar, Switch, Button } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/app/Types/types";
import { StackNavigationProp } from '@react-navigation/stack';

type  ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  // Lấy chế độ tối từ hệ thống
  const [darkMode, setDarkMode] = useState(Appearance.getColorScheme() === "dark");

  // Lắng nghe thay đổi chế độ của hệ thống
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setDarkMode(colorScheme === "dark");
    });

    return () => subscription.remove();
  }, []);

  return (
    <ScrollView
      className="flex-1 p-5"
      style={{ backgroundColor: darkMode ? "#333" : "#fff" }} // Nền dark mode
    >
      {/* Thông tin User */}
      <View className="items-center mb-6">
        <Avatar.Image
          size={100}
          source={{ uri: "https://i.pravatar.cc/150?img=3" }}
        />
        <Text
          className="text-lg font-semibold mt-3"
          style={{ color: darkMode ? "#fff" : "#000" }} // Đổi màu chữ
        >
          Tên Người Dùng
        </Text>
      </View>

      {/* Các mục cài đặt */}
      <TouchableOpacity onPress={() => {}}>
        <SettingItem icon="user" title="Tài khoản" darkMode={darkMode} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => {}}>
        <SettingItem icon="lock" title="Đổi mật khẩu" darkMode={darkMode} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => console.log("Đổi ngôn ngữ")}>
        <SettingItem icon="language" title="Ngôn ngữ" darkMode={darkMode} />
      </TouchableOpacity>

      {/* Chế độ tối */}
      <View className="flex-row items-center py-4 border-b border-gray-300">
        <Icon name="moon-o" size={24} color={darkMode ? "#fff" : "#000"} className="w-8" />
        <Text className="flex-1 text-lg" style={{ color: darkMode ? "#fff" : "#000" }}>
          Chế độ tối
        </Text>
        <Switch value={darkMode} onValueChange={() => setDarkMode(!darkMode)} />
      </View>

      <TouchableOpacity onPress={() => {}}>
        <SettingItem icon="history" title="Lịch sử" darkMode={darkMode} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => {}}>
        <SettingItem icon="info-circle" title="Giới thiệu" darkMode={darkMode} />
      </TouchableOpacity>

      {/* Nút Đăng Xuất */}
      <Button
        mode="contained"
        onPress={() => console.log("Đăng xuất")}
        className="mt-6"
        style={{ backgroundColor: darkMode ? "#d32f2f" : "#ff5252" }} // Đổi màu nút
      >
        Đăng xuất
      </Button>
    </ScrollView>
  );
};

// Component SettingItem (dùng chung)
const SettingItem: React.FC<{ icon: string; title: string; darkMode: boolean }> = ({
  icon,
  title,
  darkMode,
}) => (
  <View className="flex-row items-center py-4 border-b border-gray-300">
    <Icon name={icon} size={24} color={darkMode ? "#fff" : "#000"} className="w-8" />
    <Text className="flex-1 text-lg" style={{ color: darkMode ? "#fff" : "#000" }}>
      {title}
    </Text>
  </View>
);

export default ProfileScreen;
