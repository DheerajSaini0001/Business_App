import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Navbar from "./components/Navbar";
import HomeScreen from "./components/HomeScreen";
import UserSignupScreen from "./components/UserSignup";
import UserLoginScreen from "./components/Login";
import AdminLoginScreen from "./components/AdminLogin";
import UserDashboardScreen from "./components/UserDashboard";
import AdminDashboardScreen from "./components/AdminDashboard";
import UserDetailScreen from "./components/UserDetail";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={({ navigation, route }) => ({
            header: () => <Navbar navigation={navigation} title={route.name} />,
          })}
        >
          <Stack.Screen name="homeScreen" component={HomeScreen} />
          <Stack.Screen name="userSignup" component={UserSignupScreen} />
          <Stack.Screen name="userLogin" component={UserLoginScreen} />
          <Stack.Screen name="adminLogin" component={AdminLoginScreen} />
          <Stack.Screen name="Dashboard" component={UserDashboardScreen} />
          <Stack.Screen name="adminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="userDetail" component={UserDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
});
