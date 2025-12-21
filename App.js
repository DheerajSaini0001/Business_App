import React, { useState, useEffect, useCallback } from "react";
import {
  StatusBar,
  View,
  StyleSheet,
  Image,
  Text,
  Dimensions
} from "react-native";
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from '@react-native-async-storage/async-storage';


import { ThemeProvider } from "./src/context/ThemeContext";
// --- Aapke Components ---
import Navbar from "./src/components/Navbar";
import UserSignupScreen from "./src/screens/UserSignupScreen";
import LoginScreen from "./src/screens/LoginScreen";
import UserDetailScreen from "./src/screens/UserDetailScreen";
import AdminTabNavigator from "./src/navigation/AdminTabNavigator";
import UserDashboardScreen from "./src/screens/UserDashboardScreen"
import CreateAdminScreen from "./src/screens/CreateAdminScreen";

import ChangePasswordScreen from "./src/screens/ChangePasswordScreen";

const Stack = createNativeStackNavigator();
const { width, height } = Dimensions.get('window');

// ... existing imports ...

// ... existing imports ...

// --- FIX: Saara logic is function ke andar hona chahiye ---
export default function App() {

  // --- FIX: 'isLoading' state ko yahan define karein ---
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('homeScreen');
  const [isSplashReady, setIsSplashReady] = useState(false);

  // --- Login Check useEffect ---
  // Yeh app ke khulte hi sirf ek baar chalega
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Keep native splash visible while we load data

        // Optional: Minimum delay to show splash (if data loads too fast)
        // const minimumDelayPromise = new Promise(resolve => setTimeout(resolve, 2000)); 

        // 1. Pehle Admin Token check karein
        const adminToken = await AsyncStorage.getItem('adminToken');

        if (adminToken) {
          // Agar Admin token mila, toh admin dashboard par jao
          setInitialRoute('adminDashboard');
        } else {
          // 2. Agar Admin token nahi mila, toh User token check karein
          const token = await AsyncStorage.getItem('userToken');

          // Agar token mil gaya, toh app ko seedha 'Dashboard' se shuru karein
          if (token) {
            setInitialRoute('Dashboard');
          }
          // Agar dono nahi mile, toh initialRoute 'homeScreen' hi rahega
        }

        // await minimumDelayPromise; // Wait if you want forced delay

      } catch (e) {
        console.error("Failed to fetch token from storage", e);
      } finally {
        // Data loaded. Now hide the native splash screen.
        setIsLoading(false);
        await SplashScreen.hideAsync();
      }
    };

    checkLoginStatus();
  }, []); // [] ka matlab hai 'run only once'

  // --- Main App Navigator (No 'if loading' return) ---

  // --- Main App Navigator ---
  return (
    <ThemeProvider>
      <View style={{ flex: 1, paddingTop: StatusBar.currentHeight }}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <NavigationContainer>
          <Stack.Navigator
            // Yahan initial route state se control ho raha hai
            initialRouteName={initialRoute}
            screenOptions={({ navigation, route }) => ({
              header: () => <Navbar navigation={navigation} title={route.name} />,
              headerTransparent: true,
              // ✅ Custom footer like header

            })}
          >
            {/* Aapki saari screens */}
            <Stack.Screen name="homeScreen" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="userSignup" component={UserSignupScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Dashboard" component={UserDashboardScreen} options={{ headerShown: false }} />


            <Stack.Screen name="adminDashboard" component={AdminTabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="createAdmin" component={CreateAdminScreen} options={{ headerShown: false }} />
            <Stack.Screen name="userDetail" component={UserDetailScreen} options={{ headerShown: false }} />

            <Stack.Screen name="changePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />

          </Stack.Navigator>

        </NavigationContainer>

      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  splashImage: {
    width: '80%',
    height: '80%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  }
});
