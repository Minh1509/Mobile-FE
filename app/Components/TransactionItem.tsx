import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { ITransaction } from '@/app/interface/Transaction';

interface TransactionItemProps {
    transaction: ITransaction;
    onPress: (transaction: ITransaction) => void;
}

const TransactionItem = ({ transaction, onPress }: TransactionItemProps) => {
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "Di chuyển": return "car";
            case "Ăn uống": return "restaurant";
            case "Tiền điện": return "flash";
            case "Tiền nước": return "water";
            default: return "cart";
        }
    };

    return (
        <TouchableOpacity
            className='bg-white rounded-lg p-4 mb-4 shadow'
            onPress={() => onPress(transaction)}
        >
            <Text className='text-lg font-bold'>{transaction.date}</Text>
            <Text className='text-red-500 text-xl'>{transaction.amount}</Text>
            <View className='flex-row items-center mt-2'>
                <View className='w-8 h-8 mr-2 bg-gray-200 rounded-full items-center justify-center'>
                    <Ionicons
                        name={getCategoryIcon(transaction.category)}
                        size={16}
                        color="gray"
                    />
                </View>
                <Text className='text-gray-600'>{transaction.description}</Text>
                <View className='ml-auto'>
                    <Text className='text-xs text-gray-500'>{transaction.category}</Text>
                </View>
            </View>
            {/* Indicator that this is clickable */}
            <View className="flex-row justify-end items-center mt-2">
                <Text className="text-xs text-blue-500">Xem chi tiết</Text>
                <Ionicons name="chevron-forward" size={12} color="#3b82f6" />
            </View>
        </TouchableOpacity>
    );
};

export default TransactionItem;