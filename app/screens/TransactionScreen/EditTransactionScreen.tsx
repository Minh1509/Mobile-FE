import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/app/Types/types';
import { ITransaction } from '@/app/interface/Transaction';
import { HeaderEdit } from '@/app/Components/Header';

interface InputFieldProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
    multiline?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    multiline = false
}) => (
    <View className="mb-4">
        <Text className="text-gray-700 font-semibold mb-2">{label}</Text>
        <TextInput
            className={`bg-gray-100 p-4 rounded-xl shadow-md ${multiline ? 'h-28' : 'h-15'}`}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            keyboardType={keyboardType}
            multiline={multiline}
            textAlignVertical={multiline ? 'top' : 'center'}
        />
    </View>
);

interface SelectionGroupProps {
    label: string;
    options: string[];
    selected: string;
    onSelect: (option: string) => void;
}

const SelectionGroup: React.FC<SelectionGroupProps> = ({ label, options, selected, onSelect }) => (
    <View className="mb-4">
        <Text className="text-gray-700 font-semibold mb-2">{label}</Text>
        <View className="flex-row flex-wrap">
            {options.map(option => (
                <TouchableOpacity
                    key={option}
                    onPress={() => onSelect(option)}
                    className={`mr-2 mb-2 px-4 py-3 rounded-xl ${selected === option ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                >
                    <Text className={`font-medium ${selected === option ? 'text-white' : 'text-gray-800'}`}>{option}</Text>
                </TouchableOpacity>
            ))}
        </View>
    </View>
);

const EditTransactionScreen = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'EditTransaction'>>();
    const { transaction } = useRoute().params as { transaction: ITransaction };

    const [form, setForm] = useState(transaction);

    const handleSave = () => {
        const { amount, description, category, paymentMethod, date, time, location } = form;
        if (!amount || !description || !category || !paymentMethod || !date || !time || !location) {
            return Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ thông tin cần thiết");
        }
        navigation.navigate('TransactionDetail', { transaction: form });
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
            <View className="flex-1 bg-gray-50">
                <HeaderEdit onBack={navigation.goBack} title="Chỉnh sửa giao dịch" onSave={handleSave} />
                <ScrollView className="flex-1 p-5">
                    {[
                        { label: "Số tiền", key: "amount", keyboardType: "numeric" as const },
                        { label: "Ngày", key: "date", keyboardType: "default" as const },
                        { label: "Thời gian", key: "time", keyboardType: "default" as const },
                        { label: "Mô tả", key: "description", keyboardType: "default" as const },
                        { label: "Địa điểm", key: "location", keyboardType: "default" as const },
                        { label: "Ghi chú", key: "notes", multiline: true, keyboardType: "default" as const }
                    ].map(({ label, key, keyboardType, multiline }) => (
                        <InputField
                            key={key}
                            label={label}
                            value={form[key as keyof ITransaction] as string}
                            onChangeText={text => setForm(prev => ({ ...prev, [key]: text }))}
                            placeholder={`Nhập ${label.toLowerCase()}`}
                            keyboardType={keyboardType}
                            multiline={multiline}
                        />
                    ))}
                    <SelectionGroup
                        label="Danh mục"
                        options={["Di chuyển", "Ăn uống", "Tiền điện", "Tiền nước", "Học tập", "Giải trí", "Internet", "Khác"]}
                        selected={form.category}
                        onSelect={category => setForm(prev => ({ ...prev, category }))}
                    />
                    <SelectionGroup
                        label="Phương thức thanh toán"
                        options={["Tiền mặt", "Thẻ tín dụng", "Chuyển khoản", "Ví điện tử"]}
                        selected={form.paymentMethod}
                        onSelect={paymentMethod => setForm(prev => ({ ...prev, paymentMethod }))}
                    />
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
};

export default EditTransactionScreen;
