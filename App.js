import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./components/Login";
import DashboardScreen from "./components/DashboardScreen"; 


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        {/* <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
