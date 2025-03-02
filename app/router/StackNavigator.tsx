import React from "react";
import {
  createStackNavigator,
  StackNavigationProp,
} from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import TabNavigator from "./TabNavigator";
import { RootStackParamList } from "../Types/types";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
const Stack = createStackNavigator<RootStackParamList>();

export type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Login"
>;
export type LoginScreenRouteProp = RouteProp<RootStackParamList, "Login">;

export type RegisterScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Register"
>;
export type RegisterScreenRouteProp = RouteProp<RootStackParamList, "Register">;

export default function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Tabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}}/>
      <Stack.Screen name="Register" component={RegisterScreen} options={{headerShown: false}} />
    </Stack.Navigator>
  );
}
