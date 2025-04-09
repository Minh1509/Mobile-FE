import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Dimensions} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {CartesianChart, Bar} from 'victory-native';
import {LinearGradient, vec, useFont} from '@shopify/react-native-skia';
import {useTransactions} from '@/app/hooks/useTransactions';
import {ITransaction} from '@/app/interface/Transaction';
import {RootStackParamList} from '@/app/Types/types';
import {VNDKFormat, VNDFormat} from '@/app/utils/MoneyParse';
import {Box} from '@gluestack-ui/themed';
import styles from './IncomeAndExpenditureComparisonChartStyles';

const space_mono = require('@/assets/fonts/SpaceMono-Regular.ttf');

type IncomeAndExpenditureComparisonChartNavigationProp = StackNavigationProp<RootStackParamList, 'IncomeAndExpenditureComparisonChart'>;

const getDateComponents = (date: string) => {
    const [day, month, year] = date.split('/').map(Number);
    return {day, month, year};
};

const IncomeAndExpenditureComparisonChart: React.FC = () => {
    const navigation = useNavigation<IncomeAndExpenditureComparisonChartNavigationProp>();
    const {transactions, loading} = useTransactions();
    const font = useFont(space_mono, 12);

    const [firstPeriod, setFirstPeriod] = useState<{ start: string; end: string }>({start: '01/04/2025', end: '15/04/2025'});
    const [secondPeriod, setSecondPeriod] = useState<{ start: string; end: string }>({start: '16/04/2025', end: '30/04/2025'});
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        if (loading) return;

        const {day: firstStartDay, month: firstStartMonth, year: firstStartYear} = getDateComponents(firstPeriod.start);
        const {day: firstEndDay, month: firstEndMonth, year: firstEndYear} = getDateComponents(firstPeriod.end);
        const firstStartDate = new Date(firstStartYear, firstStartMonth - 1, firstStartDay);
        const firstEndDate = new Date(firstEndYear, firstEndMonth - 1, firstEndDay);

        const {day: secondStartDay, month: secondStartMonth, year: secondStartYear} = getDateComponents(secondPeriod.start);
        const {day: secondEndDay, month: secondEndMonth, year: secondEndYear} = getDateComponents(secondPeriod.end);
        const secondStartDate = new Date(secondStartYear, secondStartMonth - 1, secondStartDay);
        const secondEndDate = new Date(secondEndYear, secondEndMonth - 1, secondEndDay);

        const firstPeriodTransactions = transactions.filter((transaction: ITransaction) => {
            const {day, month, year} = getDateComponents(transaction.date);
            const transactionDate = new Date(year, month - 1, day);
            return transactionDate >= firstStartDate && transactionDate <= firstEndDate;
        });

        const secondPeriodTransactions = transactions.filter((transaction: ITransaction) => {
            const {day, month, year} = getDateComponents(transaction.date);
            const transactionDate = new Date(year, month - 1, day);
            return transactionDate >= secondStartDate && transactionDate <= secondEndDate;
        });

        const firstIncome = firstPeriodTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const firstExpense = firstPeriodTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => Math.abs(sum + t.amount), 0);

        const secondIncome = secondPeriodTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const secondExpense = secondPeriodTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => Math.abs(sum + t.amount), 0);

        const data = [
            {x: 'TN (1)', y: firstIncome, type: 'income'},
            {x: 'CT (1)', y: firstExpense, type: 'expense'},
            {x: 'TN (2)', y: secondIncome, type: 'income'},
            {x: 'CT (2)', y: secondExpense, type: 'expense'},
        ];

        setChartData(data);
    }, [transactions, loading, firstPeriod, secondPeriod]);

    const screenWidth = Dimensions.get('window').width;

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>So sánh thu chi</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#333"/>
                </TouchableOpacity>
            </View>

            <View style={styles.datePickerContainer}>
                <Text style={styles.periodLabel}>Khoảng thời gian 1</Text>
                <View style={styles.datePickerRow}>
                    <View style={styles.datePickerWrapper}>
                        <Text style={styles.dateLabel}>Từ</Text>
                        <TouchableOpacity style={styles.dateButton}>
                            <Text style={styles.dateText}>{firstPeriod.start}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.datePickerWrapper}>
                        <Text style={styles.dateLabel}>Đến</Text>
                        <TouchableOpacity style={styles.dateButton}>
                            <Text style={styles.dateText}>{firstPeriod.end}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={[styles.periodLabel, {marginTop: 16}]}>Khoảng thời gian 2</Text>
                <View style={styles.datePickerRow}>
                    <View style={styles.datePickerWrapper}>
                        <Text style={styles.dateLabel}>Từ</Text>
                        <TouchableOpacity style={styles.dateButton}>
                            <Text style={styles.dateText}>{secondPeriod.start}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.datePickerWrapper}>
                        <Text style={styles.dateLabel}>Đến</Text>
                        <TouchableOpacity style={styles.dateButton}>
                            <Text style={styles.dateText}>{secondPeriod.end}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.chartContainer}>
                <View style={styles.chartWrapper}>
                    {loading ? (
                        <Text style={{textAlign: 'center', color: '#666'}}>Đang tải dữ liệu...</Text>
                    ) : chartData.length > 0 ? (
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
                                    data={chartData}
                                    xKey="x"
                                    yKeys={["y"]}
                                    domain={{y: [0, Math.max(...chartData.map(item => item.y))]}}
                                    domainPadding={{left: 50, right: 50, top: 30}}
                                    axisOptions={{
                                        font,
                                        tickCount: {x: chartData.length, y: 5},
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
                                                    colors={chartData[index].type === 'income' ? ['#5E3FBE', '#5E3FBE50'] : ['#FF6347', '#FF634750']}
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

            <TouchableOpacity style={styles.analyzeButton}>
                <Text style={styles.analyzeButtonText}>Phân tích</Text>
            </TouchableOpacity>
        </View>
    );
};

export default IncomeAndExpenditureComparisonChart;