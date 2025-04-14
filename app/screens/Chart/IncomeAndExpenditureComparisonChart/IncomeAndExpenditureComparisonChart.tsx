import React, {useState} from 'react';
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
import {VNDKFormat} from '@/app/utils/MoneyParse';
import {Box} from '@gluestack-ui/themed';
import styles from './IncomeAndExpenditureComparisonChartStyles';

const space_mono = require('@/assets/fonts/SpaceMono-Regular.ttf');

type IncomeAndExpenditureComparisonChartNavigationProp = StackNavigationProp<
    RootStackParamList,
    'IncomeAndExpenditureComparisonChart'
>;

// Định nghĩa kiểu cho dữ liệu biểu đồ
interface ChartData {
    period: string;
    income: number;
    expense: number;
}

const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const IncomeAndExpenditureComparisonChart: React.FC = () => {
    const navigation = useNavigation<IncomeAndExpenditureComparisonChartNavigationProp>();
    const {transactions, loading} = useTransactions();
    const font = useFont(space_mono, 12);

    // State cho khoảng thời gian 1 và 2
    const [firstPeriod, setFirstPeriod] = useState<{ start: Date; end: Date }>({
        start: new Date(2025, 3, 1), // 01/04/2025
        end: new Date(2025, 3, 15), // 15/04/2025
    });
    const [secondPeriod, setSecondPeriod] = useState<{ start: Date; end: Date }>({
        start: new Date(2025, 3, 16), // 16/04/2025
        end: new Date(2025, 3, 30), // 30/04/2025
    });

    // State cho DatePicker
    const [showFirstStartPicker, setShowFirstStartPicker] = useState(false);
    const [showFirstEndPicker, setShowFirstEndPicker] = useState(false);
    const [showSecondStartPicker, setShowSecondStartPicker] = useState(false);
    const [showSecondEndPicker, setShowSecondEndPicker] = useState(false);

    // State cho khoảng thời gian (tuần, tháng, năm)
    const [timeInterval, setTimeInterval] = useState<'week' | 'month' | 'year'>('month');

    // State cho dữ liệu biểu đồ
    const [chartData, setChartData] = useState<ChartData[]>([]);

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
                const year = date.getFullYear();
                const firstDayOfYear = new Date(year, 0, 1);
                const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
                const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
                periodKey = `${year}-W${weekNumber}`;
            } else if (interval === 'month') {
                const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                periodKey = `${monthStr}/${year}`;
            } else {
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

        return Object.keys(groupedData)
            .sort()
            .map((period) => ({
                period,
                income: groupedData[period].income || 0,
                expense: groupedData[period].expense || 0,
            }));
    };

    // Hàm xử lý khi nhấn nút "Phân tích"
    const handleAnalyze = () => {
        if (firstPeriod.start > firstPeriod.end) {
            alert('Ngày bắt đầu của khoảng thời gian 1 không thể lớn hơn ngày kết thúc!');
            return;
        }
        if (secondPeriod.start > secondPeriod.end) {
            alert('Ngày bắt đầu của khoảng thời gian 2 không thể lớn hơn ngày kết thúc!');
            return;
        }

        const firstData = groupTransactionsByInterval(transactions, firstPeriod.start, firstPeriod.end, timeInterval);
        const secondData = groupTransactionsByInterval(transactions, secondPeriod.start, secondPeriod.end, timeInterval);

        const combinedData: ChartData[] = [
            ...firstData.map((item) => ({
                period: `${item.period} (1)`,
                income: item.income,
                expense: item.expense,
            })),
            ...secondData.map((item) => ({
                period: `${item.period} (2)`,
                income: item.income,
                expense: item.expense,
            })),
        ];

        setChartData(combinedData);
    };

    // Xử lý thay đổi ngày
    const onFirstStartDateChange = (event: any, selectedDate?: Date) => {
        setShowFirstStartPicker(false);
        if (selectedDate) {
            setFirstPeriod((prev) => ({...prev, start: selectedDate}));
        }
    };

    const onFirstEndDateChange = (event: any, selectedDate?: Date) => {
        setShowFirstEndPicker(false);
        if (selectedDate) {
            setFirstPeriod((prev) => ({...prev, end: selectedDate}));
        }
    };

    const onSecondStartDateChange = (event: any, selectedDate?: Date) => {
        setShowSecondStartPicker(false);
        if (selectedDate) {
            setSecondPeriod((prev) => ({...prev, start: selectedDate}));
        }
    };

    const onSecondEndDateChange = (event: any, selectedDate?: Date) => {
        setShowSecondEndPicker(false);
        if (selectedDate) {
            setSecondPeriod((prev) => ({...prev, end: selectedDate}));
        }
    };

    // Chuẩn bị dữ liệu cho biểu đồ với kiểm tra undefined
    const chartDataFormatted = chartData
        .map((item) => [
            {x: `TN ${item.period || 'Unknown'}`, y: item.income || 0, type: 'income'},
            {x: `CT ${item.period || 'Unknown'}`, y: item.expense || 0, type: 'expense'},
        ])
        .flat();

    const screenWidth = Dimensions.get('window').width;

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>So sánh thu chi</Text>
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
                        style={[styles.intervalButtonText, timeInterval === 'week' && styles.intervalButtonTextActive]}
                    >
                        Tuần
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.intervalButton, timeInterval === 'month' && styles.intervalButtonActive]}
                    onPress={() => setTimeInterval('month')}
                >
                    <Text
                        style={[styles.intervalButtonText, timeInterval === 'month' && styles.intervalButtonTextActive]}
                    >
                        Tháng
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.intervalButton, timeInterval === 'year' && styles.intervalButtonActive]}
                    onPress={() => setTimeInterval('year')}
                >
                    <Text
                        style={[styles.intervalButtonText, timeInterval === 'year' && styles.intervalButtonTextActive]}
                    >
                        Năm
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Vùng chọn ngày */}
            <View style={styles.datePickerContainer}>
                <Text style={styles.periodLabel}>Khoảng thời gian 1</Text>
                <View style={styles.datePickerRow}>
                    <View style={styles.datePickerWrapper}>
                        <Text style={styles.dateLabel}>Từ</Text>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowFirstStartPicker(true)}
                        >
                            <Text style={styles.dateText}>{formatDate(firstPeriod.start)}</Text>
                        </TouchableOpacity>
                        {showFirstStartPicker && (
                            <DateTimePicker
                                value={firstPeriod.start}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onFirstStartDateChange}
                            />
                        )}
                    </View>
                    <View style={styles.datePickerWrapper}>
                        <Text style={styles.dateLabel}>Đến</Text>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowFirstEndPicker(true)}
                        >
                            <Text style={styles.dateText}>{formatDate(firstPeriod.end)}</Text>
                        </TouchableOpacity>
                        {showFirstEndPicker && (
                            <DateTimePicker
                                value={firstPeriod.end}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onFirstEndDateChange}
                            />
                        )}
                    </View>
                </View>

                <Text style={[styles.periodLabel, {marginTop: 16}]}>Khoảng thời gian 2</Text>
                <View style={styles.datePickerRow}>
                    <View style={styles.datePickerWrapper}>
                        <Text style={styles.dateLabel}>Từ</Text>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowSecondStartPicker(true)}
                        >
                            <Text style={styles.dateText}>{formatDate(secondPeriod.start)}</Text>
                        </TouchableOpacity>
                        {showSecondStartPicker && (
                            <DateTimePicker
                                value={secondPeriod.start}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onSecondStartDateChange}
                            />
                        )}
                    </View>
                    <View style={styles.datePickerWrapper}>
                        <Text style={styles.dateLabel}>Đến</Text>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowSecondEndPicker(true)}
                        >
                            <Text style={styles.dateText}>{formatDate(secondPeriod.end)}</Text>
                        </TouchableOpacity>
                        {showSecondEndPicker && (
                            <DateTimePicker
                                value={secondPeriod.end}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onSecondEndDateChange}
                            />
                        )}
                    </View>
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
                                    domain={{
                                        y: [
                                            0,
                                            Math.max(...chartDataFormatted.map(item => item.y), 1000) // Đảm bảo domain không bị lỗi khi y đều là 0
                                        ]
                                    }}
                                    domainPadding={{left: 50, right: 50, top: 30}}
                                    axisOptions={{
                                        font,
                                        tickCount: {x: chartDataFormatted.length, y: 5},
                                        lineColor: '#FFFFFF',
                                        labelColor: '#FFFFFF',
                                        formatYLabel: (value) => VNDKFormat(value),
                                        labelOffset: {x: 10, y: 5},
                                        formatXLabel: (value) => (typeof value === 'string' ? value : 'N/A'), // Xử lý undefined
                                    }}
                                >
                                    {({points, chartBounds}) => {
                                        return points.y.map((point, index) => (
                                            <Bar
                                                key={index}
                                                barWidth={50}
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

export default IncomeAndExpenditureComparisonChart;