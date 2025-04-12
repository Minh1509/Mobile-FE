import { ITransaction } from "../interface/Transaction";

export type RootStackParamList = {
  Tabs: undefined;
  Login: undefined;
  Register: undefined;
  Search: undefined;
  Utility: undefined; // Thêm Utility
  TransactionDetail: { transaction: ITransaction; origin?: 'Home' | 'Search' | 'Calendar'};
  EditTransaction: { transaction: ITransaction; origin?: 'Home' | 'Search' | 'Calendar' };
  CategoryTransactions: {
    category: string, month: number;
    year: number;
    selectedDate?: any;
    origin?: 'Calendar' | 'Home';
  };
  IncomeAndExpenditureChart: undefined;
  CategoryAnalysisChart: undefined;
  TrendChart: undefined;
  IncomeAndExpenditureComparisonChart: undefined;
  AddExpense: undefined;
  AddIncome: undefined;
  AddBudget: undefined;
  Profile: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Search: undefined;
  Profile: undefined;
  Calendar: undefined,
  Utility: undefined
};
