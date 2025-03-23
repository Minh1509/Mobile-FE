import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { ITransaction } from '@/app/interface/Transaction';
import { getCategoryIcon } from '../utils/GetCategoryIcon';
import { mainStyles } from '../styles';

interface TransactionItemProps {
    transaction: ITransaction;
    onPress: (transaction: ITransaction) => void;
}

const TransactionItem = ({ transaction, onPress }: TransactionItemProps) => {
    const { imageSource } = useMemo(() => getCategoryIcon(transaction.category), [transaction.category]);
    const handlePress = useCallback(() => onPress(transaction), [transaction, onPress]);

    return (
        <TouchableOpacity
            className='bg-white rounded-xl p-5 mb-4 shadow-lg active:opacity-80'
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View className='flex-row justify-between items-center mb-2'>
                <Text className='text-lg font-semibold text-gray-800'>{transaction.date}</Text>
                <Text className={`${transaction.amount.startsWith('-') ? 'text-red-500' : 'text-green-500'} text-xl font-bold`}>
                    {transaction.amount}
                </Text>
            </View>

            <View className='flex-row items-center space-x-3'>
                <View className='w-12 h-12 bg-gray-200 rounded-full items-center justify-center overflow-hidden'>
                    <Image source={imageSource} style={mainStyles.categoryIcon} resizeMode="cover" />
                </View>

                <View className='flex-1'>
                    <Text className='text-gray-800 font-medium' numberOfLines={1}>{transaction.description}</Text>
                    <Text className='text-xs text-gray-500 mt-1'>{transaction.category}</Text>
                </View>
            </View>

            <View className="flex-row justify-end items-center mt-3">
                <Text className="text-sm text-blue-600 font-medium">Xem chi tiết</Text>
                <Ionicons name="chevron-forward" size={14} color="#2563eb" />
            </View>
        </TouchableOpacity>
    );
};

export default TransactionItem;
