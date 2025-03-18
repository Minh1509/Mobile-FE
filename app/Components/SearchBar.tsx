import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

interface SearchBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onFilterPress: () => void;
}

const SearchBar = ({ searchQuery, setSearchQuery, onFilterPress }: SearchBarProps) => {
    return (
        <View className='flex-row items-center mb-4'>
            <View className='flex-1 flex-row items-center bg-white rounded-lg p-2 mr-2'>
                <Ionicons name="search" size={20} color="gray" />
                <TextInput
                    className='flex-1 ml-2'
                    placeholder='Tìm kiếm giao dịch...'
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            <TouchableOpacity
                className='bg-green-500 p-2 rounded-lg'
                onPress={() => {/* Handle search */ }}
            >
                <Text className='text-white font-bold'>Tìm</Text>
            </TouchableOpacity>
            <TouchableOpacity
                className='ml-2 bg-blue-500 p-2 rounded-lg'
                onPress={onFilterPress}
            >
                <Ionicons name="filter" size={20} color="white" />
            </TouchableOpacity>
        </View>
    );
};

export default SearchBar;