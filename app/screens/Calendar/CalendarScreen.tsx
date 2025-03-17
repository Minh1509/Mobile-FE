import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { SetStateAction, useState } from "react";

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

    // Format today's date for marking
    const today = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Prepare markedDates object with both selected date and today
    const markedDates = {
        [selectedDate]: { selected: true, selectedColor: "green" },
        [today]: {
            selected: true,
            selectedColor: "red",
            marked: true,
            dotColor: "white"
        }
    };

    // If selected date is today, merge the styles
    if (selectedDate === today) {
        markedDates[today] = {
            ...markedDates[today],
            selected: true,
            selectedColor: "red"
        };
    }

    return (
        <View className="flex-1 bg-gray-100">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 bg-green-300">
                <TouchableOpacity onPress={() => setMonth(month === 1 ? 12 : month - 1)}>
                    {/* <Ionicons name="chevron-back" size={24} color="black" /> */}
                </TouchableOpacity>
                <Text className="text-lg font-bold">{`Tháng ${month} năm ${year}`}</Text>
                <TouchableOpacity onPress={() => setMonth(month === 12 ? 1 : month + 1)}>
                    {/* <Ionicons name="chevron-forward" size={24} color="black" /> */}
                </TouchableOpacity>
            </View>

            {/* Calendar */}
            <View className="m-4 rounded-lg shadow bg-white p-4">
                <Calendar
                    current={`${year}-${month < 10 ? `0${month}` : month}-01`}
                    onDayPress={(day: { dateString: SetStateAction<string>; }) => setSelectedDate(day.dateString)}
                    markedDates={markedDates}
                    theme={{
                        selectedDayBackgroundColor: "green",
                        todayTextColor: "red",
                        arrowColor: "green",
                        todayBackgroundColor: "#ffeeee", // Light red background for today
                    }}
                    onMonthChange={(monthData: { month: SetStateAction<number>; year: SetStateAction<number>; }) => {
                        setMonth(monthData.month);
                        setYear(monthData.year);
                    }}
                />
            </View>

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