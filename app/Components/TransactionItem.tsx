import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { ITransaction } from '@/app/interface/Transaction';
import { getCategoryIcon } from '../utils/GetCategoryIcon';
import VNDFormat from '../utils/MoneyParse';

interface TransactionItemProps {
    transaction: ITransaction;
    onPress: (transaction: ITransaction) => void;
}

const TransactionItem = ({ transaction, onPress }: TransactionItemProps) => {
    const { imageSource } = useMemo(() => getCategoryIcon(transaction.category), [transaction.category]);
    const handlePress = useCallback(() => onPress(transaction), [transaction, onPress]);
    const parseAmount = VNDFormat(transaction.amount)

    return (
        <TouchableOpacity
            className="bg-white rounded-xl p-3 mt-2 mb-4 shadow-md active:opacity-80"
            onPress={handlePress}
            activeOpacity={0.7}
        >
            {/* Ngày & Số tiền */}
            <View className="flex-row justify-between items-center mb-3">
                <Text className="text-base font-medium text-gray-600">{transaction.date}</Text>
                <Text className={`${transaction.amount < 0 ? 'text-red-500' : 'text-green-500'} text-lg font-bold`}>
                    {parseAmount}
                </Text>
            </View>

            {/* Icon & Danh mục */}
            <View className="flex-row items-center space-x-4 py-2">
                <View className="w-12 h-12 mr-5 bg-gray-100 rounded-full items-center justify-center overflow-hidden shadow-md">
                    <Image source={imageSource} className="w-full h-full" resizeMode="cover" />
                </View>

                <Text className="text-lg font-semibold text-gray-800 flex-1">{transaction.category}</Text>
                <View className="flex-row justify-end items-center">
                    <Text className="text-sm text-blue-600 font-medium">Xem chi tiết</Text>
                    <Ionicons name="chevron-forward" size={16} color="#2563eb" />
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default TransactionItem;