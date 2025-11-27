import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  SafeAreaView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get("window");

export default function AdminProfile() {
  const navigation = useNavigation();
  const { theme, isDarkMode, toggleTheme } = useTheme();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAdminDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("adminToken");
      if (!token) {
        performLogout();
        return;
      }
      const res = await fetch(
        "https://saini-record-management.onrender.com/admin/detail",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        if (res.status === 401 || res.status === 403)
          throw new Error("Invalid token");
        throw new Error("Server error");
      }

      const data = await res.json();
      setProfile(data.admin);
    } catch (err) {
      setError("Failed to load profile.");
      if (err.message === "Invalid token") performLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDetails();
  }, []);

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

  const getInitials = (name) => {
    if (!name) return "A";
    const parts = name.split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name[0].toUpperCase();
  };

  const formatCurrency = (amount) => {
    return Number(amount).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
  };

  // --- Helper for Dynamic Icon Backgrounds ---
  const getIconBg = (lightColor, darkColor) => {
    return isDarkMode ? `${darkColor}20` : lightColor;
  };

  if (loading)
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading Profile...</Text>
      </View>
    );

  if (error)
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Ionicons name="cloud-offline-outline" size={50} color={theme.error} />
        <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
        <TouchableOpacity onPress={fetchAdminDetails} style={[styles.retryBtn, { backgroundColor: theme.primary }]}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />

      <View style={[styles.container, { backgroundColor: theme.background }]}>

        {/* === HEADER === */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>My Profile</Text>
            <Text style={[styles.headerSubtitle, { color: theme.subText }]}>Administrator</Text>
          </View>

          <TouchableOpacity
            style={[styles.themeBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={toggleTheme}
          >
            <Ionicons
              name={isDarkMode ? "moon" : "sunny"}
              size={20}
              color={isDarkMode ? "#fff" : "#F59E0B"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {profile && (
            <>
              {/* === 1. PROFILE CARD === */}
              <View style={[styles.profileCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>

                {/* Avatar */}
                <View style={[styles.avatarContainer, { backgroundColor: theme.primary }]}>
                  <Text style={styles.avatarText}>{getInitials(profile.fullName)}</Text>
                </View>

                {/* Info */}
                <Text style={[styles.userName, { color: theme.text }]}>{profile.fullName}</Text>
                <Text style={[styles.userEmail, { color: theme.subText }]}>{profile.email}</Text>

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <View style={styles.contactInfo}>
                  <View style={styles.contactItem}>
                    <Ionicons name="call" size={16} color={theme.primary} />
                    <Text style={[styles.contactText, { color: theme.text }]}> {profile.phone}</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Ionicons name="calendar" size={16} color={theme.primary} />
                    <Text style={[styles.contactText, { color: theme.text }]}> Since {new Date(profile.createdAt).getFullYear()}</Text>
                  </View>
                </View>
              </View>

              {/* === 2. STATS GRID === */}
              <Text style={[styles.sectionTitle, { color: theme.subText }]}>Financial Overview</Text>

              <View style={styles.statsGrid}>
                {/* Card 1: Total */}
                <View style={[styles.statCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
                  <View style={[styles.iconBox, { backgroundColor: getIconBg('#E3F2FD', '#60A5FA') }]}>
                    <Ionicons name="wallet" size={22} color="#3B82F6" />
                  </View>
                  <Text style={[styles.statLabel, { color: theme.subText }]}>Total Value</Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>{formatCurrency(profile.totalAmount)}</Text>
                </View>

                {/* Card 2: Earnings */}
                <View style={[styles.statCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
                  <View style={[styles.iconBox, { backgroundColor: getIconBg('#ECFDF5', '#34D399') }]}>
                    <Ionicons name="trending-up" size={22} color="#10B981" />
                  </View>
                  <Text style={[styles.statLabel, { color: theme.subText }]}>Earnings</Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>{formatCurrency(profile.totalEarningAmount)}</Text>
                </View>

                {/* Card 3: Pending */}
                <View style={[styles.statCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
                  <View style={[styles.iconBox, { backgroundColor: getIconBg('#FFFBEB', '#FBBF24') }]}>
                    <Ionicons name="time" size={22} color="#F59E0B" />
                  </View>
                  <Text style={[styles.statLabel, { color: theme.subText }]}>Pending</Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>{formatCurrency(profile.totalPendingAmount)}</Text>
                </View>

                {/* Card 4: Discount */}
                <View style={[styles.statCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
                  <View style={[styles.iconBox, { backgroundColor: getIconBg('#FEF2F2', '#F87171') }]}>
                    <Ionicons name="pricetag" size={22} color="#EF4444" />
                  </View>
                  <Text style={[styles.statLabel, { color: theme.subText }]}>Discount</Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>{formatCurrency(profile.totalDiscountAmount)}</Text>
                </View>
              </View>

              {/* === 3. BOTTOM BUTTONS === */}
              <View style={styles.bottomSection}>

                {/* --- NEW ADD USER BUTTON --- */}
                <TouchableOpacity
                  style={[styles.menuBtn, { backgroundColor: isDarkMode ? '#1F2937' : '#E0E7FF' }]}
                  onPress={() => navigation.navigate("userSignup")}
                  activeOpacity={0.8}
                >
                  <View style={styles.menuIconContainer}>
                    <Ionicons name="person-add" size={20} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuBtnText, { color: theme.primary }]}>Add New User</Text>
                </TouchableOpacity>

                {/* --- LOGOUT BUTTON --- */}
                <TouchableOpacity
                  style={[styles.menuBtn, { backgroundColor: isDarkMode ? '#3f1515' : '#FEE2E2' }]}
                  onPress={handleLogout}
                  activeOpacity={0.8}
                >
                  <View style={styles.menuIconContainer}>
                    <Ionicons name="log-out" size={20} color="#EF4444" />
                  </View>
                  <Text style={[styles.menuBtnText, { color: '#EF4444' }]}>Log Out</Text>
                </TouchableOpacity>

                <Text style={[styles.versionText, { color: theme.subText }]}>Version 1.0.0</Text>
              </View>

            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Header Styles
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 30, fontWeight: "800" },
  headerSubtitle: { fontSize: 14, marginTop: 4, fontWeight: '500' },
  themeBtn: {
    width: 45, height: 45,
    borderRadius: 25,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1,
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 20
  },

  // Profile Card
  profileCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarContainer: {
    width: 80, height: 80,
    borderRadius: 40,
    justifyContent: "center", alignItems: "center",
    marginBottom: 16,
    shadowColor: "#4F46E5", shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  avatarText: { fontSize: 32, fontWeight: "bold", color: "#fff" },
  userName: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  userEmail: { fontSize: 14 },

  divider: { height: 1, width: '100%', marginVertical: 16, opacity: 0.3 },

  contactInfo: { flexDirection: 'row', gap: 20 },
  contactItem: { flexDirection: 'row', alignItems: 'center' },
  contactText: { fontSize: 13, fontWeight: '500' },

  // Stats
  sectionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  statCard: {
    width: (width - 60) / 2,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 3,
  },
  iconBox: {
    width: 42, height: 42,
    borderRadius: 14,
    justifyContent: "center", alignItems: "center",
    marginBottom: 12,
  },
  statLabel: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  statValue: { fontSize: 17, fontWeight: "bold" },

  // Bottom Section (Add User & Logout)
  bottomSection: {
    marginTop: 'auto',
  },

  // Menu Buttons (Shared Style)
  menuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    marginBottom: 12, // Gap between buttons
  },
  menuIconContainer: { marginRight: 8 },
  menuBtnText: { fontSize: 16, fontWeight: '700' },

  versionText: { textAlign: 'center', fontSize: 12, opacity: 0.5, marginTop: 5 },

  // Loading/Error
  loadingText: { marginTop: 12, fontSize: 16, fontWeight: '500' },
  errorText: { fontSize: 16, marginTop: 10, marginBottom: 20, textAlign: 'center' },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30 },
});