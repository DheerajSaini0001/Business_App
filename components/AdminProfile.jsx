import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator, // <-- Waapas add kiya
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../Context/ThemeContext";
// import { Ionicons } from '@expo/vector-icons'; // Example icon library

export default function AdminProfile() {
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme();

  // --- States waapas add kar diye ---
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- API Fetch Logic ---
  const fetchAdminDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("adminToken");
      if (!token) {
        performLogout();
        return;
      }
      // Yahaan apna correct backend endpoint daalna
      const res = await fetch(
        "https://saini-record-management.onrender.com/admin/profile", // Example endpoint
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        if (res.status === 401 || res.status === 403)
          throw new Error("Invalid token");
        throw new Error("Server error");
      }

      const data = await res.json();
      // Apna response check kar lena (data.profile, data.admin, etc.)
      setProfile(data.profile || data.admin);
    } catch (err) {
      setError("Failed to load profile.");
      if (err.message === "Invalid token") performLogout();
    } finally {
      setLoading(false);
    }
  };

  // --- useEffect Hook to fetch data on mount ---
  useEffect(() => {
    fetchAdminDetails();
  }, []);

  // --- Logout Functions (Aapke code se same) ---
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

  // --- Loading State ---
  if (loading)
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Loading profile...
        </Text>
      </View>
    );

  // --- Error State ---
  if (error)
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
      </View>
    );

  // --- Main Render (Ab data ke saath) ---
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.logOut }]}>
        <Text style={[styles.title, { color: theme.primary }]}>Admin Profile</Text>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.logOuttext }]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Details Section (Ab Dynamic hai) */}
      <ScrollView contentContainerStyle={styles.profileContainer}>
        {profile ? (
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
            {/* <View style={styles.avatarPlaceholder}>
             <Ionicons name="person" size={50} color={theme.primary} />
           </View> */}

            <Text
              style={[styles.userName, { color: theme.text, textAlign: "center" }]}
            >
              {profile.fullName}
            </Text>

            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: theme.primary }]}>
                Username:{" "}
              </Text>
              <Text style={[styles.userInfo, { color: theme.subText }]}>
                {profile.username}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: theme.primary }]}>Email: </Text>
              <Text style={[styles.userInfo, { color: theme.subText }]}>
                {profile.email}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: theme.primary }]}>Role: </Text>
              <Text style={[styles.userInfo, { color: theme.subText }]}>
                {profile.role}
              </Text>
            </View>

            <Text style={[styles.date, { color: theme.subText }]}>
              Registered: {new Date(profile.createdAt).toLocaleDateString()}
            </Text>
          </View>
        ) : (
          // Agar profile load na ho (bina error ke)
          <Text style={[styles.emptyText, { color: theme.subText }]}>
            Could not load profile details.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

// --- Styles (Loading/Error styles waapas add kiye) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 0.6,
    paddingBottom: 10,
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
  profileContainer: {
    paddingTop: 20,
    paddingBottom: 80,
  },
  card: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  // avatarPlaceholder: { ... },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  userInfo: {
    fontSize: 16,
  },
  date: {
    marginTop: 10,
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "right",
  },
  // --- Loading/Error styles ---
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: "red", // Example error color
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 40,
  },
});