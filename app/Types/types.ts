import { ITransaction } from "../interface/Transaction";

export type RootStackParamList = {
  Tabs: undefined;
  Login: undefined;
  Register: undefined;
  TransactionDetail: { transaction: ITransaction };
  EditTransaction: { transaction: ITransaction };
  CategoryTransactions: { category: string, transactions: ITransaction[] };
};

export type BottomTabParamList = {
  Home: undefined;
  Search: undefined;
  Profile: undefined;
  Calendar: undefined,
  Utility: undefined
};
