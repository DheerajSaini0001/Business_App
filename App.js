import React, { useState, useEffect } from "react";
import { 
  StatusBar, 
  View, 
  ActivityIndicator, 
  StyleSheet 
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from '@react-native-async-storage/async-storage';


import { ThemeProvider } from "./Context/ThemeContext";
// --- Aapke Components ---
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import UserSignupScreen from "./components/UserSignup";
import UserLoginScreen from "./components/Login";
import AdminLoginScreen from "./components/AdminLogin";
import UserDetailScreen from "./components/UserDetail";
import NavigationTabsAdmin from "./components/NavigationTabsAdmin";
import UserHomeScreen from "./components/UserHomeScreen"

const Stack = createNativeStackNavigator();

// --- FIX: Saara logic is function ke andar hona chahiye ---
export default function App() {

  // --- FIX: 'isLoading' state ko yahan define karein ---
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('homeScreen'); 

  // --- Login Check useEffect ---
  // Yeh app ke khulte hi sirf ek baar chalega
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
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
        
      } catch (e) {
        console.error("Failed to fetch token from storage", e);
      }
      
      // Checking poori ho gayi, ab loading screen hata dein
      setIsLoading(false);
    };

    checkLoginStatus();
  }, []); // [] ka matlab hai 'run only once'

  // --- Loading Screen ---
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
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
          <Stack.Screen name="homeScreen" component={Home}  />
          <Stack.Screen name="userSignup" component={UserSignupScreen} options={{ headerShown: false }}  />
          <Stack.Screen name="userLogin" component={UserLoginScreen}  />
          <Stack.Screen name="adminLogin" component={AdminLoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Dashboard" component={UserHomeScreen} options={{ headerShown: false }} />
          

          <Stack.Screen name="adminDashboard" component={NavigationTabsAdmin} options={{ headerShown: false }} />
          {/* <Stack.Screen name="adminDashboard" component={AdminDashboardScreen} options={{ headerShown: false }} /> */}
          <Stack.Screen name="userDetail" component={UserDetailScreen} options={{ headerShown: false }} />
          
        </Stack.Navigator>
        
      </NavigationContainer>
      
    </View>
        </ThemeProvider>
    
  );
} // --- FIX: Function yahan band hoga ---

// --- Loading Style ---
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  }
});

