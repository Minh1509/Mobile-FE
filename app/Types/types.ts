import { ITransaction } from "../interface/Transaction";

export type RootStackParamList = {
  Tabs: undefined;
  Login: undefined;
  Register: undefined;
  TransactionDetail: { transaction: ITransaction };
  EditTransaction: { transaction: ITransaction };
  CategoryTransactions: {
    category: string, month: number;
    year: number;
  };
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
