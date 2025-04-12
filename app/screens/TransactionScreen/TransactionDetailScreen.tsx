import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/app/Types/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCategoryIcon } from '@/app/utils/GetCategoryIcon';
import { Header } from '@/app/Components/Header';
import { mainStyles } from '@/app/styles';
import { VNDFormat } from '@/app/utils/MoneyParse';
import { TransactionType, PayMethod, ITransaction } from '@/app/interface/Transaction';
import { TransactionService } from '@/app/services/transaction.service'; // Thêm hàm xóa giao dịch

type TransactionDetailRouteProp = RouteProp<RootStackParamList, 'TransactionDetail'>;
type TransactionDetailNavigationProp = StackNavigationProp<RootStackParamList, 'TransactionDetail'>;

const DetailItem = ({ label, value }: { label: string, value?: string }) =>
    value ? (
        <View className="flex-row py-3 border-b border-gray-100">
            <Text className="flex-1 text-gray-500">{label}</Text>
            <Text className="font-medium max-w-[60%] text-right">{value}</Text>
        </View>
    ) : null;

// Hàm chuyển đổi PayMethod thành chuỗi thân thiện
const formatPaymentMethod = (method: PayMethod): string => {
    switch (method) {
        case PayMethod.CASH:
            return "Tiền mặt";
        case PayMethod.CARD:
            return "Thẻ tín dụng";
        case PayMethod.BANK_TRANSFER:
            return "Ví điện tử";
        default:
            return "Không xác định";
    }
};

const TransactionDetailScreen = () => {
    const navigation = useNavigation<TransactionDetailNavigationProp>();
    const { params: { transaction, origin: paramsOrigin } } = useRoute<TransactionDetailRouteProp>();
    const { imageSource } = getCategoryIcon(transaction.category);
    const [imageError, setImageError] = useState(false); // Trạng thái lỗi tải ảnh

    const sign = transaction.type === TransactionType.INCOME ? "+" : "-";
    const amountColor = transaction.type === TransactionType.INCOME ? "text-green-500" : "text-red-500";
    const formattedAmount = `${sign} ${VNDFormat(transaction.amount)}`;
    const formattedPaymentMethod = formatPaymentMethod(transaction.paymentMethod);

    const handleDelete = () => {
        Alert.alert("Xóa giao dịch", "Bạn có chắc chắn muốn xóa?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa",
                style: "destructive",
                onPress: async () => {
                    try {
                        const result = await TransactionService.deleteTransaction(transaction.id);
                        if (result.success) {
                            Alert.alert("Thành công", "Giao dịch đã được xóa.");
                            navigation.navigate("Tabs");
                        } else {
                            Alert.alert("Lỗi", result.error || "Không thể xóa giao dịch. Vui lòng thử lại.");
                        }
                    } catch (error) {
                        console.error("Lỗi khi xóa giao dịch:", error);
                        Alert.alert("Lỗi", "Không thể xóa giao dịch. Vui lòng thử lại.");
                    }
                }
            }
        ]);
    };

    const origin = paramsOrigin || 'Home';

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <Header
                title="Chi tiết giao dịch"
                onBack={navigation.goBack}
                onEdit={() => navigation.navigate('EditTransaction', { 
                    transaction,
                    origin
                 })}
                onDelete={handleDelete}
            />

            <ScrollView className="flex-1 p-4">
                <View className="bg-white rounded-lg p-6 mb-4 shadow items-center">
                    <Image source={imageSource} style={mainStyles.categoryIcon} />
                    <Text className={`text-3xl font-bold ${amountColor} mb-2`}>
                        {formattedAmount}
                    </Text>
                    <Text className="text-gray-600">
                        {transaction.time ? `Lúc ${transaction.time}` : ""} ngày {transaction.date || "Không xác định"}
                    </Text>
                </View>

                <View className="bg-white rounded-lg p-4 shadow mb-4">
                    <Text className="text-lg font-bold mb-4">Thông tin chi tiết</Text>
                    <DetailItem label="Mô tả" value={transaction.description} />
                    <DetailItem label="Danh mục" value={transaction.category} />
                    <DetailItem label="Phương thức thanh toán" value={formattedPaymentMethod} />
                    <DetailItem label="Địa điểm" value={transaction.location} />
                    <DetailItem label="Ghi chú" value={transaction.note || "Không có ghi chú"} />
                    {transaction.image ? (
                        <View className="my-3">
                            <Text className="text-gray-500 mb-2">Ảnh đính kèm</Text>
                            {imageError ? (
                                <Text className="text-red-500">Không thể tải ảnh</Text>
                            ) : (
                                <Image
                                    source={{ uri: transaction.image }}
                                    style={mainStyles.receiptImage}
                                    resizeMode="cover"
                                    onError={() => setImageError(true)} // Xử lý lỗi tải ảnh
                                />
                            )}
                        </View>
                    ) : null}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default TransactionDetailScreen;