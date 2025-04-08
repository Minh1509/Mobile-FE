import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/app/Types/types';
import { useTransactions } from '@/app/hooks/useTransactions';
import { ITransaction, TransactionType } from '@/app/interface/Transaction';
import { VNDFormat } from '@/app/utils/MoneyParse';
import { getCategoryIcon } from '@/app/utils/GetCategoryIcon';
import { getBudgets, getExpenses } from '@/app/services/budget.service';
import { useUserAuth } from '@/app/hooks/userAuth';
import * as Notifications from 'expo-notifications';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface CategorySummary {
  category: string;
  totalAmount: number;
  imageSource: any;
  type: TransactionType;
}

interface Budget {
  category: string;
  amountLimit: number;
  startDate: string;
  endDate: string;
}

interface Warning {
  message: string;
  level: 'yellow' | 'red';
}

const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
};

// Cấu hình thông báo
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Hàm gửi thông báo cục bộ
async function scheduleNotification(warning: Warning) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: warning.level === 'red' ? 'Cảnh báo ngân sách nghiêm trọng' : 'Cảnh báo ngân sách',
      body: warning.message,
      sound: 'default',
      priority: 'high', // Đảm bảo hiển thị trên Android
    },
    trigger: null, // null để gửi ngay lập tức
  });
}

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { transactions, loading } = useTransactions();
  const { userId } = useUserAuth();

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [categorySummaries, setCategorySummaries] = useState<CategorySummary[]>([]);
  const [balance, setBalance] = useState({ start: 0, end: 0, difference: 0 });
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [prevWarnings, setPrevWarnings] = useState<Warning[]>([]);

  useEffect(() => {
    // Yêu cầu quyền khi component mount
    const setupNotifications = async () => {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('budget-warnings', {
          name: 'Budget Warnings',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    };
    setupNotifications();

    if (loading || !transactions.length || !userId) return;

    const filteredTransactions = transactions.filter(({ date }) => {
      const [day, month, year] = date.split('/').map(Number);
      return month === currentMonth && year === currentYear;
    });

    const startBalance = 20_000_000;
    const totalIncome = filteredTransactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
    const endBalance = startBalance + totalIncome - totalExpense;

    setBalance({
      start: startBalance,
      end: endBalance,
      difference: totalIncome - totalExpense,
    });

    const categoryMap: { [key: string]: { amount: number, type: TransactionType } } = {};
    filteredTransactions.forEach(({ category, amount, type }) => {
      if (!categoryMap[category]) {
        categoryMap[category] = { amount: 0, type };
      }
      if (type === TransactionType.INCOME) {
        categoryMap[category].amount += amount;
      } else {
        categoryMap[category].amount -= amount;
      }
    });

    const summaries: CategorySummary[] = Object.keys(categoryMap).map(category => ({
      category,
      totalAmount: categoryMap[category].amount,
      imageSource: getCategoryIcon(category).imageSource,
      type: categoryMap[category].type,
    }));
    setCategorySummaries(summaries);

    const checkBudgetWarnings = async () => {
      const budgets = await getBudgets(userId);
      const expenses = await getExpenses(userId);
      const newWarnings: Warning[] = [];

      const currentBudgets = budgets.filter(budget => {
        const budgetStart = parseDate(budget.startDate);
        const budgetEnd = parseDate(budget.endDate);
        budgetEnd.setHours(23, 59, 59, 999);

        const startMonth = budgetStart.getMonth() + 1;
        const startYear = budgetStart.getFullYear();
        const endMonth = budgetEnd.getMonth() + 1;
        const endYear = budgetEnd.getFullYear();

        return (
          (startYear < currentYear || (startYear === currentYear && startMonth <= currentMonth)) &&
          (endYear > currentYear || (endYear === currentYear && endMonth >= currentMonth))
        );
      });

      const totalBudget = currentBudgets.find(b => b.category === "Tổng");
      if (totalBudget) {
        const budgetStart = parseDate(totalBudget.startDate);
        const budgetEnd = parseDate(totalBudget.endDate);
        budgetEnd.setHours(23, 59, 59, 999);

        const totalSpent = expenses
          .filter(e => {
            const expenseDate = parseDate(e.date);
            return expenseDate >= budgetStart && expenseDate <= budgetEnd;
          })
          .reduce((sum, e) => sum + e.amount, 0);

        if (totalSpent > totalBudget.amountLimit) {
          newWarnings.push({
            message: `"Tổng" đã vượt 100% ngân sách (${VNDFormat(totalSpent)}/${VNDFormat(totalBudget.amountLimit)}) từ ${totalBudget.startDate} đến ${totalBudget.endDate}`,
            level: 'red',
          });
        } else if (totalSpent > totalBudget.amountLimit * 0.9) {
          newWarnings.push({
            message: `"Tổng" đã vượt 90% ngân sách (${VNDFormat(totalSpent)}/${VNDFormat(totalBudget.amountLimit)}) từ ${totalBudget.startDate} đến ${totalBudget.endDate}`,
            level: 'yellow',
          });
        }
      }

      currentBudgets
        .filter(b => b.category !== "Tổng")
        .forEach(budget => {
          const budgetStart = parseDate(budget.startDate);
          const budgetEnd = parseDate(budget.endDate);
          budgetEnd.setHours(23, 59, 59, 999);

          const totalSpent = expenses
            .filter(e => {
              const expenseDate = parseDate(e.date);
              return (
                e.category === budget.category &&
                expenseDate >= budgetStart &&
                expenseDate <= budgetEnd
              );
            })
            .reduce((sum, e) => sum + e.amount, 0);

          if (totalSpent > budget.amountLimit) {
            newWarnings.push({
              message: `"${budget.category}" đã vượt 100% ngân sách (${VNDFormat(totalSpent)}/${VNDFormat(budget.amountLimit)}) từ ${budget.startDate} đến ${budget.endDate}`,
              level: 'red',
            });
          } else if (totalSpent > budget.amountLimit * 0.9) {
            newWarnings.push({
              message: `"${budget.category}" đã vượt 90% ngân sách (${VNDFormat(totalSpent)}/${VNDFormat(budget.amountLimit)}) từ ${budget.startDate} đến ${budget.endDate}`,
              level: 'yellow',
            });
          }
        });
        const newUniqueWarnings = newWarnings.filter(
          nw => !prevWarnings.some(pw => pw.message === nw.message)
        );
      
      // Gửi thông báo cho từng cảnh báo mới
      if (newUniqueWarnings.length > 0) {
        newUniqueWarnings.forEach(warning => scheduleNotification(warning));
      }

      setWarnings(newWarnings);
      setPrevWarnings(newWarnings);
    };

    checkBudgetWarnings();
  }, [transactions, loading, currentMonth, currentYear, userId]);

  const handleMonthChange = (change: number) => {
    let newMonth = currentMonth + change;
    let newYear = currentYear;

    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tab} onPress={() => handleMonthChange(-1)}>
          <Text style={styles.tabText}>Tháng trước</Text>
        </TouchableOpacity>
        <Text style={[styles.tab, styles.activeTab]}>
          {`Tháng ${currentMonth}/${currentYear}`}
        </Text>
        <TouchableOpacity style={styles.tab} onPress={() => handleMonthChange(1)}>
          <Text style={styles.tabText}>Tháng sau</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.balanceContainer}>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Số dư đầu</Text>
          <Text style={styles.balanceValue}>{VNDFormat(balance.start)}</Text>
        </View>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Số dư cuối</Text>
          <Text style={styles.balanceValue}>{VNDFormat(balance.end)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}></Text>
          <Text style={[styles.balanceDifference, { color: balance.difference >= 0 ? '#00C4B4' : '#FF6347' }]}>
            {balance.difference >= 0 ? '+' : '-'} {VNDFormat(Math.abs(balance.difference))}
          </Text>
        </View>
      </View>
      {warnings.length > 0 && warnings.map((warning, index) => (
        <View
          key={index}
          style={[
            styles.warningContainer,
            { backgroundColor: warning.level === 'yellow' ? '#FFF3E0' : '#FFF3F3' },
          ]}
        >
          <Ionicons
            name="warning"
            size={24}
            color={warning.level === 'yellow' ? '#FFA500' : '#FF6347'}
            style={styles.warningIcon}
          />
          <View style={styles.warningTextContainer}>
            <Text
              style={[
                styles.warningText,
                { color: warning.level === 'yellow' ? '#FFA500' : '#FF6347' },
              ]}
            >
              {warning.message}
            </Text>
          </View>
        </View>
      ))}
      <Text style={styles.sectionHeader}>Danh sách chi tiêu hàng tháng</Text>
      <FlatList
        data={categorySummaries}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.expenseItemContainer}
            onPress={() => navigation.navigate('CategoryTransactions', {
              category: item.category,
              month: currentMonth,
              year: currentYear,
            })}
          >
            <View style={styles.iconContainer}>
              <Image source={item.imageSource} style={styles.categoryImage} />
            </View>
            <Text style={styles.expenseCategory}>{item.category}</Text>
            <Text style={[styles.expenseAmount, { color: item.type === TransactionType.INCOME ? '#00C4B4' : '#FF6347' }]}>
              {item.type === TransactionType.INCOME ? '+' : '-'} {VNDFormat(Math.abs(item.totalAmount))}
            </Text>
            <Ionicons name="chevron-forward" size={24} color="#000" />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.category}
        contentContainerStyle={styles.expenseList}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

// Hàm yêu cầu quyền thông báo
async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('Bạn cần cấp quyền để nhận thông báo!');
    return false;
  }
  return true;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  tab: { paddingVertical: 8, paddingHorizontal: 16 },
  activeTab: { fontWeight: 'bold', fontSize: 18, color: '#00C4B4' },
  tabText: { fontSize: 16, color: '#666' },
  balanceContainer: { backgroundColor: '#FFF', padding: 16, margin: 16, borderRadius: 8 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  balanceLabel: { fontSize: 16, color: '#333' },
  balanceValue: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 8 },
  balanceDifference: { fontSize: 18, fontWeight: 'bold' },
  warningContainer: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  warningIcon: { marginRight: 12 },
  warningTextContainer: { flex: 1 },
  warningText: { fontSize: 14, marginBottom: 4 },
  sectionHeader: { fontSize: 20, fontWeight: 'bold', marginVertical: 16, marginHorizontal: 16, color: '#333' },
  expenseList: { paddingHorizontal: 16, paddingBottom: 16 },
  expenseItemContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, marginBottom: 10, borderRadius: 8 },
  iconContainer: { marginRight: 16 },
  categoryImage: { width: 24, height: 24 },
  expenseCategory: { flex: 1, fontSize: 16, color: '#333' },
  expenseAmount: { fontSize: 16, fontWeight: 'bold', marginRight: 16 },
});

export default HomeScreen;