import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/app/Types/types';
import { ITransaction } from '@/app/interface/Transaction';

// Header component for better organization
const Header = ({ onBack, title, onSave }: { onBack: () => void, title: string, onSave: () => void }) => (
    <View className="bg-white p-4 shadow">
        <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
                <TouchableOpacity onPress={onBack} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text className="text-xl font-bold">{title}</Text>
            </View>
            <TouchableOpacity onPress={onSave} className="px-4 py-2 bg-blue-500 rounded-lg">
                <Text className="text-white font-bold">Lưu</Text>
            </TouchableOpacity>
        </View>
    </View>
);

// Input field component
const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    multiline = false
}: {
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad',
    multiline?: boolean
}) => (
    <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">{label}</Text>
        <TextInput
            className={`bg-gray-100 p-3 rounded-lg ${multiline ? 'h-24 text-top' : ''}`}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            keyboardType={keyboardType}
            multiline={multiline}
            textAlignVertical={multiline ? 'top' : 'center'}
        />
    </View>
);

// Category selection component
const CategorySelector = ({
    selectedCategory,
    onSelect
}: {
    selectedCategory: string,
    onSelect: (category: string) => void
}) => {
    const categories = ["Di chuyển", "Ăn uống", "Tiền điện", "Tiền nước", "Khác"];

    return (
        <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Danh mục</Text>
            <View className="flex-row flex-wrap">
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category}
                        onPress={() => onSelect(category)}
                        className={`mr-2 mb-2 px-4 py-2 rounded-lg ${selectedCategory === category ? 'bg-blue-500' : 'bg-gray-200'}`}
                    >
                        <Text className={selectedCategory === category ? 'text-white' : 'text-gray-800'}>
                            {category}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

// Payment method selection component
const PaymentMethodSelector = ({
    selectedMethod,
    onSelect
}: {
    selectedMethod: string,
    onSelect: (method: string) => void
}) => {
    const methods = ["Tiền mặt", "Thẻ tín dụng", "Chuyển khoản", "Ví điện tử"];

    return (
        <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Phương thức thanh toán</Text>
            <View className="flex-row flex-wrap">
                {methods.map((method) => (
                    <TouchableOpacity
                        key={method}
                        onPress={() => onSelect(method)}
                        className={`mr-2 mb-2 px-4 py-2 rounded-lg ${selectedMethod === method ? 'bg-blue-500' : 'bg-gray-200'}`}
                    >
                        <Text className={selectedMethod === method ? 'text-white' : 'text-gray-800'}>
                            {method}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

// Main EditTransactionScreen component
type EditTransactionRouteProp = RouteProp<RootStackParamList, 'EditTransaction'>;
type EditTransactionNavigationProp = StackNavigationProp<RootStackParamList, 'EditTransaction'>;

const EditTransactionScreen = () => {
    const navigation = useNavigation<EditTransactionNavigationProp>();
    const route = useRoute<EditTransactionRouteProp>();
    const { transaction } = route.params as { transaction: ITransaction };

    // State for form fields
    const [amount, setAmount] = useState(transaction.amount);
    const [description, setDescription] = useState(transaction.description);
    const [category, setCategory] = useState(transaction.category);
    const [paymentMethod, setPaymentMethod] = useState(transaction.paymentMethod);
    const [location, setLocation] = useState(transaction.location);
    const [notes, setNotes] = useState(transaction.notes);
    const [date, setDate] = useState(transaction.date);

    const handleSave = () => {
        // Validate inputs
        if (!amount || !description || !category || !paymentMethod) {
            Alert.alert(
                "Thiếu thông tin",
                "Vui lòng điền đầy đủ thông tin cần thiết (số tiền, mô tả, danh mục, phương thức thanh toán)"
            );
            return;
        }

        // Create updated transaction object
        const updatedTransaction: ITransaction = {
            ...transaction,
            amount,
            description,
            category,
            paymentMethod,
            location,
            notes,
            date
        };

        // Here you would typically update the transaction in your data store

        // Navigate back to detail screen with updated transaction
        navigation.navigate('TransactionDetail', { transaction: updatedTransaction });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
        >
            <View className="flex-1 bg-white">
                <Header
                    onBack={() => navigation.goBack()}
                    title="Chỉnh sửa giao dịch"
                    onSave={handleSave}
                />

                <ScrollView className="flex-1 p-4">
                    <InputField
                        label="Số tiền"
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="Nhập số tiền"
                        keyboardType="numeric"
                    />

                    <InputField
                        label="Ngày"
                        value={date}
                        onChangeText={setDate}
                        placeholder="DD/MM/YYYY"
                    />

                    <InputField
                        label="Mô tả"
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Nhập mô tả giao dịch"
                    />

                    <CategorySelector
                        selectedCategory={category}
                        onSelect={setCategory}
                    />

                    <PaymentMethodSelector
                        selectedMethod={paymentMethod}
                        onSelect={setPaymentMethod}
                    />

                    <InputField
                        label="Địa điểm"
                        value={location}
                        onChangeText={setLocation}
                        placeholder="Nhập địa điểm (tùy chọn)"
                    />

                    <InputField
                        label="Ghi chú"
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Nhập ghi chú (tùy chọn)"
                        multiline={true}
                    />

                    <View className="h-10" />
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
};

export default EditTransactionScreen;