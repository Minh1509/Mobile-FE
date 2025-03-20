import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import CalendarComponent from "@/app/Components/CalendarComponent";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/app/Types/types";
import { transactions } from "@/app/utils/MockTransactions"; // Import dữ liệu mock
import { normalizeDate } from "@/app/utils/normalizeDate";

type CalendarScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function CalendarScreen() {
    const navigation = useNavigation<CalendarScreenNavigationProp>();
    const currentDate = new Date();
    const [selectedDate, setSelectedDate] = useState(
        currentDate.toISOString().split("T")[0]
    );
    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    const [year, setYear] = useState(currentDate.getFullYear());

    // Lọc giao dịch theo ngày đã chọn
    const filteredTransactions = transactions.filter(
        (t) => normalizeDate(t.date) === selectedDate
    );

    // Lấy danh sách danh mục từ giao dịch đã lọc
    const getUniqueCategories = () => {
        const categories = filteredTransactions.map((t) => t.category);
        return [...new Set(categories)];
    };

    // Lấy icon danh mục với màu sắc
    const getCategoryIcon = (category: string): { name: keyof typeof Ionicons.glyphMap; color: string } => {
        switch (category) {
            case "Di chuyển":
                return { name: "car" as keyof typeof Ionicons.glyphMap, color: "#007AFF" }; // Xanh dương
            case "Tiền điện":
                return { name: "flash" as keyof typeof Ionicons.glyphMap, color: "#FF9500" }; // Cam
            case "Tiền nước":
                return { name: "water" as keyof typeof Ionicons.glyphMap, color: "#34C759" }; // Xanh lá
            case "Thu nhập":
                return { name: "wallet" as keyof typeof Ionicons.glyphMap, color: "#4CD964" }; // Xanh nhạt
            default:
                return { name: "cash" as keyof typeof Ionicons.glyphMap, color: "#5856D6" }; // Tím
        }
    };

    // Màu chữ theo giá trị tiền (thu nhập: xanh, chi tiêu: đỏ)
    const getAmountColor = (amount: string): string => {
        return amount.startsWith("-") ? "text-red-500" : "text-green-500";
    };

    // Xử lý khi nhấn vào danh mục
    const handleCategoryPress = (category: string) => {
        const categoryTransactions = filteredTransactions.filter(
            (t) => t.category === category
        );
        navigation.navigate("CategoryTransactions", {
            category,
            transactions: categoryTransactions,
        });
    };

    // Tính tổng tiền của danh mục
    const getCategoryTotal = (category: string) => {
        const categoryItems = filteredTransactions.filter((t) => t.category === category);
        let total = categoryItems.reduce((sum, item) => {
            // Lấy phần số trước "VND" nếu có
            let amountStr = item.amount.split(" ")[0].trim();
            // Loại bỏ các ký tự không phải số, dấu "." hoặc "-"
            amountStr = amountStr.replace(/[^0-9.-]/g, "");
            // Chuyển đổi thành số thực
            const amountValue = parseFloat(amountStr);
            return sum + (isNaN(amountValue) ? 0 : amountValue);
        }, 0);

        return total.toLocaleString("vi-VN") + " VND"; // Hiển thị đúng chuẩn Việt Nam
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            {/* Calendar Component */}
            <CalendarComponent
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                month={month}
                setMonth={setMonth}
                year={year}
                setYear={setYear}
            />

            {/* Tổng kết thu nhập - chi tiêu */}
            <View className="flex-row justify-between bg-white mx-4 p-4 rounded-lg shadow items-center">
                <View className="flex-row items-center">
                    <Ionicons name="add-circle" size={24} color="#34C759" />
                    <Text className="text-green-600 font-bold ml-2">
                        Thu Nhập: {getCategoryTotal("Thu nhập")}
                    </Text>
                </View>
                <View className="flex-row items-center">
                    <Ionicons name="remove-circle" size={24} color="#FF3B30" />
                    <Text className="text-red-600 font-bold ml-2">
                        Chi Tiêu: {getCategoryTotal("Chi tiêu")}
                    </Text>
                </View>
            </View>

            {/* Danh mục giao dịch */}
            <ScrollView className="mt-4 px-4 mb-4">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-lg font-bold">Danh mục</Text>
                    {selectedDate && (
                        <Text className="text-sm text-gray-500">
                            Ngày đã chọn: {selectedDate}
                        </Text>
                    )}
                </View>

                {getUniqueCategories().map((category) => {
                    const count = filteredTransactions.filter(
                        (t) => t.category === category
                    ).length;
                    const { name, color } = getCategoryIcon(category);

                    return (
                        <TouchableOpacity
                            key={category}
                            className="bg-white flex-row items-center p-4 mb-3 rounded-lg shadow"
                            onPress={() => handleCategoryPress(category)}
                        >
                            {/* Icon danh mục */}
                            <View className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                <Ionicons name={name} size={24} color={color} />
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="text-base font-bold">{category}</Text>
                                <Text className="text-gray-500">{count} giao dịch</Text>
                            </View>
                            <Text
                                className={`text-base font-bold ${getAmountColor(
                                    getCategoryTotal(category)
                                )}`}
                            >
                                {getCategoryTotal(category)}
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="gray"
                                className="ml-2"
                            />
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
}
