import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/app/Types/types';
import { ITransaction } from '@/app/interface/Transaction';
import SearchBar from '@/app/Components/SearchBar';
import TransactionItem from '@/app/Components/TransactionItem';
import EmptyResults from '@/app/Components/EmptyResults';
import FilterModal from '@/app/Components/FiltalModal';

const transactions = [
  {
    id: 1,
    date: "2 Tháng 12 Năm 2022",
    amount: "-50.000 VND",
    description: "Di chuyển",
    category: "Di chuyển",
    paymentMethod: "Tiền mặt",
    notes: "Đi xe ôm công nghệ",
    location: "Quận 1, TP.HCM"
  },
  // ... other transactions
];

const categories = ["Tất cả", "Di chuyển", "Ăn uống", "Tiền điện", "Tiền nước"];
const sortOptions = ["Số tiền giảm dần", "Số tiền tăng dần", "Thời gian giảm dần", "Thời gian tăng dần"];

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TransactionDetail'>;

const SearchScreen = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedSort, setSelectedSort] = useState('Thời gian giảm dần');

  // Filter and sort transactions based on search, category, and sort options
  const filteredTransactions = transactions
    .filter(transaction => {
      // Apply search query filter
      if (searchQuery && !transaction.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Apply category filter
      if (selectedCategory !== 'Tất cả' && transaction.category !== selectedCategory) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      const amountA = parseInt(a.amount.replace(/[^\d-]/g, ''));
      const amountB = parseInt(b.amount.replace(/[^\d-]/g, ''));

      switch (selectedSort) {
        case 'Số tiền giảm dần':
          return amountA - amountB; // More negative first (for expenses)
        case 'Số tiền tăng dần':
          return amountB - amountA; // Less negative first
        case 'Thời gian giảm dần':
          return new Date(b.date).getTime() - new Date(a.date).getTime(); // Newer first
        case 'Thời gian tăng dần':
          return new Date(a.date).getTime() - new Date(b.date).getTime(); // Older first
        default:
          return 0;
      }
    });

  const handleTransactionPress = (transaction: ITransaction) => {
    // Navigate to transaction detail screen with the transaction data
    navigation.navigate('TransactionDetail', { transaction });
  };

  const resetFilters = () => {
    setSelectedCategory('Tất cả');
    setSelectedSort('Thời gian giảm dần');
  };

  return (
    <View className='flex-1 bg-gray-100 p-4'>
      {/* Search bar */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onFilterPress={() => setFilterVisible(true)}
      />

      {/* Results */}
      <ScrollView>
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map(transaction => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onPress={handleTransactionPress}
            />
          ))
        ) : (
          <EmptyResults />
        )}
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortOptions={sortOptions}
        selectedSort={selectedSort}
        setSelectedSort={setSelectedSort}
        onReset={resetFilters}
      />
    </View>
  );
};

export default SearchScreen;