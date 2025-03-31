// File: UtilityScreen.js

import React from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '@/app/Types/types'

// Định nghĩa kiểu cho icon từ Ionicons
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// Định nghĩa kiểu cho navigation
type UtilityScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Utility'>;

// Định nghĩa interface cho UtilityItem, sử dụng IoniconsName cho icon
interface UtilityItem {
    id: string;
    title: string;
    icon: IoniconsName;
}

// Dữ liệu giả lập cho danh sách tiện ích
const utilities: UtilityItem[] = [
    {id: 'IncomeAndExpenditureChart', title: 'Biểu đồ thu chi', icon: 'pie-chart'},
    {id: '2', title: 'Biểu đồ phân tích theo danh mục', icon: 'git-network'},
    {id: '3', title: 'Biểu đồ xu hướng', icon: 'bar-chart'},
    {id: '4', title: 'Biểu đồ so sánh thu chi', icon: 'stats-chart'},
    {id: 'AddExpense', title: 'Thêm chi tiêu', icon: 'cash-outline'},
    {id: 'AddIncome', title: 'Thêm thu nhập', icon: 'wallet-outline'},
    {id: 'AddBudget', title: 'Thiết lập ngân sách', icon: 'calculator-outline'},
];

const UtilityScreen = () => {
    const navigation = useNavigation<UtilityScreenNavigationProp>(); // Khởi tạo navigation

    // Hàm xử lý khi nhấn vào một mục
    const handleItemPress = (id: string) => {
        if (id === 'IncomeAndExpenditureChart') {
            navigation.navigate('IncomeAndExpenditureChart');
        } else if (id === 'AddExpense') {
            navigation.navigate('AddExpense');
        } else if (id === 'AddIncome') {
            navigation.navigate('AddIncome');
        } else if (id === 'AddBudget') {
            navigation.navigate('AddBudget');
        } else {
            console.log('Chức năng đang được phát triển');
        }
    };

    // Hàm render từng mục trong danh sách
    const renderItem = ({item}: { item: UtilityItem }) => (
        <TouchableOpacity style={styles.itemContainer} onPress={() => handleItemPress(item.id)}>
            <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={24} color="#FF6347"/>
            </View>
            <Text style={styles.itemText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={24} color="#000"/>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Tiêu đề */}
            <Text style={styles.header}>Tiện ích</Text>

            {/* Danh sách tiện ích */}
            <FlatList
                data={utilities}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
            />
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 20,
        marginHorizontal: 16,
        color: '#333',
    },
    list: {
        paddingHorizontal: 16,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        marginBottom: 10,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    iconContainer: {
        marginRight: 16,
    },
    itemText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
});

export default UtilityScreen;
