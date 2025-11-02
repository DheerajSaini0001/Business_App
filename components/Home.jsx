import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { useTheme } from "../Context/ThemeContext"; // 👈 adjust path if needed

// 👇 Import your screens
import AdminLogin from "./AdminLogin";
import LoginScreen from "./Login";

const Tab = createBottomTabNavigator();

export default function NavigationTabs() {
  const { theme, isDarkMode } = useTheme(); // 🎨 Access theme values

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === "userLogin") iconName = "person-outline";
            else if (route.name === "adminLogin") iconName = "shield-outline";

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          // 🎨 Apply theme colors dynamically
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: isDarkMode ? "#aaa" : "#666",
          tabBarStyle: {
            backgroundColor: theme.card,
            borderTopWidth: 0.5,
            borderTopColor: isDarkMode ? "#444" : "#ccc",
            height: 60,
            paddingBottom: 5,
          },
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: "500",
          },
        })}
      >
        <Tab.Screen
          name="userLogin"
          component={LoginScreen}
          options={{ title: "User" }}
        />
        <Tab.Screen
          name="adminLogin"
          component={AdminLogin}
          options={{ title: "Admin" }}
        />
      </Tab.Navigator>
    </View>
  );
}
