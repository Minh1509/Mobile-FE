// File: HomeScreen.js

import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Định nghĩa kiểu cho icon từ Ionicons
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// Định nghĩa interface cho các mục chi tiêu
interface ExpenseItem {
    id: string;
    category: string;
    amount: string;
    icon: IoniconsName;
}

// Dữ liệu giả lập cho danh sách chi tiêu
const expenses: ExpenseItem[] = [
    { id: '1', category: 'Ăn uống', amount: '-200.000 VND', icon: 'fast-food' },
    { id: '2', category: 'Ăn uống', amount: '-200.000 VND', icon: 'fast-food' },
    { id: '3', category: 'Ăn uống', amount: '-200.000 VND', icon: 'fast-food' },
    { id: '4', category: 'Ăn uống', amount: '-200.000 VND', icon: 'fast-food' },
];

const HomeScreen = () => {
    // Hàm render từng mục trong danh sách chi tiêu
    const renderExpenseItem = ({ item }: { item: ExpenseItem }) => (
        <TouchableOpacity style={styles.expenseItemContainer}>
            <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={24} color="#FF6347" />
            </View>
            <Text style={styles.expenseCategory}>{item.category}</Text>
            <Text style={styles.expenseAmount}>{item.amount}</Text>
            <Ionicons name="chevron-forward" size={24} color="#000" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Tabs điều hướng thời gian */}
            <View style={styles.tabContainer}>
                <TouchableOpacity style={styles.tab}>
                    <Text style={styles.tabText}>Tháng trước</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                    <Text style={[styles.tabText, styles.activeTabText]}>Tháng này</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab}>
                    <Text style={styles.tabText}>Tháng sau</Text>
                </TouchableOpacity>
            </View>

            {/* Thông tin số dư */}
            <View style={styles.balanceContainer}>
                <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>Số dư đầu</Text>
                    <Text style={styles.balanceValue}>30.000.000 VND</Text>
                </View>
                <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>Số dư cuối</Text>
                    <Text style={styles.balanceValue}>28.848.000 VND</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}></Text>
                    <Text style={styles.balanceDifference}>-1.152.000 VND</Text>
                </View>
            </View>

            {/* Tiêu đề danh sách chi tiêu */}
            <Text style={styles.sectionHeader}>Danh sách chi tiêu hàng tháng</Text>

            {/* Danh sách chi tiêu */}
            <FlatList
                data={expenses}
                renderItem={renderExpenseItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.expenseList}
            />
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#00C4B4',
    },
    tabText: {
        fontSize: 16,
        color: '#666',
    },
    activeTabText: {
        color: '#00C4B4',
        fontWeight: 'bold',
    },
    balanceContainer: {
        backgroundColor: '#FFF',
        padding: 16,
        margin: 16,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8,
    },
    balanceLabel: {
        fontSize: 16,
        color: '#333',
    },
    balanceValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 8,
    },
    balanceDifference: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6347',
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 16,
        marginHorizontal: 16,
        color: '#333',
    },
    expenseList: {
        paddingHorizontal: 16,
    },
    expenseItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        marginBottom: 10,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    iconContainer: {
        marginRight: 16,
    },
    expenseCategory: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    expenseAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF6347',
        marginRight: 16,
    },
});

export default HomeScreen;