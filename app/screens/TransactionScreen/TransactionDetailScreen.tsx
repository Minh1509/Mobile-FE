import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/app/Types/types';
import { ITransaction } from '@/app/interface/Transaction';

// Header component for better organization
const Header = ({ onBack, title }: { onBack: () => void, title: string }) => (
    <View className="bg-white p-4 shadow">
        <View className="flex-row items-center">
            <TouchableOpacity onPress={onBack} className="mr-4">
                <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-xl font-bold">{title}</Text>
        </View>
    </View>
);

// Transaction summary component
const TransactionSummary = ({
    amount,
    date,
    categoryIcon
}: {
    amount: string,
    date: string,
    categoryIcon: keyof typeof Ionicons.glyphMap
}) => (
    <View className="bg-white rounded-lg p-6 mb-4 shadow items-center">
        <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-3">
            <Ionicons name={categoryIcon} size={32} color="gray" />
        </View>
        <Text className="text-3xl font-bold text-red-500 mb-2">{amount}</Text>
        <Text className="text-gray-500">{date}</Text>
    </View>
);

// Detail item component
const DetailItem = ({
    label,
    value,
    isLast = false
}: {
    label: string,
    value: string,
    isLast?: boolean
}) => (
    <View className={`flex-row py-3 ${!isLast ? 'border-b border-gray-100' : ''}`}>
        <Text className="flex-1 text-gray-500">{label}</Text>
        <Text className="font-medium max-w-[60%] text-right">{value}</Text>
    </View>
);

// Action buttons component
const ActionButtons = ({
    onEdit,
    onDelete
}: {
    onEdit: () => void,
    onDelete: () => void
}) => (
    <View className="flex-row space-x-4 mb-4">
        <TouchableOpacity
            className="flex-1 bg-blue-500 p-4 rounded-lg items-center"
            onPress={onEdit}
        >
            <Ionicons name="create-outline" size={24} color="white" />
            <Text className="text-white font-medium mt-1">Chỉnh sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
            className="flex-1 bg-red-500 p-4 rounded-lg items-center"
            onPress={onDelete}
        >
            <Ionicons name="trash-outline" size={24} color="white" />
            <Text className="text-white font-medium mt-1">Xóa</Text>
        </TouchableOpacity>
    </View>
);

// Main TransactionDetailScreen component
type TransactionDetailRouteProp = RouteProp<RootStackParamList, 'TransactionDetail'>;
type TransactionDetailNavigationProp = StackNavigationProp<RootStackParamList, 'TransactionDetail'>;

const TransactionDetailScreen = () => {
    const navigation = useNavigation<TransactionDetailNavigationProp>();
    const route = useRoute<TransactionDetailRouteProp>();
    const { transaction } = route.params;

    const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
        switch (category) {
            case "Di chuyển": return "car";
            case "Ăn uống": return "restaurant";
            case "Tiền điện": return "flash";
            case "Tiền nước": return "water";
            default: return "cart";
        }
    };

    const handleEdit = () => {
        // Navigate to edit screen with transaction data
        navigation.navigate('EditTransaction', { transaction });
    };

    const handleDelete = () => {
        Alert.alert(
            "Xóa giao dịch",
            "Bạn có chắc chắn muốn xóa giao dịch này không?",
            [
                {
                    text: "Hủy",
                    style: "cancel"
                },
                {
                    text: "Xóa",
                    onPress: () => {
                        // Delete logic here
                        navigation.goBack();
                    },
                    style: "destructive"
                }
            ]
        );
    };

    return (
        <View className="flex-1 bg-gray-100">
            <Header
                onBack={() => navigation.goBack()}
                title="Chi tiết giao dịch"
            />

            <ScrollView className="flex-1 p-4">
                <TransactionSummary
                    amount={transaction.amount}
                    date={transaction.date}
                    categoryIcon={getCategoryIcon(transaction.category)}
                />

                <View className="bg-white rounded-lg p-4 shadow mb-4">
                    <Text className="text-lg font-bold mb-4">Thông tin chi tiết</Text>

                    <DetailItem label="Mô tả" value={transaction.description} />
                    <DetailItem label="Danh mục" value={transaction.category} />
                    <DetailItem label="Phương thức thanh toán" value={transaction.paymentMethod} />
                    <DetailItem label="Địa điểm" value={transaction.location} />
                    <DetailItem label="Ghi chú" value={transaction.notes} isLast={true} />
                </View>

                <ActionButtons
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </ScrollView>
        </View>
    );
};

export default TransactionDetailScreen;