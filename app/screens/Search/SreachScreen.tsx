import React, { useState, useMemo, useCallback } from 'react';
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
import { useTransactions } from '@/app/hooks/useTransactions';
import { normalizeDate } from '@/app/utils/normalizeDate';

const CATEGORIES = ["Tất cả", "Di chuyển", "Ăn uống", "Mua sắm", "Tiền điện", "Tiền nước", "Học tập", "Giải trí", "Thuê nhà", "Internet", "Lương", "Thưởng", "Đầu tư", "Khác"];
const SORT_OPTIONS = ["Số tiền giảm dần", "Số tiền tăng dần", "Thời gian giảm dần", "Thời gian tăng dần"];

const SearchScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'TransactionDetail'>>();
  const { transactions, loading: isLoading } = useTransactions();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [selectedSort, setSelectedSort] = useState(SORT_OPTIONS[2]);

  const handleSearch = useCallback((query: string) => setSearchQuery(query), []);
  const handleTransactionPress = useCallback((transaction: ITransaction) => {
    navigation.navigate('TransactionDetail', { transaction });
  }, [navigation]);

  const resetFilters = useCallback(() => {
    setSelectedCategory(CATEGORIES[0]);
    setSelectedSort(SORT_OPTIONS[2]);
    setSearchQuery('');
  }, []);

  const filteredTransactions = useMemo(() => {
    if (!transactions.length) return [];

    const queryLower = searchQuery.trim().toLowerCase();

    return transactions
      .filter(({ description = '', category = '', date = '' }) =>
        (!queryLower || [description, category, date].some(field => field.toLowerCase().includes(queryLower))) &&
        (selectedCategory === "Tất cả" || category === selectedCategory)
      )
      .sort((a, b) => {
        const amountA = a.amount;
        const amountB = b.amount;
        const dateA = Date.parse(normalizeDate(a.date));
        const dateB = Date.parse(normalizeDate(b.date));

        return selectedSort === 'Số tiền giảm dần' ? amountB - amountA :
          selectedSort === 'Số tiền tăng dần' ? amountA - amountB :
            selectedSort === 'Thời gian giảm dần' ? dateB - dateA :
              dateA - dateB;
      });
  }, [transactions, searchQuery, selectedCategory, selectedSort]);

  return (
    <SafeAreaView className="mt-2 flex-1 bg-gray-50">
      <View className="px-4 py-3 bg-gray border-b border-gray-200">
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
        <ScrollView
          className="flex-1 bg-gray-50"
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 24, flexGrow: filteredTransactions.length ? undefined : 1 }}
        >
          {filteredTransactions.length ? (
            filteredTransactions.map(transaction => (
              <TransactionItem key={transaction.id} transaction={transaction} onPress={() => handleTransactionPress(transaction)} />
            ))
          ) : (
            <EmptyResults searchQuery={searchQuery} onClearSearch={() => setSearchQuery('')} />
          )}
        </ScrollView>
      )}

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortOptions={SORT_OPTIONS}
        selectedSort={selectedSort}
        setSelectedSort={setSelectedSort}
        onReset={resetFilters}
      />
    </SafeAreaView>
  );
};

export default SearchScreen;