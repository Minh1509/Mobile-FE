import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";

interface CalendarComponentProps {
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    month: number;
    setMonth: (month: number) => void;
    year: number;
    setYear: (year: number) => void;
}

const CalendarComponent = ({
    selectedDate,
    setSelectedDate,
    month,
    setMonth,
    year,
    setYear
}: CalendarComponentProps) => {
    const currentDate = new Date();
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
        <View>
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
                    onDayPress={(day: { dateString: string; }) => setSelectedDate(day.dateString)}
                    markedDates={markedDates}
                    theme={{
                        selectedDayBackgroundColor: "green",
                        todayTextColor: "red",
                        arrowColor: "green",
                        todayBackgroundColor: "#ffeeee", // Light red background for today
                    }}
                    onMonthChange={(monthData: { month: number; year: number; }) => {
                        setMonth(monthData.month);
                        setYear(monthData.year);
                    }}
                />
            </View>
        </View>
    );
};

export default CalendarComponent;