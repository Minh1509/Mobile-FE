import { ITransaction } from "../interface/Transaction";

export type RootStackParamList = {
  Tabs: undefined;
  Login: undefined;
  Register: undefined;
  TransactionDetail: { transaction: ITransaction };
};

export type BottomTabParamList = {
  Home: undefined;
  Search: undefined;
  Profile: undefined;
  Forum: undefined;
  Calendar: undefined,
  Analytic: undefined
};
