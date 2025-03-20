import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/app/Types/types';
import { ITransaction } from '@/app/interface/Transaction';
import { SafeAreaView } from 'react-native-safe-area-context';

// Header component with original background color, but black text
const Header = ({ onBack, title }: { onBack: () => void, title: string }) => (
    <View className="bg-white-600 p-4 shadow-md">
        <View className="flex-row items-center">
            <TouchableOpacity onPress={onBack} className="mr-4">
                <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-xl font-bold">{title}</Text>
        </View>
    </View>
);

type CategoryTransactionsRouteProp = RouteProp<RootStackParamList, 'CategoryTransactions'>;
type CategoryTransactionsNavigationProp = StackNavigationProp<RootStackParamList, 'CategoryTransactions'>;

const CategoryTransactionsScreen = () => {
    const navigation = useNavigation<CategoryTransactionsNavigationProp>();
    const route = useRoute<CategoryTransactionsRouteProp>();
    const { category, transactions } = route.params;

    // Filter transactions by category
    const categoryTransactions = transactions.filter(t => t.category === category);

    // Category icon mapping
    const getCategoryIcon = (category: string): string => {
        switch (category) {
            case "Di chuyển": return "https://source.unsplash.com/60x60/?car";
            case "Tiền điện": return "https://source.unsplash.com/60x60/?electricity";
            case "Tiền nước": return "https://source.unsplash.com/60x60/?water";
            case "Thu nhập": return "https://source.unsplash.com/60x60/?money";
            default: return "https://source.unsplash.com/60x60/?money";
        }
    };

    // Determine color based on amount
    const getAmountColor = (amount: string): string => {
        return amount.startsWith("-") ? "text-red-500" : "text-green-500";
    };

    // Calculate total for the category
    const calculateTotal = () => {
        let total = 0;
        categoryTransactions.forEach(item => {
            const amountValue = parseFloat(item.amount.replace(/[^\d.-]/g, ''));
            total += amountValue;
        });
        return total.toLocaleString() + " VND";
    };

    // Handle transaction item press
    const handleTransactionPress = (transaction: ITransaction) => {
        navigation.navigate('TransactionDetail', { transaction });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <Header
                onBack={() => navigation.goBack()}
                title={`Danh mục: ${category}`}
            />

            {/* Category Summary */}
            <View className="bg-white mx-4 my-6 p-5 rounded-xl shadow-lg">
                <View className="flex-row items-center mb-4">
                    <Image
                        source={{ uri: getCategoryIcon(category) }}
                        className="w-14 h-14 rounded-full mr-4"
                    />
                    <View>
                        <Text className="text-xl font-bold">{category}</Text>
                        <Text className="text-gray-500">{categoryTransactions.length} giao dịch</Text>
                    </View>
                </View>
                <View className="border-t border-gray-200 pt-3">
                    <Text className="text-lg font-bold">
                        Tổng: <Text className={getAmountColor(calculateTotal())}>{calculateTotal()}</Text>
                    </Text>
                </View>
            </View>

            {/* List of Transactions */}
            <ScrollView className="flex-1 px-4">
                <Text className="text-lg font-bold mb-3">Danh sách giao dịch</Text>

                {categoryTransactions.length > 0 ? (
                    categoryTransactions.map((item) => (
                        <TouchableOpacity
                            key={item.id}
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
                    ))
                ) : (
                    <View className="bg-white p-6 rounded-xl shadow-lg items-center justify-center">
                        <Ionicons name="document-outline" size={48} color="gray" />
                        <Text className="text-gray-500 mt-2">Không có giao dịch nào trong danh mục này</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default CategoryTransactionsScreen;
