import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from "../Context/ThemeContext"; // ✅ Import ThemeContext

// 👇 Import your screens
import AdminDashboardScreen from "./AdminDashboard";
import AdminHomeScreen from "./AdminHome";
import AdminProfileScreen from "./AdminProfile";
// import UserHomeScreen from "./UserHomeScreen";

const Tab = createBottomTabNavigator();

export default function NavigationTabsAdmin() {
  const { theme, isDarkMode } = useTheme(); // ✅ Access theme values

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = "home-outline";
          else if (route.name === "Dashboard") iconName = "grid-outline";
          else if (route.name === "Profile") iconName = "person-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        // ✅ Apply theme dynamically
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.subText,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopWidth: 0.5,
          borderTopColor: isDarkMode ? "#333" : "#ccc",
          height: 65,
          paddingBottom: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          color: theme.text,
        },
      })}
    >
      <Tab.Screen name="Home" component={AdminHomeScreen} />
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Profile" component={AdminProfileScreen} />
     
    </Tab.Navigator>
  );
}
