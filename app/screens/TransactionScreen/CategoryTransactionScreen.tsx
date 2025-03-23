import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '@/app/Types/types';
import { ITransaction } from '@/app/interface/Transaction';
import { getCategoryIcon } from '@/app/utils/GetCategoryIcon';
import { Header } from '@/app/Components/Header';
import { getAmountColor } from '@/app/utils/GetAmountColor';
import { mainStyles } from '@/app/styles';

const CategoryTransactionsScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute();
    const { category, transactions } = route.params as RootStackParamList['CategoryTransactions'];
    const { imageSource } = getCategoryIcon(category);

    // Memoized list of transactions in the category
    const categoryTransactions = useMemo(
        () => transactions.filter(t => t.category === category),
        [transactions, category]
    );

    // Memoized total amount calculation
    const totalAmount = useMemo(() => {
        const total = categoryTransactions.reduce((sum, item) => {
            const amountValue = parseFloat(item.amount.replace(/[^\d-]/g, '')) || 0;
            return sum + amountValue;
        }, 0);
        return `${total.toLocaleString('vi-VN')} VND`;
    }, [categoryTransactions]);

    // Handle transaction item press
    const handleTransactionPress = (transaction: ITransaction) => {
        navigation.navigate('TransactionDetail', { transaction });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <Header onBack={() => navigation.goBack()} title={`Danh mục: ${category}`} />

            {/* Category Summary */}
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
                        Tổng: <Text className={getAmountColor(totalAmount)}>{totalAmount}</Text>
                    </Text>
                </View>
            </View>

            {/* List of Transactions */}
            <FlatList
                data={categoryTransactions}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
                ListHeaderComponent={<Text className="text-lg font-bold mb-3">Danh sách giao dịch</Text>}
                ListEmptyComponent={
                    <View className="bg-white p-6 rounded-xl shadow-lg items-center justify-center">
                        <Ionicons name="document-outline" size={48} color="gray" />
                        <Text className="text-gray-500 mt-2">Không có giao dịch nào trong danh mục này</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className="bg-white flex-row items-center p-4 mb-3 rounded-xl shadow-md"
                        onPress={() => handleTransactionPress(item)}
                    >
                        <View className="flex-1">
                            <Text className="text-base font-bold">{item.description}</Text>
                            <Text className="text-gray-500">{item.date}</Text>
                        </View>
                        <Text className={`text-base font-bold ${getAmountColor(item.amount)}`}>
                            {item.amount}
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color="gray" className="ml-2" />
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
};

export default CategoryTransactionsScreen;
