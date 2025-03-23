import React, { useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onFilterPress: () => void;
}

const SearchBar = ({ searchQuery, setSearchQuery, onFilterPress }: SearchBarProps) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View className="flex-row items-center">
            {/* Ô tìm kiếm */}
            <View className={`flex-1 flex-row items-center rounded-2xl px-4 py-3 border 
                ${isFocused ? "bg-white border-blue-500 shadow-blue-300" : "bg-gray-100 border-gray-300"}`}>
                <Ionicons name="search-outline" size={20} color={isFocused ? "#2563eb" : "#6b7280"} />
                <TextInput
                    className="flex-1 ml-3 text-gray-900 text-base font-medium"
                    placeholder="Tìm kiếm giao dịch..."
                    placeholderTextColor="#9ca3af"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoCapitalize="none"
                    returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")} className="ml-2 bg-gray-300 rounded-full p-1.5">
                        <Ionicons name="close" size={16} color="#374151" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Nút lọc */}
            <TouchableOpacity
                className="p-3 ml-3 rounded-2xl bg-blue-500 shadow-md shadow-blue-400"
                onPress={onFilterPress}
                activeOpacity={0.7}
            >
                <Ionicons name="options-outline" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
};

export default SearchBar;
