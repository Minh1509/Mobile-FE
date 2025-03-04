import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useTailwind } from "tailwind-rn";

const CalendarScreen = () => {
    const tw = useTailwind();
    const expenses = [
        { id: '1', title: 'Di chuyển', amount: '-50.000 VND' },
        { id: '2', title: 'Tiền điện', amount: '-300.000 VND' },
        { id: '3', title: 'Tiền nước', amount: '-100.000 VND' },
        { id: '4', title: 'Thu nhập khác', amount: '1.000.000 VND' },
    ];

    return (
        <View style={tw('flex-1 bg-white')}>
            {/* Calendar Section */}
            <View style={tw('p-4')}>
                <Text style={tw('text-lg font-bold')}>tháng 02 năm 2025</Text>
                <Calendar
                    // The calendar configuration can be enhanced further
                    style={tw('mt-4')}
                    markedDates={{
                        '2025-02-02': { marked: true, dotColor: 'purple' },
                        '2025-02-05': { marked: true, dotColor: 'blue' },
                        '2025-02-08': { marked: true, dotColor: 'red' },
                    }}
                />
            </View>

            {/* Income and Expense Summary */}
            <View style={tw('p-4 bg-gray-200')}>
                <Text style={tw('text-xl font-bold')}>Thu Nhập: 1.000.000 VND</Text>
                <Text style={tw('text-xl font-bold')}>Chi Tiêu: -450.000 VND</Text>
                <Text style={tw('text-xl font-bold')}>Tổng: 550.000 VND</Text>
            </View>

            {/* Expenses List */}
            <View style={tw('px-4')}>
                <FlatList
                    data={expenses}
                    renderItem={({ item }) => (
                        <View style={tw('flex-row justify-between bg-white p-4 mb-2 rounded-lg shadow')}>
                            <Text style={tw('text-lg')}>{item.title}</Text>
                            <Text style={tw('text-lg')}>{item.amount}</Text>
                        </View>
                    )}
                    keyExtractor={item => item.id}
                />
            </View>

            {/* Floating Action Button */}
            <TouchableOpacity style={tw('absolute bottom-8 right-8 bg-green-500 rounded-full p-4')}>
                <Text style={tw('text-white text-lg')}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

export default CalendarScreen;