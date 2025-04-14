import React, {useEffect, useState} from 'react';
import {TouchableOpacity, FlatList, Dimensions, ScrollView} from 'react-native';
import {Box, HStack, Text, View} from "@gluestack-ui/themed";
import {Pie, PolarChart, CartesianChart, Bar} from "victory-native";
import {useFont, vec, LinearGradient} from "@shopify/react-native-skia";
import {Ionicons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useTransactions} from '@/app/hooks/useTransactions';
import {ITransaction} from '@/app/interface/Transaction';
import {RootStackParamList} from '@/app/Types/types';
import {VNDFormat, VNDKFormat} from '@/app/utils/MoneyParse';
import styles from './IncomeAndExpenditureChartScreenStyles';

const space_mono = require('@/assets/fonts/SpaceMono-Regular.ttf'); // Thêm font

type IncomeAndExpenditureChartNavigationProp = StackNavigationProp<RootStackParamList, 'IncomeAndExpenditureChart'>;

const getDateComponents = (date: string) => {
    const [day, month, year] = date.split('/').map(Number);
    return {day, month, year};
};

const generateGradientColors = (startColor: string, endColor: string, steps: number) => {
    if (steps <= 1) {
        return [startColor];
    }

    const start = parseInt(startColor.replace('#', ''), 16);
    const end = parseInt(endColor.replace('#', ''), 16);

    const startR = (start >> 16) & 255;
    const startG = (start >> 8) & 255;
    const startB = start & 255;

    const endR = (end >> 16) & 255;
    const endG = (end >> 8) & 255;
    const endB = end & 255;

    const colors = [];
    for (let i = 0; i < steps; i++) {
        const ratio = i / (steps - 1);
        const r = Math.round(startR + (endR - startR) * ratio);
        const g = Math.round(startG + (endG - startG) * ratio);
        const b = Math.round(startB + (endB - startB) * ratio);
        colors.push(`#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`);
    }
    return colors;
};

const IncomeAndExpenditureChartScreen: React.FC = () => {
    const currentDate = new Date();
    const navigation = useNavigation<IncomeAndExpenditureChartNavigationProp>();
    const {transactions, loading} = useTransactions();
    const font = useFont(space_mono, 12); // Thêm font cho trục

    const formatDate = (date: Date): string => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const [currentMonth, setCurrentMonth] = useState<number>(currentDate.getMonth());
    const [currentYear, setCurrentYear] = useState<number>(currentDate.getFullYear());

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
        start: formatDate(startOfMonth),
        end: formatDate(endOfMonth),
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<'Tuần' | 'Tháng' | 'Năm'>('Tháng');
    const [selectedType, setSelectedType] = useState<'Chi tiêu' | 'Thu nhập'>('Chi tiêu');
    const [categoryData, setCategoryData] = useState<
        { category: string; amount: number; percentage: number }[]
    >([]);
    const [totalIncome, setTotalIncome] = useState<number>(0);
    const [totalExpense, setTotalExpense] = useState<number>(0);
    const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

    useEffect(() => {
        if (loading) return;

        const {day: startDay, month: startMonth, year: startYear} = getDateComponents(dateRange.start);
        const {day: endDay, month: endMonth, year: endYear} = getDateComponents(dateRange.end);
        const startDate = new Date(startYear, startMonth - 1, startDay);
        const endDate = new Date(endYear, endMonth - 1, endDay);

        const filteredTransactions: ITransaction[] = transactions.filter((transaction: ITransaction) => {
            const {day, month, year} = getDateComponents(transaction.date);
            const transactionDate = new Date(year, month - 1, day);
            return transactionDate >= startDate && transactionDate <= endDate;
        });

        console.log('filteredTransactions:', filteredTransactions);

        const income = filteredTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = filteredTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => Math.abs(sum + t.amount), 0);

        setTotalIncome(income);
        setTotalExpense(expense);

        const categoryMap: { [key: string]: number } = {};

        filteredTransactions.forEach((transaction: ITransaction) => {
            const {category, amount} = transaction;
            if (selectedType === 'Chi tiêu' && transaction.type === 'expense') {
                categoryMap[category] = (categoryMap[category] || 0) + Math.abs(amount);
            } else if (selectedType === 'Thu nhập' && transaction.type === 'income') {
                categoryMap[category] = (categoryMap[category] || 0) + amount;
            }
        });

        const total = Object.values(categoryMap).reduce((sum, amount) => sum + amount, 0);

        const categoryArray = Object.keys(categoryMap).map((category) => ({
            category,
            amount: categoryMap[category],
            percentage: total > 0 ? (categoryMap[category] / total) * 100 : 0,
        }));

        setCategoryData(categoryArray);

        const colors =
            selectedType === 'Chi tiêu'
                ? generateGradientColors('#5E3FBE', '#FFFFFF', categoryArray.length || 1)
                : generateGradientColors('#174E1F', '#3FBE52', categoryArray.length || 1);

        const pieData = categoryArray.map((item, index) => ({
            x: item.category,
            y: item.amount,
            color: colors[index],
            percentage: item.percentage,
        }));

        console.log('chartData:', pieData);
        setChartData(pieData);
    }, [selectedType, transactions, loading, dateRange]);

    const screenWidth = Dimensions.get('window').width;

    const handleDateNavigation = (direction: 'prev' | 'next') => {
        let newMonth = currentMonth;
        let newYear = currentYear;

        if (selectedPeriod === 'Tháng') {
            if (direction === 'prev') {
                newMonth -= 1;
                if (newMonth < 0) {
                    newMonth = 11;
                    newYear -= 1;
                }
            } else {
                newMonth += 1;
                if (newMonth > 11) {
                    newMonth = 0;
                    newYear += 1;
                }
            }

            setCurrentMonth(newMonth);
            setCurrentYear(newYear);

            const startOfNewMonth = new Date(newYear, newMonth, 1);
            const endOfNewMonth = new Date(newYear, newMonth + 1, 0);
            setDateRange({
                start: formatDate(startOfNewMonth),
                end: formatDate(endOfNewMonth),
            });
        } else if (selectedPeriod === 'Tuần') {
            const currentStartDate = new Date(currentYear, currentMonth, parseInt(dateRange.start.split('/')[0]));
            if (direction === 'prev') {
                currentStartDate.setDate(currentStartDate.getDate() - 7);
            } else {
                currentStartDate.setDate(currentStartDate.getDate() + 7);
            }

            const endOfWeek = new Date(currentStartDate);
            endOfWeek.setDate(currentStartDate.getDate() + 6);

            setCurrentMonth(currentStartDate.getMonth());
            setCurrentYear(currentStartDate.getFullYear());

            setDateRange({
                start: formatDate(currentStartDate),
                end: formatDate(endOfWeek),
            });
        } else if (selectedPeriod === 'Năm') {
            if (direction === 'prev') {
                newYear -= 1;
            } else {
                newYear += 1;
            }

            setCurrentYear(newYear);

            const startOfYear = new Date(newYear, 0, 1);
            const endOfYear = new Date(newYear, 11, 31);
            setDateRange({
                start: formatDate(startOfYear),
                end: formatDate(endOfYear),
            });
        }
    };

    const renderCategoryItem = ({item}: { item: { category: string; amount: number; percentage: number } }) => (
        <View style={styles.transactionItem}>
            <Text style={styles.transactionDescription}>{item.category}</Text>
            <Text
                style={[
                    styles.transactionAmount,
                    {color: selectedType === 'Chi tiêu' ? '#FF6347' : '#5E3FBE'},
                ]}
            >
                {VNDFormat(selectedType === 'Chi tiêu' ? -item.amount : item.amount)}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Chi tiêu</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#333"/>
                </TouchableOpacity>
            </View>

            <View style={styles.tabWrapper}>
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, selectedPeriod === 'Tuần' && styles.activeTab]}
                        onPress={() => setSelectedPeriod('Tuần')}
                    >
                        <Text style={[styles.tabText, selectedPeriod === 'Tuần' && styles.activeTabText]}>Tuần</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, selectedPeriod === 'Tháng' && styles.activeTab]}
                        onPress={() => setSelectedPeriod('Tháng')}
                    >
                        <Text style={[styles.tabText, selectedPeriod === 'Tháng' && styles.activeTabText]}>Tháng</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, selectedPeriod === 'Năm' && styles.activeTab]}
                        onPress={() => setSelectedPeriod('Năm')}
                    >
                        <Text style={[styles.tabText, selectedPeriod === 'Năm' && styles.activeTabText]}>Năm</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.chartContainer}>
                <View style={styles.dateContainer}>
                    <TouchableOpacity onPress={() => handleDateNavigation('prev')}>
                        <Ionicons name="chevron-back" size={24} color="#007AFF"/>
                    </TouchableOpacity>
                    <Text style={styles.dateText}>{`${dateRange.start} - ${dateRange.end}`}</Text>
                    <TouchableOpacity onPress={() => handleDateNavigation('next')}>
                        <Ionicons name="chevron-forward" size={24} color="#007AFF"/>
                    </TouchableOpacity>
                </View>

                <View style={styles.chartWrapper}>
                    {loading ? (
                        <Text style={{textAlign: 'center', color: '#666'}}>Đang tải dữ liệu...</Text>
                    ) : chartData.length > 0 ? (
                        <View>
                            {chartType === 'pie' ? (
                                <Box
                                    width={300}
                                    height={450}
                                    $dark-bg="$black"
                                    $light-bg="$white"
                                    paddingHorizontal={5}
                                    paddingVertical={10}
                                >
                                    <Box width="100%" $dark-bg="$black" $light-bg="$white" height="80%">
                                        <PolarChart
                                            data={chartData}
                                            colorKey="color"
                                            valueKey="y"
                                            labelKey="x"
                                        >
                                            <Pie.Chart>
                                                {() => {
                                                    return (
                                                        <>
                                                            <Pie.Slice/>
                                                        </>
                                                    );
                                                }}
                                            </Pie.Chart>
                                        </PolarChart>
                                    </Box>
                                    <Box width="100%" $dark-bg="$black" $light-bg="$white" height={100}>
                                        <ScrollView
                                            horizontal={true}
                                            contentContainerStyle={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                paddingTop: 15,
                                                paddingHorizontal: 10,
                                                paddingBottom: 15, // Thêm padding dưới để thanh cuộn không bị che
                                                gap: 10,
                                            }}
                                            style={{
                                                backgroundColor: '#164057', // Màu nền đã thêm trước đó
                                                borderWidth: 1, // Độ dày viền
                                                borderColor: '#FFFFFF', // Màu viền trắng
                                                borderRadius: 10, // Bo góc
                                            }}
                                            scrollIndicatorInsets={{bottom: 100, left: 10, right: 10}}
                                        >
                                            {chartData.map((val, index) => (
                                                <HStack
                                                    key={index}
                                                    alignItems="center"
                                                    gap={10}
                                                    padding={5}
                                                >
                                                    <View style={{height: 10, width: 10, backgroundColor: val.color}}/>
                                                    <Text style={{color: '#FFFFFF'}}>{val.x}</Text>
                                                    <Text style={{color: val.color, fontWeight: 'bold'}}>
                                                        {val.percentage.toFixed(2)}%
                                                    </Text>
                                                </HStack>
                                            ))}
                                        </ScrollView>
                                    </Box>
                                </Box>
                            ) : (
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
                                                            colors={[chartData[index].color, `${chartData[index].color}50`]}
                                                        />
                                                    </Bar>
                                                ));
                                            }}
                                        </CartesianChart>
                                    </Box>
                                </Box>
                            )}
                        </View>
                    ) : (
                        <Text style={{textAlign: 'center', color: '#666'}}>Không có dữ liệu để hiển thị</Text>
                    )}
                </View>

                <View style={styles.chartToggleWrapper}>
                    <View style={styles.chartToggleContainer}>
                        <TouchableOpacity
                            style={[styles.toggleButton, chartType === 'bar' && styles.activeToggleButton]}
                            onPress={() => setChartType('bar')}
                        >
                            <Ionicons name="bar-chart" size={24} color={chartType === 'bar' ? '#34C759' : '#666'}/>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleButton, chartType === 'pie' && styles.activeToggleButton]}
                            onPress={() => setChartType('pie')}
                        >
                            <Ionicons name="pie-chart" size={24} color={chartType === 'pie' ? '#34C759' : '#666'}/>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.summaryWrapper}>
                <View style={styles.summaryContainer}>
                    <TouchableOpacity
                        style={styles.summaryItem}
                        onPress={() => {
                            setSelectedType('Chi tiêu');
                        }}
                    >
                        <Text style={styles.summaryLabel}>Chi tiêu</Text>
                        <Text style={[styles.summaryValue, {color: '#FF6347'}]}>
                            {VNDFormat(totalExpense)}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.summaryItem}
                        onPress={() => {
                            setSelectedType('Thu nhập');
                        }}
                    >
                        <Text style={styles.summaryLabel}>Thu nhập</Text>
                        <Text style={[styles.summaryValue, {color: '#5E3FBE'}]}>
                            {VNDFormat(totalIncome)}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={categoryData}
                renderItem={renderCategoryItem}
                keyExtractor={(item) => item.category}
                contentContainerStyle={styles.transactionList}
                ListEmptyComponent={
                    <Text style={{textAlign: 'center', color: '#666', padding: 16}}>
                        Không có {selectedType.toLowerCase()} trong khoảng thời gian này
                    </Text>
                }
            />
        </View>
    );
};

export default IncomeAndExpenditureChartScreen;