import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';

const transactions = [
  { id: 1, date: "2 Tháng 12 Năm 2022", amount: "-50.000 VND", description: "Di chuyển" },
  { id: 2, date: "19 Tháng 11 Năm 2022", amount: "-65.000 VND", description: "Di chuyển" },
  { id: 3, date: "19 Tháng 11 Năm 2022", amount: "-15.000 VND", description: "Di chuyển" },
  { id: 4, date: "11 Tháng 11 Năm 2022", amount: "-10.000 VND", description: "Di chuyển" },
  { id: 5, date: "12 Tháng 10 Năm 2022", amount: "-100.000 VND", description: "Di chuyển" },
];

const SearchScreen = () => {
  return (
    <View className='flex-1 bg-gray-100 p-4'>
      <ScrollView>
        {transactions.map(transaction => (
          <View key={transaction.id} className='bg-white rounded-lg p-4 mb-4 shadow'>
            <Text className='text-lg font-bold'>{transaction.date}</Text>
            <Text className='text-red-500 text-xl'>{transaction.amount}</Text>
            <View className='flex-row items-center mt-2'>
              <Image
                // source={require('./path-to-your-image.png')}
                className='w-8 h-8 mr-2'
              />
              <Text className='text-gray-600'>{transaction.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default SearchScreen;