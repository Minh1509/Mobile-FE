import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

const EmptyResults = () => {
    return (
        <View className='bg-white rounded-lg p-8 items-center justify-center'>
            <Ionicons name="search-outline" size={48} color="gray" />
            <Text className='text-gray-500 text-center mt-4'>Không tìm thấy giao dịch nào</Text>
        </View>
    );
};

export default EmptyResults;