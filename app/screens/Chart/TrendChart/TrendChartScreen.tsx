import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Dimensions, Platform} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {CartesianChart, Bar} from 'victory-native';
import {LinearGradient, vec, useFont} from '@shopify/react-native-skia';
import {useTransactions} from '@/app/hooks/useTransactions';
import {ITransaction} from '@/app/interface/Transaction';
import {RootStackParamList} from '@/app/Types/types';
import {VNDKFormat, VNDFormat} from '@/app/utils/MoneyParse';
import {Box} from '@gluestack-ui/themed';
import styles from './TrendChartScreenStyles';

const space_mono = require('@/assets/fonts/SpaceMono-Regular.ttf');

// Định nghĩa kiểu cho navigation
type TrendChartNavigationProp = StackNavigationProp<RootStackParamList, 'TrendChart'>;

// Định nghĩa kiểu cho dữ liệu biểu đồ
interface ChartData {
    period: string; // Thời gian (tuần, tháng, năm)
    income: number;
    expense: number;
}

const TrendChartScreen: React.FC = () => {
    const navigation = useNavigation<TrendChartNavigationProp>();
    const {transactions, loading} = useTransactions();
    const font = useFont(space_mono, 12);

    // State cho ngày bắt đầu và ngày kết thúc
    const [startDate, setStartDate] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() - 1)));
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [showStartPicker, setShowStartPicker] = useState<boolean>(false);
    const [showEndPicker, setShowEndPicker] = useState<boolean>(false);

    // State cho khoảng thời gian (tuần, tháng, năm)
    const [timeInterval, setTimeInterval] = useState<'week' | 'month' | 'year'>('month');

    // State cho dữ liệu biểu đồ
    const [chartData, setChartData] = useState<ChartData[]>([]);

    // Lấy chiều rộng màn hình để biểu đồ responsive
    const screenWidth = Dimensions.get('window').width;

    // Hàm định dạng ngày
    const formatDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Hàm nhóm giao dịch theo khoảng thời gian
    const groupTransactionsByInterval = (
        transactions: ITransaction[],
        start: Date,
        end: Date,
        interval: 'week' | 'month' | 'year'
    ): ChartData[] => {
        const groupedData: { [key: string]: { income: number; expense: number } } = {};

        // Lọc giao dịch trong khoảng thời gian
        const filteredTransactions = transactions.filter((transaction) => {
            const [day, month, year] = transaction.date.split('/').map(Number);
            const transactionDate = new Date(year, month - 1, day);
            return transactionDate >= start && transactionDate <= end;
        });

        // Nhóm giao dịch
        filteredTransactions.forEach((transaction) => {
            const [day, month, year] = transaction.date.split('/').map(Number);
            const date = new Date(year, month - 1, day);
            let periodKey: string;

            if (interval === 'week') {
                // Nhóm theo tuần (dựa trên tuần trong năm)
                const year = date.getFullYear();
                const firstDayOfYear = new Date(year, 0, 1);
                const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
                const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
                periodKey = `${year}-W${weekNumber}`;
            } else if (interval === 'month') {
                // Nhóm theo tháng
                const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                periodKey = `${monthStr}/${year}`;
            } else {
                // Nhóm theo năm
                periodKey = date.getFullYear().toString();
            }

            if (!groupedData[periodKey]) {
                groupedData[periodKey] = {income: 0, expense: 0};
            }

            if (transaction.type === 'income') {
                groupedData[periodKey].income += transaction.amount;
            } else {
                groupedData[periodKey].expense += Math.abs(transaction.amount);
            }
        });

        // Chuyển đổi dữ liệu thành mảng ChartData
        return Object.keys(groupedData)
            .sort() // Sắp xếp theo thời gian
            .map((period) => ({
                period,
                income: groupedData[period].income,
                expense: groupedData[period].expense,
            }));
    };

    // Hàm xử lý khi nhấn nút "Phân tích"
    const handleAnalyze = () => {
        if (startDate > endDate) {
            alert('Ngày bắt đầu không thể lớn hơn ngày kết thúc!');
            return;
        }

        const data = groupTransactionsByInterval(transactions, startDate, endDate, timeInterval);
        setChartData(data);
    };

    // Xử lý thay đổi ngày bắt đầu
    const onStartDateChange = (event: any, selectedDate?: Date) => {
        setShowStartPicker(false); // Ẩn picker sau khi chọn
        if (selectedDate) {
            setStartDate(selectedDate);
        }
    };

    // Xử lý thay đổi ngày kết thúc
    const onEndDateChange = (event: any, selectedDate?: Date) => {
        setShowEndPicker(false); // Ẩn picker sau khi chọn
        if (selectedDate) {
            setEndDate(selectedDate);
        }
    };

    // Chuẩn bị dữ liệu cho biểu đồ
    const chartDataFormatted = chartData
        .map((item) => [
            {x: `${item.period}`, y: item.income, type: 'income'},
            {x: `${item.period}`, y: item.expense, type: 'expense'},
        ])
        .flat();

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Xu hướng thu chi</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#333"/>
                </TouchableOpacity>
            </View>

            {/* Bộ chọn khoảng thời gian */}
            <View style={styles.intervalPickerContainer}>
                <TouchableOpacity
                    style={[styles.intervalButton, timeInterval === 'week' && styles.intervalButtonActive]}
                    onPress={() => setTimeInterval('week')}
                >
                    <Text
                        style={[
                            styles.intervalButtonText,
                            timeInterval === 'week' && styles.intervalButtonTextActive,
                        ]}
                    >
                        Tuần
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.intervalButton, timeInterval === 'month' && styles.intervalButtonActive]}
                    onPress={() => setTimeInterval('month')}
                >
                    <Text
                        style={[
                            styles.intervalButtonText,
                            timeInterval === 'month' && styles.intervalButtonTextActive,
                        ]}
                    >
                        Tháng
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.intervalButton, timeInterval === 'year' && styles.intervalButtonActive]}
                    onPress={() => setTimeInterval('year')}
                >
                    <Text
                        style={[
                            styles.intervalButtonText,
                            timeInterval === 'year' && styles.intervalButtonTextActive,
                        ]}
                    >
                        Năm
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Vùng chọn ngày */}
            <View style={styles.datePickerContainer}>
                <View style={styles.datePickerRow}>
                    <View style={styles.datePickerWrapper}>
                        <Text style={styles.dateLabel}>Từ</Text>
                        <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.dateButton}>
                            <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.datePickerWrapper}>
                        <Text style={styles.dateLabel}>Đến</Text>
                        <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.dateButton}>
                            <Text style={styles.dateText}>{formatDate(endDate)}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {Platform.OS !== 'web' && showStartPicker && (
                    <DateTimePicker
                        value={startDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onStartDateChange}
                    />
                )}
                {Platform.OS !== 'web' && showEndPicker && (
                    <DateTimePicker
                        value={endDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onEndDateChange}
                    />
                )}
            </View>

            {/* Tab chọn Tháng/Năm */}
            <View style={styles.tabWrapper}>
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, timeInterval === 'month' && styles.activeTab]}
                        onPress={() => setTimeInterval('month')}
                    >
                        <Text style={[styles.tabText, timeInterval === 'month' && styles.activeTabText]}>Tháng</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, timeInterval === 'year' && styles.activeTab]}
                        onPress={() => setTimeInterval('year')}
                    >
                        <Text style={[styles.tabText, timeInterval === 'year' && styles.activeTabText]}>Năm</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Nút Phân tích */}
            <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze}>
                <Text style={styles.analyzeButtonText}>Phân tích</Text>
            </TouchableOpacity>

            <View style={styles.chartContainer}>
                <View style={styles.chartWrapper}>
                    {loading ? (
                        <Text style={{textAlign: 'center', color: '#666'}}>Đang tải dữ liệu...</Text>
                    ) : chartDataFormatted.length > 0 ? (
                        <Box
                            width={350}
                            height={300}
                            $dark-bg="$black"
                            $light-bg="$white"
                            paddingHorizontal={5}
                            paddingVertical={10}
                        >
                            <Box width="100%" $dark-bg="$black" $light-bg="$white" height="100%">
                                <CartesianChart
                                    data={chartDataFormatted}
                                    xKey="x"
                                    yKeys={["y"]}
                                    domain={{y: [0, Math.max(...chartDataFormatted.map(item => item.y))]}}
                                    domainPadding={{left: 50, right: 50, top: 30}}
                                    axisOptions={{
                                        font,
                                        tickCount: {x: chartDataFormatted.length, y: 5},
                                        lineColor: '#FFFFFF',
                                        labelColor: '#FFFFFF',
                                        formatYLabel: (value) => VNDKFormat(value),
                                        labelOffset: {x: 10, y: 5},
                                    }}
                                >
                                    {({points, chartBounds}) => {
                                        return points.y.map((point, index) => (
                                            <Bar
                                                key={index}
                                                barWidth={20}
                                                points={[point]}
                                                chartBounds={chartBounds}
                                                animate={{type: "timing", duration: 1000}}
                                                roundedCorners={{
                                                    topLeft: 5,
                                                    topRight: 5,
                                                }}
                                            >
                                                <LinearGradient
                                                    start={vec(0, 0)}
                                                    end={vec(0, chartBounds.bottom)}
                                                    colors={
                                                        chartDataFormatted[index].type === 'income'
                                                            ? ['#5E3FBE', '#5E3FBE50']
                                                            : ['#FF6347', '#FF634750']
                                                    }
                                                />
                                            </Bar>
                                        ));
                                    }}
                                </CartesianChart>
                            </Box>
                        </Box>
                    ) : (
                        <Text style={{textAlign: 'center', color: '#666'}}>Không có dữ liệu để hiển thị</Text>
                    )}
                </View>
            </View>
        </View>
    );
};

export default TrendChartScreen;