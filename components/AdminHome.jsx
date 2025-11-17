// AdminHome.jsx

import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Animated, // Import Animated
  SafeAreaView, // Import SafeAreaView
  Easing,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../Context/ThemeContext";

export default function AdminHome() {
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme();
  
  // --- Animation Setup ---
  // We use useRef to hold the animated value
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Run the animation on mount
    Animated.timing(fadeAnim, {
      toValue: 1, // Animate to full opacity
      duration: 800, // Duration in milliseconds
      easing: Easing.out(Easing.ease), // Smooth easing
      useNativeDriver: true, // Use native driver for performance
    }).start();
  }, [fadeAnim]);
  // --- End Animation Setup ---

  // --- Logout Logic ---
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: performLogout },
    ]);
  };

  const performLogout = async () => {
    try {
      await AsyncStorage.removeItem("adminToken");
      navigation.reset({ index: 0, routes: [{ name: "homeScreen" }] });
    } catch (e) {
      Alert.alert("Error", "Logout failed.");
    }
  };

  // --- Main render ---
  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.background }]}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.logOut }]}>
          <Text style={[styles.title, { color: theme.primary }]}>Admin Home</Text>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: theme.logOuttext }]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Predefined Content (Now Animated) */}
        <ScrollView contentContainerStyle={styles.contentArea}>
          <Animated.View style={{
            opacity: fadeAnim, // Apply fade animation
            transform: [{
              translateY: fadeAnim.interpolate({ // Apply slide-up animation
                inputRange: [0, 1],
                outputRange: [30, 0], // Start 30px down, end at 0
              })
            }]
          }}>
            {/* Welcome Section */}
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeIcon}>👋</Text>
              <Text style={[styles.welcomeText, { color: theme.text }]}>
                Welcome, Admin!
              </Text>
              <Text style={[styles.subText, { color: theme.subText }]}>
                Here's a summary of your application.
              </Text>
            </View>

            {/* Example Card 1 */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  shadowColor: isDarkMode ? "#000" : "#999",
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: theme.primary }]}>Quick Actions</Text>
              <Text style={[styles.cardText, { color: theme.text }]}>
                Use the button at the bottom of the screen to add a new user to the system.
              </Text>
            </View>

       
          </Animated.View>
        </ScrollView>

        {/* Add User Button (Now at Bottom) */}
        <TouchableOpacity
          style={[
            styles.bottomButton,
            {
              backgroundColor: theme.primary,
              shadowColor: theme.primary,
            },
          ]}
          onPress={() => navigation.navigate("userSignup")}
        >
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>+ Add New User</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    // Padding is now handled by header and contentArea
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 0.6,
    paddingBottom: 10,
    paddingTop: 20, // Replaced paddingTop 60
    paddingHorizontal: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  // Removed addButton style
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  contentArea: {
    paddingHorizontal: 18,
    paddingBottom: 120, // Increased padding to avoid overlap with bottom button
  },
  welcomeContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  welcomeIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "700",
  },
  subText: {
    fontSize: 16,
    marginTop: 4,
  },
  card: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 5,
  },
  // New style for the button at the bottom
  bottomButton: {
    position: "absolute",
    bottom: 30, // Distance from bottom
    left: 18,
    right: 18,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    elevation: 5, // A bit more shadow
    alignItems: "center", // Center text
  },
});