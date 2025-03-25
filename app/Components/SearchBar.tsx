import React, { useState, useCallback, useMemo } from "react";
import { View, TextInput, TouchableOpacity, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onFilterPress: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery, onFilterPress }) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleChangeText = useCallback((text: string) => setSearchQuery(text), [setSearchQuery]);
    const handleClearSearch = useCallback(() => setSearchQuery(""), [setSearchQuery]);

    const inputStyle = useMemo(
        () => `flex-1 flex-row items-center rounded-full px-3 py-2 border shadow-sm ${isFocused ? "bg-white border-blue-600" : "bg-gray-200 border-gray-400"}`,
        [isFocused]
    );


    return (
        <View className="flex-row items-center">
            <Pressable className={inputStyle} onPress={() => setIsFocused(true)}>
                <Ionicons name="search-outline" size={24} color={isFocused ? "#2563eb" : "#6b7280"} />

                <TextInput
                    className="flex-1 ml-2 text-gray-900 text-base"
                    placeholder="Tìm kiếm..."
                    placeholderTextColor="#9ca3af"
                    value={searchQuery}
                    onChangeText={handleChangeText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoCapitalize="none"
                    returnKeyType="search"
                />

                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={handleClearSearch} className="ml-2 p-1">
                        <Ionicons name="close" size={16} color="#374151" />
                    </TouchableOpacity>
                )}
            </Pressable>

            <TouchableOpacity className="p-3 ml-3 rounded-lg bg-gray-200" onPress={onFilterPress} activeOpacity={0.7}>
                <Image source={require("@/assets/icons/filter.png")}
                    style={{ width: 25, height: 25 }} />
            </TouchableOpacity>
        </View>
    );
};

export default SearchBar;
