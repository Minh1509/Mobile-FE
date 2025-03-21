import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/Home/HomeScreen";
import CalendarScreen from "../screens/Calendar/CalendarScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import AnalyticScreen from "../screens/Analytic/AnalyticScreen";
import SearchScreen from "../screens/Search/SreachScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {

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
            } else if (route.name == "Calendar") {
              iconName = focused ? "calendar" : "calendar-outline";
            } else if (route.name == "Utility") {
              iconName = focused ? "apps" : "apps-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#854836",
          tabBarInactiveTintColor: "gray",
          tabBarShowLabel: true,
          tabBarStyle: { height: 60 },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: "Trang chủ", headerShown: false }} />
        <Tab.Screen name="Calendar" component={CalendarScreen} options={{ tabBarLabel: "Lịch", headerShown: false }} />
        <Tab.Screen name="Search" component={SearchScreen} options={{ tabBarLabel: "Tìm kiếm", headerShown: false }} />
        <Tab.Screen name="Utility" component={AnalyticScreen} options={{ tabBarLabel: "Tiện ích", headerShown: false }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: "Tài khoản", headerShown: false }} />
      </Tab.Navigator>


    </>
  );
}
