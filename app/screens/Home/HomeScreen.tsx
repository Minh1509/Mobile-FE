import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/app/Types/types';
import { useTransactions } from '@/app/hooks/useTransactions';
import { ITransaction, TransactionType } from '@/app/interface/Transaction';
import VNDFormat from '@/app/utils/MoneyParse';
import { getCategoryIcon } from '@/app/utils/GetCategoryIcon';

// Định nghĩa kiểu cho navigation
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface CategorySummary {
    category: string;
    totalAmount: number;
    imageSource: any;
    type: TransactionType;
}

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { transactions, loading } = useTransactions();

    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [categorySummaries, setCategorySummaries] = useState<CategorySummary[]>([]);
    const [balance, setBalance] = useState({ start: 0, end: 0, difference: 0 });

    useEffect(() => {
        if (loading || !transactions.length) return;

        const filteredTransactions = transactions.filter(({ date }) => {
            const [day, month, year] = date.split('/').map(Number);
            return month === currentMonth && year === currentYear;
        });

        const startBalance = 20_000_000;
        const totalIncome = filteredTransactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
        const endBalance = startBalance + totalIncome - totalExpense;

        setBalance({
            start: startBalance,
            end: endBalance,
            difference: totalIncome - totalExpense
        });

        const categoryMap: { [key: string]: { amount: number, type: TransactionType } } = {};
        filteredTransactions.forEach(({ category, amount, type }) => {
            if (!categoryMap[category]) {
                categoryMap[category] = { amount: 0, type };
            }
            if (type === TransactionType.INCOME) {
                categoryMap[category].amount += amount;
            } else {
                categoryMap[category].amount -= amount;
            }
        });

        const summaries: CategorySummary[] = Object.keys(categoryMap).map(category => ({
            category,
            totalAmount: categoryMap[category].amount,
            imageSource: getCategoryIcon(category).imageSource,
            type: categoryMap[category].type
        }));

        setCategorySummaries(summaries);
    }, [transactions, loading, currentMonth, currentYear]);

    const handleMonthChange = (change: number) => {
        let newMonth = currentMonth + change;
        let newYear = currentYear;

        if (newMonth < 1) {
            newMonth = 12;
            newYear -= 1;
        } else if (newMonth > 12) {
            newMonth = 1;
            newYear += 1;
        }

        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    return (
        <View style={styles.container}>
            {/* Tabs điều hướng thời gian */}
            <View style={styles.tabContainer}>
                <TouchableOpacity style={styles.tab} onPress={() => handleMonthChange(-1)}>
                    <Text style={styles.tabText}>Tháng trước</Text>
                </TouchableOpacity>
                <Text style={[styles.tab, styles.activeTab]}>
                    {`Tháng ${currentMonth}/${currentYear}`}
                </Text>
                <TouchableOpacity style={styles.tab} onPress={() => handleMonthChange(1)}>
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
                    <Text style={[styles.balanceDifference, { color: balance.difference >= 0 ? '#00C4B4' : '#FF6347' }]}>
                        {balance.difference >= 0 ? '+' : '-'} {VNDFormat(Math.abs(balance.difference))}
                    </Text>
                </View>
            </View>

            <Text style={styles.sectionHeader}>Danh sách chi tiêu hàng tháng</Text>
            <FlatList
                data={categorySummaries}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.expenseItemContainer}
                        onPress={() => navigation.navigate('CategoryTransactions', {
                            category: item.category,
                            month: currentMonth,
                            year: currentYear
                        })}
                    >

                        <View style={styles.iconContainer}>
                            <Image source={item.imageSource} style={styles.categoryImage} />
                        </View>
                        <Text style={styles.expenseCategory}>{item.category}</Text>
                        <Text style={[styles.expenseAmount, { color: item.type === TransactionType.INCOME ? '#00C4B4' : '#FF6347' }]}>
                            {item.type === TransactionType.INCOME ? '+' : '-'} {VNDFormat(Math.abs(item.totalAmount))}
                        </Text>
                        <Ionicons name="chevron-forward" size={24} color="#000" />
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item.category}
                contentContainerStyle={styles.expenseList}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    tabContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
    tab: { paddingVertical: 8, paddingHorizontal: 16 },
    activeTab: { fontWeight: 'bold', fontSize: 18, color: '#00C4B4' },
    tabText: { fontSize: 16, color: '#666' },
    balanceContainer: { backgroundColor: '#FFF', padding: 16, margin: 16, borderRadius: 8 },
    balanceRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
    balanceLabel: { fontSize: 16, color: '#333' },
    balanceValue: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 8 },
    balanceDifference: { fontSize: 18, fontWeight: 'bold' },
    sectionHeader: { fontSize: 20, fontWeight: 'bold', marginVertical: 16, marginHorizontal: 16, color: '#333' },
    expenseList: { paddingHorizontal: 16 },
    expenseItemContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, marginBottom: 10, borderRadius: 8 },
    iconContainer: { marginRight: 16 },
    categoryImage: { width: 24, height: 24 },
    expenseCategory: { flex: 1, fontSize: 16, color: '#333' },
    expenseAmount: { fontSize: 16, fontWeight: 'bold', marginRight: 16 },
});

export default HomeScreen;
