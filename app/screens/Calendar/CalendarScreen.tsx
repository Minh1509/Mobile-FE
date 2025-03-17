import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import CalendarComponent from "@/app/Components/CalendarComponent";

const transactions = [
    { id: 1, title: "Di chuyển", amount: "-50.000 VND", icon: "https://source.unsplash.com/40x40/?car", color: "text-red-500" },
    { id: 2, title: "Tiền điện", amount: "-300.000 VND", icon: "https://source.unsplash.com/40x40/?electricity", color: "text-red-500" },
    { id: 3, title: "Tiền nước", amount: "-100.000 VND", icon: "https://source.unsplash.com/40x40/?water", color: "text-red-500" },
    { id: 4, title: "Thu nhập khác", amount: "1.000.000 VND", icon: "https://source.unsplash.com/40x40/?money", color: "text-green-500" },
];

export default function CalendarScreen() {
    const [selectedDate, setSelectedDate] = useState("");
    const currentDate = new Date();
    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    const [year, setYear] = useState(currentDate.getFullYear());

    return (
        <View className="flex-1 bg-gray-100">
            {/* Calendar Component */}
            <CalendarComponent
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                month={month}
                setMonth={setMonth}
                year={year}
                setYear={setYear}
            />

            {/* Summary */}
            <View className="flex-row justify-between bg-white mx-4 p-4 rounded-lg shadow">
                <Text className="text-blue-500 font-bold">Thu Nhập: 1.000.000 VND</Text>
                <Text className="text-red-500 font-bold">Chi Tiêu: -450.000 VND</Text>
                <Text className="text-green-500 font-bold">Tổng: 550.000 VND</Text>
            </View>

            {/* Transactions */}
            <ScrollView className="mt-4 px-4 mb-4">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-lg font-bold">Tất cả giao dịch</Text>
                    {selectedDate && (
                        <Text className="text-sm text-gray-500">
                            Ngày đã chọn: {selectedDate}
                        </Text>
                    )}
                </View>

                {transactions.map((item) => (
                    <TouchableOpacity key={item.id} className="bg-white flex-row items-center p-4 mb-3 rounded-lg shadow">
                        <Image source={{ uri: item.icon }} className="w-10 h-10 rounded-full" />
                        <View className="ml-4 flex-1">
                            <Text className="text-base font-bold">{item.title}</Text>
                        </View>
                        <Text className={`text-base font-bold ${item.color}`}>{item.amount}</Text>
                        <Ionicons name="chevron-forward" size={20} color="gray" className="ml-2" />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}