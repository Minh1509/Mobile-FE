import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/Home/HomeScreen";
import CalendarScreen from "../screens/Calendar/CalendarScreen";
import SreachScreen from "../screens/Search/SreachScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import ForumScreen from "../screens/Forum/ForumScreen";
import AnalyticScreen from "../screens/Analytic/AnalyticScreen";
import { useNavigation, StackActions } from "@react-navigation/native";
import ExpenseScreen from "../screens/Expense/ExpenseScreen";
import IncomeScreen from "../screens/Income/IncomeScreen";
import BudgetScreen from "../screens/Budget/BudgetScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  const handleAddBudget = () => {
    setModalVisible(false);
    // Điều hướng đến màn hình thêm ngân sách
    navigation.dispatch(StackActions.push('AddBudget')); // Thay 'AddBudget' bằng tên route thực tế
  };

  const handleAddExpense = () => {
    setModalVisible(false);
    // Điều hướng đến màn hình thêm chi tiêu
    navigation.dispatch(StackActions.push('AddExpense')); // Thay 'AddExpense' bằng tên route thực tế
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any;

            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Search") {
              iconName = focused ? "search" : "search-outline";
            } else if (route.name == "Profile") {
              iconName = focused ? "person" : "person-outline";
            } else if (route.name == "Forum") {
              iconName = focused ? "chatbox" : "chatbox-outline";
            } else if (route.name == "Calendar") {
              iconName = focused ? "calendar" : "calendar-outline";
            } else if (route.name == "Analytic") {
              iconName = focused ? "bar-chart" : "bar-chart-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#854836",
          tabBarInactiveTintColor: "gray",
          tabBarShowLabel: true,
          tabBarStyle: { height: 60 },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Calendar" component={CalendarScreen} />
        {/* <Tab.Screen
          name="Add"
          component={() => null}
          options={{
            tabBarIcon: () => (
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center"
                style={{ position: "absolute", top: -30 }}
              >
                <Ionicons name="add" size={30} color="white" />
              </TouchableOpacity>
            ),
            tabBarLabel: () => null,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setModalVisible(true);
            },
          }}
        /> */}
        <Tab.Screen name="AddExpense" component={ExpenseScreen} />
        <Tab.Screen name="Analytic" component={AnalyticScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>

    </>
  );
}
