import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from '../Types/types';
import HomeScreen from '../screens/Home/HomeScreen';
import { Ionicons } from '@expo/vector-icons';
import SreachScreen from '../screens/Search/SreachScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ForumScreen from '../screens/Forum/ForumScreen';
import CalendarScreen from '../screens/Calendar/CalendarScreen';
import AnalyticScreeen from '../screens/Analytic/AnalyticScreen';
const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name == 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name == "Forum") {
            iconName = focused ? 'chatbox' : "chatbox-outline";
          } else if (route.name == 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          }
          else if (route.name == 'Analytic') {
            iconName = focused ? 'analytic' : 'analytic-outline';
          }


          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#854836',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Search" component={SreachScreen} />
      <Tab.Screen name="Forum" component={ForumScreen} />
      <Tab.Screen name="Analytic" component={AnalyticScreeen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
