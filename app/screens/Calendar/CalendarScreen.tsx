import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useMemo } from "react";
import CalendarComponent from "@/app/Components/CalendarComponent";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/app/Types/types";
import { normalizeDate } from "@/app/utils/normalizeDate";
import { getCategoryIcon } from "@/app/utils/GetCategoryIcon";
import { mainStyles } from "@/app/styles";
import { ITransaction, TransactionType } from "@/app/interface/Transaction";
import { useTransactions } from "@/app/hooks/useTransactions";

type CalendarScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function CalendarScreen() {
    const navigation = useNavigation<CalendarScreenNavigationProp>();
    const currentDate = new Date();
    const [selectedDate, setSelectedDate] = useState(currentDate.toISOString().split("T")[0]);
    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    const [year, setYear] = useState(currentDate.getFullYear());

    const { transactions, loading } = useTransactions();

    const { categoryData, incomeTotal, expenseTotal } = useMemo(() => {
        if (loading || !transactions.length) return { categoryData: {}, incomeTotal: 0, expenseTotal: 0 };

        let income = 0, expense = 0;
        const data: Record<string, { amount: number, type: TransactionType }> = {};

        transactions.forEach(({ date, category, amount, type }) => {
            if (normalizeDate(date) !== selectedDate) return;

            if (!data[category]) {
                data[category] = { amount: 0, type };
            }

            if (type === TransactionType.EXPENSE) {
                data[category].amount -= amount;
                expense += amount;
            } else {
                data[category].amount += amount;
                income += amount;
            }
        });

        return { categoryData: data, incomeTotal: income, expenseTotal: expense };
    }, [transactions, loading, selectedDate]);

    return (
        <ScrollView className="flex-1 bg-gray-100">
            <CalendarComponent
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                month={month}
                setMonth={setMonth}
                year={year}
                setYear={setYear}
            />

            <View className="flex-1">
                <View className="flex-row justify-between mx-4 mt-2 mb-2">
                    {[{ label: "Thu Nhập", icon: "add-circle", color: "green", total: incomeTotal },
                    { label: "Chi Tiêu", icon: "remove-circle", color: "red", total: expenseTotal }].map(({ label, icon, color, total }) => (
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

                <View className="mt-4 px-4 mb-4">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-lg font-bold">Danh mục</Text>
                        <Text className="text-sm text-gray-500">Ngày đã chọn: {selectedDate}</Text>
                    </View>

                    {Object.entries(categoryData).map(([category, { amount, type }]) => {
                        const { imageSource } = getCategoryIcon(category);
                        const isExpense = type === TransactionType.EXPENSE;

                        return (
                            <TouchableOpacity
                                key={category}
                                className="bg-white flex-row items-center p-4 mb-3 rounded-lg shadow"
                                onPress={() => navigation.navigate("CategoryTransactions", {
                                    category,
                                    month,
                                    year
                                })}
                            >
                                <Image source={imageSource} style={mainStyles.categoryIcon} />
                                <View className="ml-4 flex-1">
                                    <Text className="text-base font-bold">{category}</Text>
                                    <Text className="text-gray-500">
                                        {transactions.filter(t => normalizeDate(t.date) === selectedDate && t.category === category).length} giao dịch
                                    </Text>
                                </View>
                                <Text className={`text-base font-bold ${isExpense ? "text-red-500" : "text-green-500"}`}>
                                    {isExpense ? "- " : "+ "}
                                    {Math.abs(amount).toLocaleString("vi-VN")} VND
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
