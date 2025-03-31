import React, { useMemo } from 'react';
import { View, Text, FlatList, Image } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '@/app/Types/types';
import { ITransaction, TransactionType } from '@/app/interface/Transaction';
import { useTransactions } from '@/app/hooks/useTransactions';
import { getCategoryIcon } from '@/app/utils/GetCategoryIcon';
import { Header } from '@/app/Components/Header';
import { mainStyles } from '@/app/styles';
import TransactionItem from '@/app/Components/TransactionItem';

const CategoryTransactionsScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute();
    const { category, month, year } = route.params as { category: string; month: number; year: number };

    // Lấy toàn bộ giao dịch từ hook
    const { transactions, loading } = useTransactions();

    // Lọc các giao dịch thuộc danh mục và tháng/năm đã chọn
    const categoryTransactions = useMemo(() => {
        if (!transactions || loading) return [];
        return transactions.filter(({ date, category: tCategory }) => {
            const [day, tMonth, tYear] = date.split('/').map(Number);
            return tCategory === category && tMonth === month && tYear === year;
        });
    }, [transactions, loading, category, month, year]);

    const { imageSource } = getCategoryIcon(category);

    // Tính tổng thu/chi
    const { total } = useMemo(() => {
        let incomeTotal = 0;
        let expenseTotal = 0;

        categoryTransactions.forEach(item => {
            if (item.type === TransactionType.INCOME) {
                incomeTotal += item.amount;
            } else {
                expenseTotal += item.amount;
            }
        });

        return { total: incomeTotal - expenseTotal };
    }, [categoryTransactions]);

    const formattedAmount = useMemo(() => {
        const sign = total >= 0 ? "+" : "-";
        const formattedValue = Math.abs(total).toLocaleString('vi-VN');
        return `${sign} ${formattedValue} VND`;
    }, [total]);

    const handleTransactionPress = (transaction: ITransaction) => {
        navigation.navigate('TransactionDetail', { transaction });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <Header onBack={() => navigation.goBack()} title={`Danh mục: ${category}`} />

            <View className="bg-white mx-4 my-6 p-5 rounded-xl shadow-lg">
                <View className="flex-row items-center mb-4">
                    <Image source={imageSource} style={mainStyles.categoryIcon} />
                    <View>
                        <Text className="text-xl font-bold">{category}</Text>
                        <Text className="text-gray-500">{categoryTransactions.length} giao dịch</Text>
                    </View>
                </View>
                <View className="border-t border-gray-200 pt-3">
                    <Text className="text-lg font-bold">
                        Tổng: <Text className="text-blue-500">{formattedAmount}</Text>
                    </Text>
                </View>
            </View>

            <FlatList
                data={categoryTransactions}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
                ListHeaderComponent={<Text className="text-lg font-bold mb-3">Danh sách giao dịch</Text>}
                renderItem={({ item }) => (
                    <TransactionItem
                        transaction={item}
                        onPress={handleTransactionPress}
                        showSign={true} // Hiển thị dấu + hoặc - theo loại giao dịch
                    />
                )}
            />
        </SafeAreaView>
    );
};

export default CategoryTransactionsScreen;
