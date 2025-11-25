import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../Context/ThemeContext";
import { Ionicons } from '@expo/vector-icons'; // Ensure this is installed

const { width } = Dimensions.get("window");

export default function AdminProfile() {
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme();

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

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return "A";
    const parts = name.split(" ");
    return parts.length > 1 
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() 
      : name[0].toUpperCase();
  };

  // Helper to format currency
  const formatCurrency = (amount) => {
    return Number(amount).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
  };

  if (loading)
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Fetching Dashboard...
        </Text>
      </View>
    );

  if (error)
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Ionicons name="alert-circle-outline" size={50} color={theme.error} />
        <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
        <TouchableOpacity onPress={fetchAdminDetails} style={[styles.retryBtn, {backgroundColor: theme.primary}]}>
            <Text style={{color: '#fff'}}>Retry</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Custom Header */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
          <Text style={[styles.headerSubtitle, { color: theme.subText }]}>Admin Dashboard</Text>
        </View>
        <TouchableOpacity
          style={[styles.logoutIconBtn, { backgroundColor: theme.logOut + '20' }]} // 20 for opacity
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color={theme.logOut} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {profile ? (
          <>
            {/* 1. Hero / Profile Card */}
            <View style={[styles.profileHeaderCard, { backgroundColor: theme.card }]}>
              <View style={[styles.avatarContainer, { borderColor: theme.primary }]}>
                <Text style={[styles.avatarText, { color: theme.primary }]}>
                  {getInitials(profile.fullName)}
                </Text>
              </View>
              <Text style={[styles.userName, { color: theme.text }]}>
                {profile.fullName}
              </Text>
              <Text style={[styles.userRole, { color: theme.primary }]}>Administrator</Text>
              
              <View style={styles.divider} />
              
              <View style={styles.contactRow}>
                <Ionicons name="mail-outline" size={18} color={theme.subText} style={{marginRight: 8}} />
                <Text style={[styles.contactText, { color: theme.subText }]}>{profile.email}</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={18} color={theme.subText} style={{marginRight: 8}} />
                <Text style={[styles.contactText, { color: theme.subText }]}>{profile.phone}</Text>
              </View>
            </View>

            {/* 2. Financial Stats Grid */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Financial Overview</Text>
            
            <View style={styles.statsGrid}>
              {/* Total Amount */}
              <View style={[styles.statCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
                <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="wallet" size={22} color="#2196F3" />
                </View>
                <Text style={[styles.statLabel, { color: theme.subText }]}>Total Amount</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {formatCurrency(profile.totalAmount)}
                </Text>
              </View>

              {/* Earnings */}
              <View style={[styles.statCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
                <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="trending-up" size={22} color="#4CAF50" />
                </View>
                <Text style={[styles.statLabel, { color: theme.subText }]}>Earnings</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {formatCurrency(profile.totalEarningAmount)}
                </Text>
              </View>

              {/* Pending */}
              <View style={[styles.statCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
                <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name="time" size={22} color="#FF9800" />
                </View>
                <Text style={[styles.statLabel, { color: theme.subText }]}>Pending</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>
                   {formatCurrency(profile.totalPendingAmount)}
                </Text>
              </View>

              {/* Discount */}
              <View style={[styles.statCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
                <View style={[styles.iconBox, { backgroundColor: '#FFEBEE' }]}>
                  <Ionicons name="pricetag" size={22} color="#F44336" />
                </View>
                <Text style={[styles.statLabel, { color: theme.subText }]}>Discount</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {formatCurrency(profile.totalDiscountAmount)}
                </Text>
              </View>
            </View>

            {/* 3. Footer Info */}
            <View style={styles.footerContainer}>
              <Text style={[styles.footerText, { color: theme.subText }]}>
                Member since {new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </View>
          </>
        ) : (
          <Text style={[styles.emptyText, { color: theme.subText }]}>
            Could not load profile details.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Header Styles
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  logoutIconBtn: {
    padding: 10,
    borderRadius: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  
  // Profile Card Styles
  profileHeaderCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 30,
    // Shadow for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    // Shadow for Android
    elevation: 5,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: '100%',
    marginBottom: 16,
    opacity: 0.5,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  contactText: {
    fontSize: 15,
  },

  // Stats Grid Styles
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: (width - 55) / 2, // Calculation for 2 columns with gap
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
  },

  // Misc Styles
  footerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 40,
  },
});