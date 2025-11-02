import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Context/ThemeContext"; // ✅ Import ThemeContext

// 👇 Import your screens
import UserDashboardScreen from "./UserDashboard";
import UserProfileScreen from "./UserProfile";
import UserHomeScreen from "./UserHomeScreen";

const Tab = createBottomTabNavigator();

export default function NavigationTabs() {
  const { theme, isDarkMode } = useTheme(); // ✅ Access theme values

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = "home-outline";
          else if (route.name === "Dashboard") iconName = "grid-outline";
          else if (route.name === "UserProfile") iconName = "person-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        // ✅ Apply theme dynamically
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.subText,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopWidth: 0.5,
          borderTopColor: isDarkMode ? "#333" : "#ccc",
          height: 60,
          paddingBottom: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          color: theme.text,
        },
      })}
    >
      <Tab.Screen name="Home" component={UserHomeScreen} />
      <Tab.Screen name="Dashboard" component={UserDashboardScreen} />
      <Tab.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
}
