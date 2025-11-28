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
import LandingScreen from "./src/screens/LandingScreen";
import UserSignupScreen from "./src/screens/UserSignupScreen";
import UserLoginScreen from "./src/screens/UserLoginScreen";
import AdminLoginScreen from "./src/screens/AdminLoginScreen";
import UserDetailScreen from "./src/screens/UserDetailScreen";
import AdminTabNavigator from "./src/navigation/AdminTabNavigator";
import UserDashboardScreen from "./src/screens/UserDashboardScreen"
import CreateAdminScreen from "./src/screens/CreateAdminScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import VerifyOtpScreen from "./src/screens/VerifyOtpScreen";
import ResetPasswordScreen from "./src/screens/ResetPasswordScreen";

const Stack = createNativeStackNavigator();
const { width, height } = Dimensions.get('window');

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
        // Hide native splash screen immediately so we can show our custom one
        await SplashScreen.hideAsync();
        setIsSplashReady(true);

        // 1. Pehle Admin Token check karein
        const adminToken = await AsyncStorage.getItem('adminToken');

        if (adminToken) {
          // Agar Admin token mila, toh admin dashboard par jao
          setInitialRoute('adminDashboard');
        } else {
          // 2. Agar Admin token nahi mila, toh User token check karein
          const token = await AsyncStorage.getItem('token');

          // Agar token mil gaya, toh app ko seedha 'Dashboard' se shuru karein
          if (token) {
            setInitialRoute('Dashboard');
          }
          // Agar dono nahi mile, toh initialRoute 'homeScreen' hi rahega
        }

        // Simulate a minimum splash time if needed (optional)
        // await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (e) {
        console.error("Failed to fetch token from storage", e);
      } finally {
        // Checking poori ho gayi, ab loading screen hata dein
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []); // [] ka matlab hai 'run only once'

  // --- Loading Screen (Custom Splash) ---
  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar hidden={true} />
        <Image
          source={require('./assets/splash-icon.png')}
          style={styles.splashImage}
          resizeMode="contain"
        />
      </View>
    );
  }

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
            <Stack.Screen name="homeScreen" component={LandingScreen} />
            <Stack.Screen name="userSignup" component={UserSignupScreen} options={{ headerShown: false }} />
            <Stack.Screen name="userLogin" component={UserLoginScreen} />
            <Stack.Screen name="adminLogin" component={AdminLoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Dashboard" component={UserDashboardScreen} options={{ headerShown: false }} />


            <Stack.Screen name="adminDashboard" component={AdminTabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="createAdmin" component={CreateAdminScreen} options={{ headerShown: false }} />
            <Stack.Screen name="userDetail" component={UserDetailScreen} options={{ headerShown: false }} />
            <Stack.Screen name="forgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
            <Stack.Screen name="verifyOtp" component={VerifyOtpScreen} options={{ headerShown: false }} />
            <Stack.Screen name="resetPassword" component={ResetPasswordScreen} options={{ headerShown: false }} />

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
