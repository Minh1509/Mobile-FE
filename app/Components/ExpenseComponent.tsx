import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

type ExpenseComponentProps = {
  icon: string;
  text: string;
  onPress: () => void;
};

const ExpenseComponent: React.FC<ExpenseComponentProps> = ({ icon, text, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <MaterialCommunityIcons name={icon} size={24} color="#007bff" style={styles.icon} />
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // Hiệu ứng đổ bóng trên Android
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontSize: 16,
    color: "#333",
  },
});

export default ExpenseComponent;
