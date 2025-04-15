import React, {useEffect, useState} from 'react';
import {TouchableOpacity, FlatList, Image, Dimensions, useColorScheme, ScrollView} from 'react-native';
import {Box, HStack, Text, View} from "@gluestack-ui/themed";
import {COLORMODES} from "@gluestack-style/react/lib/typescript/types";
import {Pie, PolarChart, CartesianChart, Bar, useChartPressState} from "victory-native";
import {useFont, vec, LinearGradient} from "@shopify/react-native-skia";
import {Ionicons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useTransactions} from '@/app/hooks/useTransactions';
import {ITransaction} from '@/app/interface/Transaction';
import {RootStackParamList} from '@/app/Types/types';
import {VNDFormat, VNDKFormat} from '@/app/utils/MoneyParse';
import {getCategoryIcon} from '@/app/utils/GetCategoryIcon';
import {useDerivedValue} from "react-native-reanimated";
import styles from './CategoryAnalysisChartScreenStyles';

// Định nghĩa kiểu cho navigation
type CategoryAnalysisChartNavigationProp = StackNavigationProp<RootStackParamList, 'CategoryAnalysisChart'>;

// Định nghĩa kiểu cho dữ liệu danh mục
interface CategoryData {
    category: string;
    transactions: ITransaction[];
    totalIncome: number;
    totalExpense: number;
    expanded: boolean;
    selectedType: 'Chi tiêu' | 'Thu nhập';
    chartType: 'Pie' | 'Bar'; // Thêm chartType để theo dõi loại biểu đồ
}

const space_mono = require('@/assets/fonts/SpaceMono-Regular.ttf');

// Hàm tạo gradient màu
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

const CategoryAnalysisChartScreen: React.FC = () => {
    const navigation = useNavigation<CategoryAnalysisChartNavigationProp>();
    const font = useFont(space_mono, 12);
    const toolTipFont = useFont(space_mono, 24);
    const colorMode = useColorScheme() as COLORMODES;
    const {transactions, loading} = useTransactions();
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [totalIncome, setTotalIncome] = useState<number>(0);
    const [totalExpense, setTotalExpense] = useState<number>(0);
    const isDark = colorMode === "dark";
    const {state, isActive} = useChartPressState({
        x: 0,
        y: {listenCount: 0},
    });

    const value = useDerivedValue(() => {
        return "$" + state.y.listenCount.value.value;
    }, [state]);

    const textYPosition = useDerivedValue(() => {
        return state.y.listenCount.position.value - 15;
    }, [value]);

    const textXPosition = useDerivedValue(() => {
        if (!toolTipFont) {
            return 0;
        }
        return (
            state.x.position.value - toolTipFont.measureText(value.value).width / 2
        );
    }, [value, toolTipFont]);

    useEffect(() => {
        if (loading) return;

        // Tính tổng thu nhập và chi tiêu toàn bộ
        const income = transactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = transactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => Math.abs(sum + t.amount), 0);

        setTotalIncome(income);
        setTotalExpense(expense);

        // Nhóm giao dịch theo danh mục
        const categoryMap: { [key: string]: ITransaction[] } = {};

        transactions.forEach((transaction) => {
            const {category} = transaction;
            if (!categoryMap[category]) {
                categoryMap[category] = [];
            }
            categoryMap[category].push(transaction);
        });

        // Tạo dữ liệu danh mục
        const filteredCategoryData: CategoryData[] = Object.keys(categoryMap).map((category) => {
            const categoryTransactions = categoryMap[category];

            const totalIncomeForCategory = categoryTransactions
                .filter((t) => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const totalExpenseForCategory = categoryTransactions
                .filter((t) => t.type === 'expense')
                .reduce((sum, t) => Math.abs(sum + t.amount), 0);

            return {
                category,
                transactions: categoryTransactions,
                totalIncome: totalIncomeForCategory,
                totalExpense: totalExpenseForCategory,
                expanded: false,
                selectedType: 'Chi tiêu' as 'Chi tiêu' | 'Thu nhập',
                chartType: 'Pie' as 'Pie' | 'Bar', // Mặc định là biểu đồ tròn
            };
        });

        setCategoryData(filteredCategoryData);
    }, [transactions, loading]);

    // Hàm toggle trạng thái mở rộng của danh mục
    const toggleExpand = (category: string) => {
        setCategoryData((prevData) =>
            prevData.map((item) =>
                item.category === category ? {...item, expanded: !item.expanded} : item
            )
        );
    };

    // Hàm thay đổi selectedType của một danh mục cụ thể
    const setCategorySelectedType = (category: string, type: 'Chi tiêu' | 'Thu nhập') => {
        setCategoryData((prevData) =>
            prevData.map((item) =>
                item.category === category ? {...item, selectedType: type} : item
            )
        );
    };

    // Hàm thay đổi chartType của một danh mục cụ thể
    const setCategoryChartType = (category: string, chartType: 'Pie' | 'Bar') => {
        setCategoryData((prevData) =>
            prevData.map((item) =>
                item.category === category ? {...item, chartType} : item
            )
        );
    };

    // Hàm tạo dữ liệu biểu đồ cho danh mục
    const getChartDataForCategory = (categoryData: CategoryData) => {
        const filteredTransactions = categoryData.transactions.filter((transaction) =>
            categoryData.selectedType === 'Chi tiêu'
                ? transaction.type === 'expense'
                : transaction.type === 'income'
        );

        const total = categoryData.selectedType === 'Chi tiêu' ? categoryData.totalExpense : categoryData.totalIncome;

        const colors =
            categoryData.selectedType === 'Chi tiêu'
                ? generateGradientColors('#5E3FBE', '#c7b3dc', filteredTransactions.length || 1)
                : generateGradientColors('#174E1F', '#3FBE52', filteredTransactions.length || 1);

        return filteredTransactions.map((item, index) => ({
            x: item.date,
            y: item.amount,
            color: colors[index],
            percentage: total > 0 ? (item.amount / total) * 100 : 0,
        }));
    };

    // Lấy chiều rộng màn hình để biểu đồ responsive
    const screenWidth = Dimensions.get('window').width;

    // Hàm render từng danh mục
    const renderCategoryItem = ({item}: { item: CategoryData }) => {
        const {imageSource} = getCategoryIcon(item.category);
        const chartData = getChartDataForCategory(item);
        console.log("Chart Data count", chartData.length);

        return (
            <View style={styles.categoryItem}>
                <TouchableOpacity
                    style={styles.categoryHeader}
                    onPress={() => toggleExpand(item.category)}
                >
                    <Image source={imageSource} style={styles.transactionIcon}/>
                    <Text style={styles.transactionDescription}>{item.category}</Text>
                    <Ionicons
                        name={item.expanded ? 'chevron-down' : 'chevron-forward'}
                        size={24}
                        color="#007AFF"
                    />
                </TouchableOpacity>

                {item.expanded && (
                    <View style={styles.expandedContent}>
                        {/* Nút chuyển đổi biểu đồ */}
                        <View style={styles.chartToggleContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.chartToggleButton,
                                    item.chartType === 'Pie' && styles.chartToggleButtonActive,
                                ]}
                                onPress={() => setCategoryChartType(item.category, 'Pie')}
                            >
                                <Ionicons
                                    name="pie-chart"
                                    size={24}
                                    color={item.chartType === 'Pie' ? '#007AFF' : '#666'}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.chartToggleButton,
                                    item.chartType === 'Bar' && styles.chartToggleButtonActive,
                                ]}
                                onPress={() => setCategoryChartType(item.category, 'Bar')}
                            >
                                <Ionicons
                                    name="bar-chart"
                                    size={24}
                                    color={item.chartType === 'Bar' ? '#007AFF' : '#666'}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Biểu đồ */}
                        {chartData.length > 0 ? (
                            item.chartType === 'Pie' ? (
                                <Box
                                    width="100%"
                                    height={500}
                                    $dark-bg="$black"
                                    $light-bg="$white"
                                    paddingHorizontal={5}
                                    paddingVertical={30}
                                >
                                    <Box width="100%" $dark-bg="$black" $light-bg="$white" height="80%">
                                        <PolarChart
                                            data={chartData}
                                            colorKey={"color"}
                                            valueKey={"y"}
                                            labelKey={"x"}
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
                                    <Box width="100%" $dark-bg="$black" $light-bg="$white" height="20%">
                                        <ScrollView
                                            horizontal={true}
                                            showsHorizontalScrollIndicator={true} // Hiển thị thanh cuộn ngang
                                            scrollIndicatorInsets={{bottom: 5}} // Điều chỉnh vị trí thanh cuộn
                                            style={{
                                                backgroundColor: '#e5e0e8', // Màu nền giống ScrollView phía trên
                                                borderWidth: 1, // Viền
                                                borderColor: '#FFFFFF', // Màu viền trắng
                                                borderRadius: 10, // Bo góc
                                            }}
                                            contentContainerStyle={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                paddingHorizontal: 10, // Thêm padding hai bên
                                                gap: 10, // Khoảng cách giữa các item
                                            }}
                                        >
                                            {chartData.map((val, index) => (
                                                <HStack
                                                    key={index}
                                                    alignItems="center"
                                                    gap={10}
                                                    padding={5}
                                                >
                                                    <View style={{height: 10, width: 10, backgroundColor: val.color}}/>
                                                    <Text style={{width: 80, color: '#000000'}}>{val.x}</Text>
                                                    <Text style={{width: 80, color: val.color}}>{val.percentage.toFixed(2)}%</Text>
                                                </HStack>
                                            ))}
                                        </ScrollView>
                                    </Box>
                                </Box>
                            ) : (
                                <Box
                                    width="100%"
                                    height={450}
                                    $dark-bg="$black"
                                    $light-bg="$white"
                                    flex={1}
                                    paddingHorizontal={5}
                                    paddingVertical={30}
                                >
                                    <Box width="100%" $dark-bg="$black" $light-bg="$white" height="80%">
                                        <CartesianChart
                                            data={chartData}
                                            xKey="x"
                                            padding={1}
                                            yKeys={["y"]}
                                            domain={{y: [0, Math.max(...chartData.map(item => item.y))]}}
                                            domainPadding={{left: 50, right: 50, top: 30}}
                                            axisOptions={{
                                                font,
                                                tickCount: {x: chartData.length, y: 5},
                                                lineColor: isDark ? "#71717a" : "#d4d4d8",
                                                labelColor: isDark ? "white" : "black",
                                                formatYLabel: (value) => VNDKFormat(value)
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
                                                            topLeft: 10,
                                                            topRight: 10,
                                                        }}
                                                    >
                                                        <LinearGradient
                                                            start={vec(0, 0)}
                                                            end={vec(0, chartBounds.bottom)}
                                                            colors={item.selectedType === 'Chi tiêu' ? ['#5E3FBE', '#5E3FBE50'] : ['#FF6347', '#FF634750']}
                                                        />
                                                    </Bar>
                                                ));
                                            }}
                                        </CartesianChart>
                                    </Box>
                                </Box>
                            )
                        ) : (
                            <Text style={{textAlign: 'center', color: '#666', padding: 16}}>
                                Không có dữ liệu hiển thị phần {item.selectedType} cho danh mục {item.category}
                            </Text>
                        )}

                        {/* Thông tin chi tiêu và thu nhập */}
                        <View style={styles.summaryWrapper}>
                            <View style={styles.summaryContainer}>
                                <TouchableOpacity
                                    style={styles.summaryItem}
                                    onPress={() => setCategorySelectedType(item.category, 'Chi tiêu')}
                                >
                                    <Text style={styles.summaryLabel}>Chi tiêu</Text>
                                    <Text style={[styles.summaryValue, {color: '#FF6347'}]}>
                                        {VNDFormat(-item.totalExpense)}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.summaryItem}
                                    onPress={() => setCategorySelectedType(item.category, 'Thu nhập')}
                                >
                                    <Text style={styles.summaryLabel}>Thu nhập</Text>
                                    <Text style={[styles.summaryValue, {color: '#5E3FBE'}]}>
                                        {VNDFormat(item.totalIncome)}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Tiêu đề và nút quay lại */}
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Thống kê theo danh mục</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#333"/>
                </TouchableOpacity>
            </View>

            {/* Thông tin chi tiêu và thu nhập toàn bộ */}
            <View style={styles.summaryWrapper}>
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Chi tiêu: </Text>
                        <Text style={[styles.summaryValue, {color: '#FF6347'}]}>
                            {VNDFormat(-totalExpense)}
                        </Text>
                    </Text>
                    <Text style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Thu nhập: </Text>
                        <Text style={[styles.summaryValue, {color: '#5E3FBE'}]}>
                            {VNDFormat(totalIncome)}
                        </Text>
                    </Text>
                </View>
            </View>

            {/* Danh sách danh mục */}
            <FlatList
                data={categoryData}
                renderItem={renderCategoryItem}
                keyExtractor={(item) => item.category}
                contentContainerStyle={styles.transactionList}
                ListEmptyComponent={
                    <Text style={{textAlign: 'center', color: '#666', padding: 16}}>
                        Không có dữ liệu trong khoảng thời gian này
                    </Text>
                }
            />
        </View>
    );
};

export default CategoryAnalysisChartScreen;