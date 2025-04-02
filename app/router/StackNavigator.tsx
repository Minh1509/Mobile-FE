import React from "react";
import {
  createStackNavigator,
  StackNavigationProp,
} from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import TabNavigator from "./TabNavigator";
import { RootStackParamList } from "../Types/types";
import LoginScreen from "../screens/Auth/LoginScreen/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen/RegisterScreen";
import TransactionDetailScreen from "../screens/TransactionScreen/TransactionDetailScreen";
import EditTransactionScreen from "../screens/TransactionScreen/EditTransactionScreen";
import CategoryTransactionsScreen from "../screens/TransactionScreen/CategoryTransactionScreen";
import IncomeAndExpenditureChartScreen from '../screens/Chart/IncomeAndExpenditureChartScreen/IncomeAndExpenditureChartScreen';
import ExpenseScreen from "../screens/Expense/ExpenseScreen";
import IncomeScreen from "../screens/Income/IncomeScreen";
import BudgetScreen from "../screens/Budget/BudgetScreen";
import UtilityScreen from "../screens/UtilityScreen/UtilityScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";

const Stack = createStackNavigator<RootStackParamList>();

export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
export type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;
export type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;
export type RegisterScreenRouteProp = RouteProp<RootStackParamList, 'Register'>;

export default function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Tabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditTransaction" component={EditTransactionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CategoryTransactions" component={CategoryTransactionsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddExpense" component={ExpenseScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddIncome" component={IncomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddBudget" component={BudgetScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="IncomeAndExpenditureChart" component={IncomeAndExpenditureChartScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false}}/>
    </Stack.Navigator>

  );
}
