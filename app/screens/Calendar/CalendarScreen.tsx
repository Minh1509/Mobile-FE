import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import CalendarComponent from "@/app/Components/CalendarComponent";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/app/Types/types";
import { mockTransactions } from "@/app/utils/MockTransactions";
import { normalizeDate } from "@/app/utils/normalizeDate";
import { getCategoryIcon } from "@/app/utils/GetCategoryIcon";
import { mainStyles } from "@/app/styles";

type CalendarScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function CalendarScreen() {
    const navigation = useNavigation<CalendarScreenNavigationProp>();
    const currentDate = new Date();
    const [selectedDate, setSelectedDate] = useState(currentDate.toISOString().split("T")[0]);
    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    const [year, setYear] = useState(currentDate.getFullYear());

    // Lọc giao dịch theo ngày đã chọn
    const filteredTransactions = mockTransactions.filter(t => normalizeDate(t.date) === selectedDate);

    // Tổng hợp danh mục và số tiền
    const categoryTotals = filteredTransactions.reduce((acc, { category, amount }) => {
        const value = parseFloat(amount.replace(/[^\d.-]/g, "").replace(/\./g, "").replace(/,/g, "."));
        acc[category] = (acc[category] || 0) + (isNaN(value) ? 0 : value);
        return acc;
    }, {} as Record<string, number>);

    // Tổng thu nhập và chi tiêu
    const incomeTotal = categoryTotals["Thu nhập"] || 0;
    const expenseTotal = Object.entries(categoryTotals)
        .filter(([category]) => ["Chi tiêu", "Mua sắm", "Ăn uống", "Di chuyển", "Tiền điện", "Tiền nước", "Internet", "Thuê nhà", "Học tập", "Giải trí"].includes(category))
        .reduce((sum, [, amount]) => sum + amount, 0);

    return (
        <ScrollView className="flex-1 bg-gray-100">
            {/* Lịch */}
            <CalendarComponent
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                month={month}
                setMonth={setMonth}
                year={year}
                setYear={setYear}
            />

            <View className="flex-1">
                {/* Tổng thu nhập - chi tiêu */}
                <View className="flex-row justify-between mx-4 mt-2 mb-2">
                    {[
                        { label: "Thu Nhập", icon: "add-circle", color: "green", total: incomeTotal },
                        { label: "Chi Tiêu", icon: "remove-circle", color: "red", total: expenseTotal }
                    ].map(({ label, icon, color, total }) => (
                        <View key={label} className="w-[48%] bg-white p-4 rounded-lg shadow">
                            <View className="flex-row items-center mb-2">
                                <Ionicons name={icon as "add-circle" | "remove-circle"} size={24} color={color === "green" ? "#34C759" : "#FF3B30"} />
                                <Text className={`text-${color}-600 font-bold ml-2 text-base`}>{label}</Text>
                            </View>
                            <Text className={`text-${color}-600 font-bold text-base`} numberOfLines={2}>
                                {total.toLocaleString("vi-VN")} VND
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Danh mục giao dịch */}
                <View className="mt-4 px-4 mb-4">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-lg font-bold">Danh mục</Text>
                        <Text className="text-sm text-gray-500">Ngày đã chọn: {selectedDate}</Text>
                    </View>

                    {Object.entries(categoryTotals).map(([category, total]) => {
                        const { imageSource } = getCategoryIcon(category);
                        const isNegative = total < 0 || ["Chi tiêu", "Mua sắm", "Ăn uống", "Di chuyển", "Tiền điện", "Tiền nước"].includes(category);
                        const count = filteredTransactions.filter(t => t.category === category).length;

                        return (
                            <TouchableOpacity
                                key={category}
                                className="bg-white flex-row items-center p-4 mb-3 rounded-lg shadow"
                                onPress={() => navigation.navigate("CategoryTransactions", {
                                    category,
                                    transactions: filteredTransactions.filter(t => t.category === category),
                                })}
                            >
                                <Image source={imageSource} style={mainStyles.categoryIcon} />
                                <View className="ml-4 flex-1">
                                    <Text className="text-base font-bold">{category}</Text>
                                    <Text className="text-gray-500">{count} giao dịch</Text>
                                </View>
                                <Text className={`text-base font-bold ${isNegative ? "text-red-500" : "text-green-500"}`}>
                                    {total.toLocaleString("vi-VN")} VND
                                </Text>
                                <Ionicons name="chevron-forward" size={20} color="gray" />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

        </ScrollView>
    );
}
