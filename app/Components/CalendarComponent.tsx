import { View } from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { useMemo } from "react";

// Cấu hình tiếng Việt cho lịch
LocaleConfig.locales['vi'] = {
    monthNames: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
    monthNamesShort: ['Th.1', 'Th.2', 'Th.3', 'Th.4', 'Th.5', 'Th.6',
        'Th.7', 'Th.8', 'Th.9', 'Th.10', 'Th.11', 'Th.12'],
    dayNames: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'],
    dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    today: 'Hôm nay'
};
LocaleConfig.defaultLocale = 'vi';

interface CalendarComponentProps {
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    month: number;
    setMonth: (month: number) => void;
    year: number;
    setYear: (year: number) => void;
}

const CalendarComponent = ({ selectedDate, setSelectedDate, month, setMonth, year, setYear }: CalendarComponentProps) => {
    const today = new Date().toISOString().split('T')[0]; // Định dạng YYYY-MM-DD

    // Tối ưu hóa tính toán markedDates
    const markedDates = useMemo(() => ({
        [selectedDate]: { selected: true, selectedColor: "#34d399" }, // Màu xanh lục tươi sáng
        [today]: selectedDate === today
            ? { selected: true, selectedColor: "#ef4444", marked: true, dotColor: "white" } // Hôm nay màu đỏ khi chọn
            : { marked: true, dotColor: "#ef4444" } // Hôm nay chấm đỏ khi không chọn
    }), [selectedDate]);

    return (
        <View className="m-4 rounded-3xl shadow-lg bg-white p-4">
            <Calendar
                current={`${year}-${month.toString().padStart(2, '0')}-01`}
                onDayPress={(day: { dateString: string; day: number; month: number; year: number }) => setSelectedDate(day.dateString)}
                markedDates={markedDates as { [key: string]: { selected?: boolean; selectedColor?: string; marked?: boolean; dotColor?: string } }}
                theme={{
                    selectedDayBackgroundColor: "#34d399", // Xanh lục sáng
                    todayTextColor: "#ef4444", // Chữ màu đỏ
                    arrowColor: "#34d399", // Mũi tên xanh lục
                    todayBackgroundColor: "#fee2e2", // Nền nhạt đỏ cho hôm nay
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: 'bold',
                    textDayFontSize: 16,
                    textMonthFontSize: 18,
                    textDayHeaderFontSize: 14,
                    textSectionTitleColor: "#2d3748", // Section title color
                    dayTextColor: "#4a5568", // Text color for days
                    monthTextColor: "#2d3748", // Month color
                    arrowStyle: { marginTop: 5 },
                    "stylesheet.calendar.header": {
                        week: {
                            marginTop: 10,
                            flexDirection: "row",
                            justifyContent: "space-between",
                        }
                    },
                    "stylesheet.calendar.day": {
                        base: {
                            width: 40,
                            height: 40,
                            borderRadius: 50,
                            alignItems: "center",
                            justifyContent: "center",
                            margin: 3,
                        },
                        selected: {
                            backgroundColor: "#34d399", // Green for selected day
                            borderRadius: 50,
                        },
                        today: {
                            backgroundColor: "#fee2e2", // Light red for today
                        },
                    }
                }}
                onMonthChange={({ month, year }: { month: number; year: number }) => {
                    setMonth(month);
                    setYear(year);
                }}
            />
        </View>
    );
};

export default CalendarComponent;
