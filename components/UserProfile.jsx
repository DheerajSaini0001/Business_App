import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../Context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const API_BASE_URL = "https://saini-record-management.onrender.com";

const UserProfile = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) throw new Error("Token not found");

        const res = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok || !data.user) throw new Error("User not found");

        setUser(data.user);
      } catch (err) {
        console.error("User fetch error:", err);
        await AsyncStorage.removeItem("token");
        navigation.reset({ index: 0, routes: [{ name: "userLogin" }] });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigation]);

  // ✅ Logout logic
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          navigation.reset({ index: 0, routes: [{ name: "homeScreen" }] });
        },
      },
    ]);
  };

  if (loading)
    return (
      <SafeAreaView
        style={[styles.center, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Loading...
        </Text>
      </SafeAreaView>
    );

  if (!user)
    return (
      <SafeAreaView
        style={[styles.center, { backgroundColor: theme.background }]}
      >
        <Text style={[styles.errorText, { color: theme.text }]}>
          Failed to load profile.
        </Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 100 }}>
        {/* 🌈 Gradient Header */}
        <LinearGradient
          colors={isDarkMode ? ["#232526", "#414345"] : ["#6a11cb", "#2575fc"]}
          style={styles.header}
        >
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  user.avatarUrl ||
                  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
              }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.userName}>{user.fullName}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </LinearGradient>

        {/* 📋 Details Card */}
        <View
          style={[
            styles.detailsCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.text }]}>
              {user.phone || "N/A"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.text }]}>
              Joined: {new Date(user.createdAt).toDateString()}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="person-circle-outline"
              size={20}
              color={theme.primary}
            />
            <Text style={[styles.infoText, { color: theme.text }]}>
              Role: {user.role || "User"}
            </Text>
          </View>
        </View>

        {/* 🚪 Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: "#ef4444" }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ⚙️ Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          © {new Date().getFullYear()} <Text style={{ fontWeight: "600" }}>Saini Record Manager</Text>
          {"\n"}Developed with ❤️ by <Text style={{ color: theme.primary }}>Dheeraj Saini</Text> 💻
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    width: "100%",
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 30,
  },
  avatarContainer: {
    backgroundColor: "#fff",
    borderRadius: 75,
    padding: 3,
    elevation: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 10,
  },
  userEmail: {
    color: "#e0e0e0",
    fontSize: 14,
    marginTop: 3,
  },
  detailsCard: {
    width: "90%",
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  infoText: {
    fontSize: 16,
    fontWeight: "500",
  },
  logoutButton: {
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    elevation: 5,
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 15 },
  footer: {
    position: "absolute",
    bottom: 15,
    width: "100%",
    alignItems: "center",
  },
  footerText: {
    textAlign: "center",
    fontSize: 13,
    opacity: 0.8,
  },
});

export default UserProfile;
