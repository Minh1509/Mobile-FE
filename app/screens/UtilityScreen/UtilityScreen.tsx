// File: UtilityScreen.js

import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/app/Types/types";
import { readBankSMS } from "@/app/utils/smsHandler";
import { saveBankSmsToFirestore } from "@/app/services/bank.service";
import { useUserAuth } from "@/app/hooks/userAuth";

// Định nghĩa kiểu cho icon từ Ionicons
type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

// Định nghĩa kiểu cho navigation
type UtilityScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Utility"
>;

// Định nghĩa interface cho UtilityItem, sử dụng IoniconsName cho icon
interface UtilityItem {
  id: string;
  title: string;
  icon: IoniconsName;
}

// Dữ liệu giả lập cho danh sách tiện ích
const utilities: UtilityItem[] = [
  {
    id: "IncomeAndExpenditureChart",
    title: "Biểu đồ thu chi",
    icon: "pie-chart",
  },
  {
    id: "CategoryAnalysisChart",
    title: "Biểu đồ phân tích theo danh mục",
    icon: "git-network",
  },
  { id: "TrendChart", title: "Biểu đồ xu hướng", icon: "bar-chart" },
  {
    id: "IncomeAndExpenditureComparisonChart",
    title: "Biểu đồ so sánh thu chi",
    icon: "stats-chart",
  },
  { id: "AddExpense", title: "Thêm chi tiêu", icon: "cash-outline" },
  { id: "AddIncome", title: "Thêm thu nhập", icon: "wallet-outline" },
  { id: "AddBudget", title: "Thiết lập ngân sách", icon: "calculator-outline" },
  {
    id: "ImportFromSMS",
    title: "Nhập dữ liệu từ SMS",
    icon: "mail-open-outline",
  },
];

const UtilityScreen = () => {
  const { userId } = useUserAuth();
  const navigation = useNavigation<UtilityScreenNavigationProp>(); // Khởi tạo navigation

  // Hàm xử lý khi nhấn vào một mục
  const handleItemPress = async (id: string) => {
    if (id === "IncomeAndExpenditureChart") {
      navigation.navigate("IncomeAndExpenditureChart");
    } else if (id === "CategoryAnalysisChart") {
      navigation.navigate("CategoryAnalysisChart");
    } else if (id === "TrendChart") {
      navigation.navigate("TrendChart");
    } else if (id === "IncomeAndExpenditureComparisonChart") {
      navigation.navigate("IncomeAndExpenditureComparisonChart");
    } else if (id === "AddExpense") {
      navigation.navigate("AddExpense");
    } else if (id === "AddIncome") {
      navigation.navigate("AddIncome");
    } else if (id === "AddBudget") {
      navigation.navigate("AddBudget");
    } else if (id === "ImportFromSMS") {
      console.log("⏳ Đang đọc SMS...");
      try {
        const smsData = await readBankSMS();

        console.log(smsData);
        if (smsData.length === 0) {
          Alert.alert(
            "Không có dữ liệu",
            "Không tìm thấy tin nhắn giao dịch phù hợp."
          );
        } else {
          for (const sms of smsData) {
            if (userId) {
              await saveBankSmsToFirestore(userId, sms);
            } else {
              console.error("User ID is null. Cannot save SMS to Firestore.");
            }
          }
          Alert.alert(
            "Nhập liệu thành công",
            `Đã đọc dữ liệu giao dịch từ SMS.`
          );
        }

        console.log("✅ Dữ liệu SMS đã đọc được:", smsData);
      } catch (err) {
        console.log("❌ Lỗi khi nhập dữ liệu từ SMS:", err);
      }
    } else {
      console.log("Chức năng đang được phát triển");
    }
  };

  // Hàm render từng mục trong danh sách
  const renderItem = ({ item }: { item: UtilityItem }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleItemPress(item.id)}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon} size={24} color="#FF6347" />
      </View>
      <Text style={styles.itemText}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={24} color="#000" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Tiêu đề */}
      <Text style={styles.header}>Tiện ích</Text>

      {/* Danh sách tiện ích */}
      <FlatList
        data={utilities}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCFCFC",
    paddingTop: 8,
  },
  header: {
    fontSize: 22,
    fontWeight: "600",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 10,
    color: "#1A1A1A",
    borderBottomWidth: 1,
    borderColor: "#EEE",
    paddingBottom: 6,
  },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F2F2F2",
  },
  iconContainer: {
    backgroundColor: "#FFF4F0",
    padding: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: "#444",
    fontWeight: "500",
  },
});

export default UtilityScreen;
