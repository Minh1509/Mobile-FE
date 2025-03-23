import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/app/Types/types';
import { ITransaction } from '@/app/interface/Transaction';
import SearchBar from '@/app/Components/SearchBar';
import TransactionItem from '@/app/Components/TransactionItem';
import EmptyResults from '@/app/Components/EmptyResults';
import FilterModal from '@/app/Components/FiltalModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { mockTransactions } from '@/app/utils/MockTransactions';
import { HeaderSearch } from '@/app/Components/Header';

const CATEGORIES = ["Tất cả", "Di chuyển", "Ăn uống", "Tiền điện", "Tiền nước"];
const SORT_OPTIONS = ["Số tiền giảm dần", "Số tiền tăng dần", "Thời gian giảm dần", "Thời gian tăng dần"];

const SearchScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'TransactionDetail'>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [selectedSort, setSelectedSort] = useState(SORT_OPTIONS[2]);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<ITransaction[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTransactions(mockTransactions);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);
  }, []);

  const handleTransactionPress = useCallback((transaction: ITransaction) => {
    navigation.navigate('TransactionDetail', { transaction });
  }, [navigation]);

  const resetFilters = useCallback(() => {
    setSelectedCategory(CATEGORIES[0]);
    setSelectedSort(SORT_OPTIONS[2]);
    setSearchQuery('');
  }, []);

  const filteredTransactions = useMemo(() => {
    const queryLower = searchQuery.trim().toLowerCase();
    const parseAmount = (amount: string) => parseInt(amount.replace(/[^\d-]/g, '')) || 0;
    const parseDate = (dateStr: string) => {
      const parts = dateStr.split(' ');
      return parts.length >= 4 ? new Date(parseInt(parts[4]), parseInt(parts[2]) - 1, parseInt(parts[0])).getTime() : 0;
    };

    return transactions
      .filter(({ description, category, paymentMethod, notes, location, amount, date }) =>
        (!queryLower || [description, category, paymentMethod, notes, location, amount, date]
          .some(field => field.toLowerCase().includes(queryLower))) &&
        (selectedCategory === "Tất cả" || category === selectedCategory)
      )
      .sort((a, b) => {
        const amountA = parseAmount(a.amount);
        const amountB = parseAmount(b.amount);
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);

        switch (selectedSort) {
          case 'Số tiền giảm dần': return amountB - amountA;
          case 'Số tiền tăng dần': return amountA - amountB;
          case 'Thời gian giảm dần': return dateB - dateA;
          case 'Thời gian tăng dần': return dateA - dateB;
          default: return 0;
        }
      });
  }, [transactions, searchQuery, selectedCategory, selectedSort]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <HeaderSearch onBack={navigation.goBack} title="Tìm kiếm giao dịch" />

      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <SearchBar searchQuery={searchQuery} setSearchQuery={handleSearch} onFilterPress={() => setFilterVisible(true)} />
      </View>

      <View className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <Text className="text-sm font-medium text-gray-600">
          {isLoading ? 'Đang tìm kiếm...' : `${filteredTransactions.length} kết quả`}
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center bg-gray-50">
          <ActivityIndicator size="large" color="#22c55e" />
          <Text className="text-gray-500 mt-3">Đang tìm kiếm...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 24, flexGrow: filteredTransactions.length === 0 ? 1 : undefined }}>
          {filteredTransactions.length > 0 ? filteredTransactions.map(transaction => (
            <TransactionItem key={transaction.id} transaction={transaction} onPress={() => handleTransactionPress(transaction)} />
          )) : <EmptyResults searchQuery={searchQuery} onClearSearch={() => setSearchQuery('')} />}
        </ScrollView>
      )}

      <FilterModal visible={filterVisible} onClose={() => setFilterVisible(false)} categories={CATEGORIES} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} sortOptions={SORT_OPTIONS} selectedSort={selectedSort} setSelectedSort={setSelectedSort} onReset={resetFilters} />
    </SafeAreaView>
  );
};

export default SearchScreen;