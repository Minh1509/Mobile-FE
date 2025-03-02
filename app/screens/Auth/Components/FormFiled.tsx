import {
  View,
  Text,
  ViewStyle,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { StyleProp } from "react-native";
import { Ionicons } from "@expo/vector-icons";
interface FormFiledProps {
  title: string;
  value: string;
  placeholder: string;
  handleChangeText: (text: string) => void;
  otherStyles?: StyleProp<ViewStyle>;
}
const FormFiled: React.FC<FormFiledProps> = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
}) => {
  const [showPassword, setShowPassword] = useState<Boolean>(false);
  return (
    <View className="space-y-2 m-2">
      <Text className="text-base  font-medium py-2">{title}</Text>
      <View className="border-2 w-full flex-row h-16 rounded-lg px-4 border-[#FAF7F0] items-center justify-center bg-[#FAF7F0]">
        <TextInput
          className="flex-1 w-full text-[#543310]"
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor="#7b7b8b"
          secureTextEntry={title ==="Password" && !showPassword}
        ></TextInput>
        <TouchableOpacity onPress={()=>setShowPassword(!showPassword)}>
          {title == "Password" && (
            <Ionicons
              name={showPassword ? "eye" : "eye-off-outline"}
              color="#543310"
              size={32}
            ></Ionicons>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FormFiled;
