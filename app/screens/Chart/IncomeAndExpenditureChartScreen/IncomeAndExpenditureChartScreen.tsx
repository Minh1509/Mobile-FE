// File: IncomeAndExpenditureChartScreen.tsx

import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Dimensions, FlatList} from 'react-native';
import {VictoryChart} from 'victory-chart';
import {VictoryAxis} from 'victory-axis';
import {VictoryBar} from 'victory-bar';
import {VictoryPie} from 'victory-pie';
import {LineSegment} from 'victory-core';
import {VictoryTooltip} from 'victory-tooltip';
import {Ionicons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useTransactions} from '@/app/hooks/useTransactions';
import {ITransaction} from '@/app/interface/Transaction';
import {RootStackParamList} from '@/app/Types/types';
import {VNDKFormat, VNDFormat} from '@/app/utils/MoneyParse';
import styles from './IncomeAndExpenditureChartScreenStyles';

// Định nghĩa kiểu cho navigation
type IncomeAndExpenditureChartNavigationProp = StackNavigationProp<RootStackParamList, 'IncomeAndExpenditureChart'>;

// Hàm để lấy ngày, tháng, năm từ chuỗi ngày
const getDateComponents = (date: string) => {
    const [day, month, year] = date.split('/').map(Number);
    return {day, month, year};
};

// Hàm tạo gradient màu
const generateGradientColors = (startColor: string, endColor: string, steps: number) => {
    // Nếu chỉ có 1 phần tử, trả về startColor
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

    // Hàm định dạng ngày thành DD/MM/YYYY
    const formatDate = (date: Date): string => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // State để theo dõi tháng/năm hiện tại
    const [currentMonth, setCurrentMonth] = useState<number>(currentDate.getMonth());
    const [currentYear, setCurrentYear] = useState<number>(currentDate.getFullYear());

    // Tính ngày đầu tiên và cuối cùng của tháng hiện tại
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

        // Chuyển dateRange.start và dateRange.end thành Date để so sánh
        const {day: startDay, month: startMonth, year: startYear} = getDateComponents(dateRange.start);
        const {day: endDay, month: endMonth, year: endYear} = getDateComponents(dateRange.end);
        const startDate = new Date(startYear, startMonth - 1, startDay);
        const endDate = new Date(endYear, endMonth - 1, endDay);

        // Lọc các giao dịch trong khoảng thời gian của dateRange
        const filteredTransactions: ITransaction[] = transactions.filter((transaction: ITransaction) => {
            const {day, month, year} = getDateComponents(transaction.date);
            const transactionDate = new Date(year, month - 1, day);
            return transactionDate >= startDate && transactionDate <= endDate;
        });

        // Tính tổng thu nhập và chi tiêu
        const income = filteredTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = filteredTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => Math.abs(sum + t.amount), 0);

        setTotalIncome(income);
        setTotalExpense(expense);

        // Tính tổng theo category
        const categoryMap: { [key: string]: number } = {};

        filteredTransactions.forEach((transaction: ITransaction) => {
            const {category, amount} = transaction;
            if (selectedType === 'Chi tiêu' && transaction.type === 'expense') {
                categoryMap[category] = (categoryMap[category] || 0) + Math.abs(amount);
            } else if (selectedType === 'Thu nhập' && transaction.type === 'income') {
                categoryMap[category] = (categoryMap[category] || 0) + amount;
            }
        });

        // Tính tổng để tính phần trăm
        const total = Object.values(categoryMap).reduce((sum, amount) => sum + amount, 0);

        // Chuyển categoryMap thành mảng để hiển thị
        const categoryArray = Object.keys(categoryMap).map((category) => ({
            category,
            amount: categoryMap[category],
            percentage: total > 0 ? (categoryMap[category] / total) * 100 : 0,
        }));

        setCategoryData(categoryArray);

        // Tạo gradient màu
        const colors =
            selectedType === 'Chi tiêu'
                ? generateGradientColors('#5E3FBE', '#FFFFFF', categoryArray.length || 1)
                : generateGradientColors('#174E1F', '#3FBE52', categoryArray.length || 1);

        // Tạo dữ liệu cho VictoryPie
        const pieData = categoryArray.map((item, index) => ({
            x: item.category,
            y: item.amount,
            color: colors[index],
            percentage: item.percentage,
        }));

        setChartData(pieData);
    }, [selectedType, transactions, loading, dateRange]); // Thêm dateRange vào dependencies

    // Lấy chiều rộng màn hình để biểu đồ responsive
    const screenWidth = Dimensions.get('window').width;

    // Hàm xử lý khi nhấn nút điều hướng thời gian (trái/phải)
    const handleDateNavigation = (direction: 'prev' | 'next') => {
        let newMonth = currentMonth;
        let newYear = currentYear;

        if (selectedPeriod === 'Tháng') {
            // Điều hướng theo tháng
            if (direction === 'prev') {
                newMonth -= 1;
                if (newMonth < 0) {
                    newMonth = 11; // Quay lại tháng 12 của năm trước
                    newYear -= 1;
                }
            } else {
                newMonth += 1;
                if (newMonth > 11) {
                    newMonth = 0; // Sang tháng 1 của năm sau
                    newYear += 1;
                }
            }

            // Cập nhật tháng/năm
            setCurrentMonth(newMonth);
            setCurrentYear(newYear);

            // Tính ngày đầu và cuối của tháng mới
            const startOfNewMonth = new Date(newYear, newMonth, 1);
            const endOfNewMonth = new Date(newYear, newMonth + 1, 0);
            setDateRange({
                start: formatDate(startOfNewMonth),
                end: formatDate(endOfNewMonth),
            });
        } else if (selectedPeriod === 'Tuần') {
            // Điều hướng theo tuần
            const currentStartDate = new Date(currentYear, currentMonth, parseInt(dateRange.start.split('/')[0]));
            if (direction === 'prev') {
                currentStartDate.setDate(currentStartDate.getDate() - 7); // Giảm 7 ngày
            } else {
                currentStartDate.setDate(currentStartDate.getDate() + 7); // Tăng 7 ngày
            }

            const endOfWeek = new Date(currentStartDate);
            endOfWeek.setDate(currentStartDate.getDate() + 6); // Cuối tuần (6 ngày sau ngày đầu)

            // Cập nhật tháng/năm dựa trên ngày đầu tuần
            setCurrentMonth(currentStartDate.getMonth());
            setCurrentYear(currentStartDate.getFullYear());

            setDateRange({
                start: formatDate(currentStartDate),
                end: formatDate(endOfWeek),
            });
        } else if (selectedPeriod === 'Năm') {
            // Điều hướng theo năm
            if (direction === 'prev') {
                newYear -= 1;
            } else {
                newYear += 1;
            }

            // Cập nhật năm
            setCurrentYear(newYear);

            // Tính ngày đầu và cuối của năm mới
            const startOfYear = new Date(newYear, 0, 1); // 01/01
            const endOfYear = new Date(newYear, 11, 31); // 31/12
            setDateRange({
                start: formatDate(startOfYear),
                end: formatDate(endOfYear),
            });
        }
    };

    // Hàm render từng category trong danh sách
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
            {/* Tiêu đề và nút quay lại */}
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Chi tiêu</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#333"/>
                </TouchableOpacity>
            </View>

            {/* Thanh điều hướng thời gian */}
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

            {/* Biểu đồ và các thành phần liên quan */}
            <View style={styles.chartContainer}>
                {/* Khoảng thời gian và nút điều hướng */}
                <View style={styles.dateContainer}>
                    <TouchableOpacity onPress={() => handleDateNavigation('prev')}>
                        <Ionicons name="chevron-back" size={24} color="#007AFF"/>
                    </TouchableOpacity>
                    <Text style={styles.dateText}>{`${dateRange.start} - ${dateRange.end}`}</Text>
                    <TouchableOpacity onPress={() => handleDateNavigation('next')}>
                        <Ionicons name="chevron-forward" size={24} color="#007AFF"/>
                    </TouchableOpacity>
                </View>

                {/* Biểu đồ */}
                <View style={styles.chartWrapper}>
                    {loading ? (
                        <Text style={{textAlign: 'center', color: '#666'}}>Đang tải dữ liệu...</Text>
                    ) : chartData.length > 0 ? (
                        <View>
                            {chartType === 'pie' ? (
                                <VictoryPie
                                    data={chartData}
                                    colorScale={chartData.map((item) => item.color)}
                                    labels={({datum}) => [
                                        datum.x,
                                        `${datum.percentage.toFixed(1)}%`,
                                        VNDFormat(datum.y),
                                    ]}
                                    cornerRadius={15}
                                    labelIndicator={
                                        <LineSegment
                                            style={{
                                                stroke: 'black',
                                                strokeDasharray: 1,
                                                fill: 'none',
                                            }}
                                        />
                                    }
                                    padAngle={() => 1}
                                    labelIndicatorInnerOffset={50}
                                    labelIndicatorOuterOffset={1}
                                    labelComponent={
                                        <VictoryTooltip
                                            cornerRadius={10}
                                            flyoutStyle={{
                                                fill: '#3e848f',
                                                fillOpacity: 0.5,
                                                stroke: 'none',
                                            }}
                                            style={{
                                                fontSize: 13,
                                                fill: '#FFFFFF',
                                                fontWeight: 'bold',
                                            }}
                                            flyoutPadding={10}
                                        />
                                    }
                                />
                            ) : (
                                <VictoryChart
                                    domainPadding={{x: 50}}
                                    padding={{left: 100, top: 50, right: 50, bottom: 75}}
                                    width={screenWidth - 200}
                                    height={300}
                                >
                                    <VictoryAxis
                                        tickFormat={(t) => t}
                                        style={{
                                            axis: {stroke: '#FFFFFF'},
                                            tickLabels: {
                                                fontSize: 12,
                                                fill: '#FFFFFF',
                                                angle: 45,
                                                textAnchor: 'start',
                                            },
                                            grid: {stroke: 'none'},
                                        }}
                                    />
                                    <VictoryAxis
                                        dependentAxis
                                        tickFormat={(t: number) => VNDKFormat(t)}
                                        style={{
                                            axis: {stroke: '#FFFFFF'},
                                            tickLabels: {
                                                fontSize: 12,
                                                fill: '#FFFFFF',
                                            },
                                            grid: {stroke: '#FFFFFF', strokeDasharray: '2,2'},
                                        }}
                                    />
                                    <VictoryBar
                                        data={chartData}
                                        x="x"
                                        y="y"
                                        barWidth={50}
                                        cornerRadius={{top: 5}}
                                        style={{
                                            data: {
                                                fill: ({datum}) => datum.color,
                                            },
                                            labels: {
                                                fontSize: 13,
                                                fill: '#FFFFFF',
                                                fontWeight: 'bold',
                                            },
                                        }}
                                        labels={({datum}) => [VNDFormat(datum.y)]}
                                        labelComponent={
                                            <VictoryTooltip
                                                cornerRadius={10}
                                                flyoutStyle={{
                                                    fill: '#3e848f',
                                                    fillOpacity: 0.5,
                                                    stroke: 'none',
                                                }}
                                                style={{
                                                    fontSize: 13,
                                                    fill: '#FFFFFF',
                                                    fontWeight: 'bold',
                                                }}
                                                flyoutPadding={10}
                                                dy={({index}) => (index === 0 ? -10 : 20)}
                                            />
                                        }
                                    />
                                </VictoryChart>
                            )}
                        </View>
                    ) : (
                        <Text style={{textAlign: 'center', color: '#666'}}>Không có dữ liệu để hiển thị</Text>
                    )}
                </View>

                {/* Nút chuyển đổi biểu đồ */}
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

            {/* Thông tin chi tiêu và thu nhập */}
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

            {/* Danh sách category */}
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