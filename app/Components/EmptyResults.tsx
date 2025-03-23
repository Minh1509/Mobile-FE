import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

interface EmptyResultsProps {
    searchQuery?: string;
    onClearSearch?: () => void;
}

const EmptyResults = ({ searchQuery = "", onClearSearch }: EmptyResultsProps) => {
    const hasSearchQuery = useMemo(() => searchQuery.trim().length > 0, [searchQuery]);

    return (
        <View className="flex-1 items-center justify-center py-10">
            <View className="bg-white rounded-xl p-8 items-center shadow-sm w-full max-w-md">
                {/* Icon Section */}
                <View className="bg-gray-100 rounded-full p-4 mb-4">
                    <Ionicons name={hasSearchQuery ? "search" : "document-text-outline"} size={40} color="#6b7280" />
                </View>

                {/* Title */}
                <Text className="text-lg font-bold text-gray-800 text-center mb-2">
                    {hasSearchQuery ? 'Không tìm thấy kết quả' : 'Chưa có giao dịch nào'}
                </Text>

                {/* Subtitle */}
                <Text className="text-gray-500 text-center mb-4">
                    {hasSearchQuery
                        ? `Không tìm thấy giao dịch nào phù hợp với "${searchQuery}"`
                        : 'Không có giao dịch nào để hiển thị'}
                </Text>

                {/* Action Button */}
                {hasSearchQuery ? (
                    <TouchableOpacity
                        className="bg-blue-500 px-5 py-2.5 rounded-lg mt-2"
                        onPress={onClearSearch}
                        activeOpacity={0.7}
                    >
                        <Text className="text-white font-medium">Xóa tìm kiếm</Text>
                    </TouchableOpacity>
                ) : (
                    <View className="flex-row items-center justify-center mt-2 bg-gray-50 rounded-lg p-3 w-full">
                        <Ionicons name="information-circle-outline" size={18} color="#4b5563" />
                        <Text className="text-sm text-gray-600 ml-2">
                            Hãy tạo giao dịch mới hoặc thử tìm kiếm khác
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

export default EmptyResults;
