import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UserLoginScreen from "./components/Login";
import AdminLoginScreen from "./components/AdminLogin";
import DashboardScreen from "./components/DashboardScreen";
import Navbar from "./components/Navbar";
import HomeScreen from "./components/HomeScreen";
import UserSignupScreen from "./components/UserSignup";


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={({ navigation, route }) => ({
          header: () => <Navbar navigation={navigation} title={route.name} />
        })}
      >
        <Stack.Screen name="homeScreen" component={HomeScreen} />
        <Stack.Screen name="userSignup" component={UserSignupScreen} />
        <Stack.Screen name="userLogin" component={UserLoginScreen} />
        <Stack.Screen name="adminLogin" component={AdminLoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
