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
  SafeAreaView,
  ScrollView,
  Platform
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get("window");

// --- Brand Colors ---
const COLORS = {
  NAVY: '#0B1C38',
  NAVY_LIGHT: '#1A2F55',
  GOLD: '#BFA15F',
  WHITE: '#FFFFFF',
  GRAY_LIGHT: '#F8FAFC',
  GRAY_BORDER: '#E2E8F0',
  TEXT_MAIN: '#1E293B',
  TEXT_SUB: '#64748B',
  DANGER: '#EF4444',
  DANGER_BG: '#FEF2F2'
};

export default function AdminProfile() {
  const navigation = useNavigation();

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
      console.error(err);
      setError("Failed to load profile.");
      if (err.message === "Invalid token") performLogout();
    } finally {
      setLoading(false);
    }
  };

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchAdminDetails();
    }
  }, [isFocused]);

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
    return Number(amount || 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
  };

  if (loading)
    return (
      <View style={[styles.center, { backgroundColor: COLORS.WHITE }]}>
        <ActivityIndicator size="large" color={COLORS.NAVY} />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );

  if (error)
    return (
      <View style={[styles.center, { backgroundColor: COLORS.WHITE }]}>
        <Ionicons name="cloud-offline-outline" size={50} color={COLORS.DANGER} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchAdminDetails} style={styles.retryBtn}>
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* === HEADER === */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.headerTitle}>My Profile</Text>
            <Text style={styles.headerSubtitle}>Administrator</Text>
          </View>
          {/* Logo or Brand Icon can go here */}
          <View style={styles.iconCircle}>
            <Text style={styles.logoText}>S</Text>
          </View>
        </View>

        {profile && (
          <>
            {/* === 1. PROFILE CARD === */}
            <View style={[styles.profileCard, { backgroundColor: COLORS.WHITE, borderWidth: 1, borderColor: COLORS.GRAY_BORDER }]}>
              <View style={styles.profileGradient}>
                <View style={styles.profileHeaderRow}>
                  <View style={[styles.avatarContainer, { backgroundColor: COLORS.GRAY_LIGHT, borderColor: COLORS.NAVY }]}>
                    <Text style={styles.avatarText}>{getInitials(profile.fullName)}</Text>
                  </View>
                  <View style={styles.profileTexts}>
                    <Text style={[styles.userName, { color: COLORS.NAVY }]}>{profile.fullName}</Text>
                    <Text style={[styles.userId, { color: COLORS.TEXT_SUB }]}>ID: {profile.adminId}</Text>
                    <Text style={[styles.userPhone, { color: COLORS.TEXT_SUB }]}>{profile.phone}</Text>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: COLORS.GRAY_BORDER }]} />

                <View style={styles.profileFooter}>
                  <Text style={[styles.memberSince, { color: COLORS.TEXT_SUB }]}>
                    Member since {new Date(profile.createdAt).getFullYear()}
                  </Text>
                  <Ionicons name="shield-checkmark" size={18} color={COLORS.GOLD} />
                </View>
              </View>
            </View>

            {/* === 2. STATS GRID === */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Financial Overview</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="wallet-outline" size={22} color="#0284C7" />
                </View>
                <Text style={styles.statLabel}>Total Value</Text>
                <Text style={[styles.statValue, { color: COLORS.NAVY }]}>{formatCurrency(profile.totalAmount)}</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="trending-up" size={22} color="#16A34A" />
                </View>
                <Text style={styles.statLabel}>Earnings</Text>
                <Text style={[styles.statValue, { color: '#16A34A' }]}>{formatCurrency(profile.totalEarningAmount)}</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="time-outline" size={22} color="#D97706" />
                </View>
                <Text style={styles.statLabel}>Pending</Text>
                <Text style={[styles.statValue, { color: '#D97706' }]}>{formatCurrency(profile.totalPendingAmount)}</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="pricetag-outline" size={22} color="#DC2626" />
                </View>
                <Text style={styles.statLabel}>Discount</Text>
                <Text style={[styles.statValue, { color: '#DC2626' }]}>{formatCurrency(profile.totalDiscountAmount)}</Text>
              </View>
            </View>

            {/* === 3. ACTIONS MENU === */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Account Actions</Text>
            </View>

            <View style={styles.actionsContainer}>
              {/* Add New User */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate("userSignup")}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="person-add-outline" size={22} color={COLORS.NAVY} />
                </View>
                <Text style={styles.actionText}>Add New User</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SUB} />
              </TouchableOpacity>

              {/* Change Password */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate("changePassword", { userType: 'admin' })}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="key-outline" size={22} color={COLORS.NAVY} />
                </View>
                <Text style={styles.actionText}>Change Password</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SUB} />
              </TouchableOpacity>

              {/* Logout */}
              <TouchableOpacity
                style={[styles.actionButton, styles.logoutButton]}
                onPress={handleLogout}
              >
                <View style={[styles.actionIcon, styles.logoutIcon]}>
                  <Ionicons name="log-out-outline" size={22} color={COLORS.DANGER} />
                </View>
                <Text style={[styles.actionText, styles.logoutText]}>Log Out</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.versionText}>App Version 1.0.0</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.TEXT_MAIN,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.DANGER,
    marginVertical: 16,
  },
  retryBtn: {
    backgroundColor: COLORS.NAVY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryBtnText: {
    color: COLORS.WHITE,
    fontWeight: '600',
  },

  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.NAVY,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SUB,
    fontWeight: '500',
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: COLORS.NAVY,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: COLORS.NAVY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  logoText: {
    color: COLORS.GOLD,
    fontWeight: '900',
    fontSize: 24,
    marginBottom: 2,
  },

  // Profile Card
  profileCard: {
    borderRadius: 20,
    marginBottom: 32,
    shadowColor: COLORS.NAVY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  profileGradient: {
    padding: 24,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.NAVY,
  },
  profileTexts: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "Bold",
    color: COLORS.NAVY,
    marginBottom: 2,
  },
  userId: {
    fontSize: 14,
    color: COLORS.GOLD,
    marginBottom: 2,
    fontWeight: '600',
  },
  userPhone: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 16,
  },
  profileFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberSince: {
    color: COLORS.TEXT_SUB,
    fontSize: 12,
  },

  // Section Headers
  sectionHeader: {
    marginBottom: 20,
    marginTop: 10
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.NAVY,
    letterSpacing: 0.5,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    width: (width - 48 - 12) / 2, // (Screen width - padding - gap) / 2
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.GRAY_BORDER,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SUB,
    fontWeight: "600",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
  },

  // Actions
  actionsContainer: {
    gap: 12,
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.GRAY_LIGHT,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.GRAY_BORDER,
  },
  actionIcon: {
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    color: COLORS.NAVY,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: COLORS.DANGER_BG,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowOpacity: 0, // remove shadow for logout to make it flatter or keep consistency
  },
  logoutIcon: {
    // style adjustment if needed
  },
  logoutText: {
    color: COLORS.DANGER,
  },

  versionText: {
    textAlign: 'center',
    color: COLORS.TEXT_SUB,
    fontSize: 12,
    marginTop: 0,
    marginBottom: 20
  },
});