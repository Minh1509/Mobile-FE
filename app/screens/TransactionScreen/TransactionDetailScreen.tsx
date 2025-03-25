import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/app/Types/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCategoryIcon } from '@/app/utils/GetCategoryIcon';
import { Header } from '@/app/Components/Header';
import { mainStyles } from '@/app/styles';

type TransactionDetailRouteProp = RouteProp<RootStackParamList, 'TransactionDetail'>;
type TransactionDetailNavigationProp = StackNavigationProp<RootStackParamList, 'TransactionDetail'>;

const DetailItem = ({ label, value }: { label: string, value?: string }) =>
    value ? (
        <View className="flex-row py-3 border-b border-gray-100">
            <Text className="flex-1 text-gray-500">{label}</Text>
            <Text className="font-medium max-w-[60%] text-right">{value}</Text>
        </View>
    ) : null;

const TransactionDetailScreen = () => {
    const navigation = useNavigation<TransactionDetailNavigationProp>();
    const { params: { transaction } } = useRoute<TransactionDetailRouteProp>();
    const { imageSource } = getCategoryIcon(transaction.category);
    const isNegative = transaction.amount < 0;

    const handleDelete = () => Alert.alert("Xóa giao dịch", "Bạn có chắc chắn muốn xóa?", [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive", onPress: () => navigation.navigate("Tabs") }
    ]);

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <Header
                title="Chi tiết giao dịch"
                onBack={navigation.goBack}
                onEdit={() => navigation.navigate('EditTransaction', { transaction })}
                onDelete={handleDelete}
            />

            <ScrollView className="flex-1 p-4">
                <View className="bg-white rounded-lg p-6 mb-4 shadow items-center">
                    <Image source={imageSource} style={mainStyles.categoryIcon} />
                    <Text className={`text-3xl font-bold ${isNegative ? "text-red-500" : "text-green-500"} mb-2`}>
                        {transaction.amount}
                    </Text>
                    <Text className="text-gray-600">Lúc {transaction.time || ""} ngày {transaction.date}</Text>
                </View>

                <View className="bg-white rounded-lg p-4 shadow mb-4">
                    <Text className="text-lg font-bold mb-4">Thông tin chi tiết</Text>
                    <DetailItem label="Mô tả" value={transaction.description} />
                    <DetailItem label="Danh mục" value={transaction.category} />
                    <DetailItem label="Phương thức thanh toán" value={transaction.paymentMethod} />
                    <DetailItem label="Địa điểm" value={transaction.location} />
                    <DetailItem label="Ghi chú" value={transaction.notes || "Không có ghi chú"} />
                    {transaction.image ? (
                        <View className="my-3">
                            <Text className="text-gray-500 mb-2">Ảnh đính kèm</Text>
                            <Image source={{ uri: transaction.image }} style={mainStyles.receiptImage} resizeMode="cover" />
                        </View>
                    ) : null}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default TransactionDetailScreen;