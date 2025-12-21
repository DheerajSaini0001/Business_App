import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from '@expo/vector-icons';
import { Platform } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../context/ThemeContext";
import AdminUsersScreen from "../screens/AdminUsersScreen";
import AdminOverviewScreen from "../screens/AdminOverviewScreen";
import AdminProfileScreen from "../screens/AdminProfileScreen";

const Tab = createBottomTabNavigator();

export default function AdminTabNavigator() {
  const { theme, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

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
          borderTopColor: isDarkMode ? "#333" : "#E2E8F0",
          elevation: 8, // Android shadow
          shadowColor: "#000", // iOS shadow
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,

          // Calculate height dynamically: standard height (60) + safe area bottom inset
          height: 60 + (insets.bottom > 0 ? insets.bottom : 10),

          // Add padding for the home indicator/gestures area
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          color: theme.text,
          marginBottom: 4,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          paddingVertical: 4,
        }
      })}
    >
      <Tab.Screen name="Home" component={AdminOverviewScreen} />
      <Tab.Screen name="Dashboard" component={AdminUsersScreen} />
      <Tab.Screen name="Profile" component={AdminProfileScreen} />

    </Tab.Navigator>
  );
}
