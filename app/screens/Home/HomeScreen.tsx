// File: HomeScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native'; // Thêm Image
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/app/Types/types';
import { transactions } from '@/app/utils/Transactions';
import { ITransaction } from '@/app/interface/Transaction';
import VNDFormat from '@/app/utils/MoneyParse';
import { getCategoryIcon } from '@/app/utils/GetCategoryIcon'; // Import getCategoryIcon mới

// Định nghĩa kiểu cho navigation
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Định nghĩa interface cho danh mục với tổng số tiền
interface CategorySummary {
    category: string;
    totalAmount: number;
    imageSource: any; // Sử dụng imageSource thay vì icon và color
}

// Hàm để lấy tháng và năm từ chuỗi ngày
const getMonthAndYear = (date: string) => {
    const [day, month, year] = date.split('/').map(Number);
    return { month, year };
};

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const [categorySummaries, setCategorySummaries] = useState<CategorySummary[]>([]);
    const [balance, setBalance] = useState({ start: 0, end: 0, difference: 0 });
    const [currentMonthTransactions, setCurrentMonthTransactions] = useState<ITransaction[]>([]);

    useEffect(() => {
        // Lấy tháng và năm hiện tại (24/03/2025)
        const currentDate = new Date('2025-03-24');
        const currentMonth = currentDate.getMonth() + 1; // getMonth() trả về 0-11, nên +1
        const currentYear = currentDate.getFullYear();

        // Lọc các giao dịch trong tháng hiện tại (tháng 3/2025)
        const filteredTransactions = transactions.filter((transaction) => {
            const { month, year } = getMonthAndYear(transaction.date);
            return month === currentMonth && year === currentYear;
        });

        setCurrentMonthTransactions(filteredTransactions);

        // Tính số dư đầu kỳ (giả sử số dư đầu kỳ là tổng thu nhập trước đó, bạn có thể điều chỉnh logic này)
        const startBalance = 30_000_000; // Giả sử số dư đầu kỳ là 30.000.000 VND (có thể tính từ dữ liệu trước đó)

        // Tính tổng thu nhập và chi tiêu trong tháng hiện tại
        const totalIncome = filteredTransactions
            .filter((t) => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = filteredTransactions
            .filter((t) => t.amount < 0)
            .reduce((sum, t) => sum + t.amount, 0);

        // Tính số dư cuối kỳ và chênh lệch
        const endBalance = startBalance + totalIncome + totalExpense;
        const difference = totalIncome + totalExpense;

        setBalance({
            start: startBalance,
            end: endBalance,
            difference: difference,
        });

        // Nhóm giao dịch theo danh mục và tính tổng số tiền
        const categoryMap: { [key: string]: number } = {};
        filteredTransactions.forEach((transaction: ITransaction) => {
            categoryMap[transaction.category] = (categoryMap[transaction.category] || 0) + transaction.amount;
        });

        // Tạo danh sách danh mục với tổng số tiền và imageSource
        const summaries: CategorySummary[] = Object.keys(categoryMap).map((category) => {
            const { imageSource } = getCategoryIcon(category); // Sử dụng getCategoryIcon mới
            return {
                category,
                totalAmount: categoryMap[category],
                imageSource,
            };
        });

        setCategorySummaries(summaries);
    }, []);

    // Hàm xử lý khi nhấn vào danh mục
    const handleCategoryPress = (category: string) => {
        navigation.navigate('CategoryTransactions', {
            category,
            transactions: currentMonthTransactions,
        });
    };

    // Hàm render từng mục trong danh sách danh mục
    const renderCategoryItem = ({ item }: { item: CategorySummary }) => (
        <TouchableOpacity
            style={styles.expenseItemContainer}
            onPress={() => handleCategoryPress(item.category)}
        >
            <View style={styles.iconContainer}>
                <Image source={item.imageSource} style={styles.categoryImage} /> {/* Sử dụng Image thay vì Ionicons */}
            </View>
            <Text style={styles.expenseCategory}>{item.category}</Text>
            <Text
                style={[
                    styles.expenseAmount,
                    { color: item.totalAmount >= 0 ? '#00C4B4' : '#FF6347' },
                ]}
            >
                {VNDFormat(item.totalAmount)}
            </Text>
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
                    <Text style={styles.balanceValue}>{VNDFormat(balance.start)}</Text>
                </View>
                <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>Số dư cuối</Text>
                    <Text style={styles.balanceValue}>{VNDFormat(balance.end)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}></Text>
                    <Text
                        style={[
                            styles.balanceDifference,
                            { color: balance.difference >= 0 ? '#00C4B4' : '#FF6347' },
                        ]}
                    >
                        {VNDFormat(balance.difference)}
                    </Text>
                </View>
            </View>

            {/* Tiêu đề danh sách chi tiêu */}
            <Text style={styles.sectionHeader}>Danh sách chi tiêu hàng tháng</Text>

            {/* Danh sách danh mục */}
            <FlatList
                data={categorySummaries}
                renderItem={renderCategoryItem}
                keyExtractor={(item) => item.category}
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
    categoryImage: {
        width: 24,
        height: 24,
    },
    expenseCategory: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    expenseAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 16,
    },
});

export default HomeScreen;