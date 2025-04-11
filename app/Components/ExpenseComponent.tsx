import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

type ExpenseComponentProps = {
  icon: string;
  text: string;
  onPress: () => void;
  style?: object;
};

const ExpenseComponent: React.FC<ExpenseComponentProps> = ({ icon, text, onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons name={icon} size={26} color="#FF6347" style={styles.icon} />
      <Text style={styles.text}>{text}</Text>
      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color="#999"
        style={styles.arrow}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff", // Màu nền trắng đơn giản
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0", // Viền nhẹ
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginRight: 12,
  },
  text: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  arrow: {
    marginLeft: 8,
  },
});

export default ExpenseComponent;