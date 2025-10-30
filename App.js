import React from "react";
import { StatusBar,View } from "react-native"; // <-- Import StatusBar
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
    
    <View style={{ flex: 1, paddingTop: StatusBar.currentHeight }}>

      <StatusBar 
        barStyle="dark-content"
      />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={({ navigation, route }) => ({
            header: () => <Navbar navigation={navigation} title={route.name} />,
            headerTransparent: true, 
          })}
        >
          <Stack.Screen name="homeScreen" component={HomeScreen}  />
          <Stack.Screen name="userSignup" component={UserSignupScreen} options={{ headerShown: false }} />
          <Stack.Screen name="userLogin" component={UserLoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="adminLogin" component={AdminLoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Dashboard" component={UserDashboardScreen} options={{ headerShown: false }} />
          <Stack.Screen name="adminDashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
          <Stack.Screen name="userDetail" component={UserDetailScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
   
      </View>
  );
}