import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  StatusBar
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from '@expo/vector-icons';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  const navigation = useNavigation();
  const isFocused = useIsFocused(); // Hook to detect when screen is active
  const { theme, isDarkMode } = useTheme();

  // --- Helpers ---
  const getInitials = (name) => {
    if (!name) return "U";
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

  // --- Fetch Logic ---
  const fetchUsers = async () => {
    // Only show full loading spinner on first load, not on subsequent focus updates
    if (users.length === 0) setLoading(true);

    try {
      const token = await AsyncStorage.getItem("adminToken");
      if (!token) {
        navigation.reset({ index: 0, routes: [{ name: "homeScreen" }] });
        return;
      }

      const res = await fetch(
        "https://saini-record-management.onrender.com/admin/users",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          navigation.reset({ index: 0, routes: [{ name: "homeScreen" }] });
          return;
        }
        throw new Error("Server error");
      }

      const data = await res.json();
      const userList = data.users || [];
      setUsers(userList);

      // If search query exists, maintain the filter, else show all
      if (searchQuery) {
        handleSearch(searchQuery, userList);
      } else {
        setFilteredUsers(userList);
      }

      setError("");
    } catch (err) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  // --- Automatic Refresh Logic ---
  useEffect(() => {
    if (isFocused) {
      fetchUsers();
    }
  }, [isFocused]); // Runs every time the screen comes into focus

  // --- Search Logic ---
  const handleSearch = (text, currentUsers = users) => {
    setSearchQuery(text);
    if (text) {
      const newData = currentUsers.filter((item) => {
        const itemData = item.fullName ? item.fullName.toUpperCase() : "".toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredUsers(newData);
    } else {
      setFilteredUsers(currentUsers);
    }
  };

  // --- Calculated Stats ---
  const totalPending = users.reduce((acc, curr) => acc + (curr.pendingAmount || 0), 0);
  const totalUsers = users.length;

  // --- Render Loading/Error ---
  if (loading && users.length === 0)
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Syncing Data...</Text>
      </View>
    );

  if (error && users.length === 0)
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Ionicons name="cloud-offline-outline" size={50} color={theme.error} />
        <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
        <TouchableOpacity onPress={fetchUsers} style={[styles.retryBtn, { backgroundColor: theme.primary }]}>
          <Text style={{ color: '#fff' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* 1. Header & Title */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Users</Text>
          <Text style={[styles.headerSubtitle, { color: theme.subText }]}>Manage client records</Text>
        </View>
        <View style={[styles.headerIcon, { backgroundColor: theme.card }]}>
          <Ionicons name="people" size={24} color={theme.primary} />
        </View>
      </View>

      {/* 2. Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Ionicons name="search" size={20} color={theme.subText} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search by name..."
          placeholderTextColor={theme.subText}
          value={searchQuery}
          onChangeText={(text) => handleSearch(text)}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons name="close-circle" size={20} color={theme.subText} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      // RefreshControl removed as per request
      >

        {/* 3. Quick Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
            <Text style={[styles.statLabel, { color: theme.subText }]}>Total Clients</Text>
            <Text style={[styles.statValue, { color: theme.primary }]}>{totalUsers}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
            <Text style={[styles.statLabel, { color: theme.subText }]}>Total Pending</Text>
            <Text style={[styles.statValue, { color: '#FF9800' }]}>{formatCurrency(totalPending)}</Text>
          </View>
        </View>

        {/* 4. User List */}
        <Text style={[styles.sectionTitle, { color: theme.subText }]}>Client List</Text>

        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <TouchableOpacity
              key={user._id}
              style={[
                styles.userCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  shadowColor: isDarkMode ? "#000" : "#ccc",
                },
              ]}
              onPress={() => navigation.navigate("userDetail", { user })}
              activeOpacity={0.7}
            >
              {/* Left: Avatar */}
              <View style={[styles.avatarContainer, { backgroundColor: theme.primary + '15' }]}>
                <Text style={[styles.avatarText, { color: theme.primary }]}>
                  {getInitials(user.fullName)}
                </Text>
              </View>

              {/* Middle: Info */}
              <View style={styles.cardInfo}>
                <Text style={[styles.cardName, { color: theme.text }]}>{user.fullName}</Text>
                <Text style={[styles.cardPhone, { color: theme.subText }]}>{user.phone}</Text>

                {/* Badges Row */}
                <View style={styles.badgesRow}>
                  {user.pendingAmount > 0 ? (
                    <View style={[styles.badge, { backgroundColor: '#FFF3E0' }]}>
                      <Text style={[styles.badgeText, { color: '#FF9800' }]}>Pending: {user.pendingAmount}</Text>
                    </View>
                  ) : (
                    <View style={[styles.badge, { backgroundColor: '#E8F5E9' }]}>
                      <Text style={[styles.badgeText, { color: '#4CAF50' }]}>Paid</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Right: Arrow */}
              <Ionicons name="chevron-forward" size={20} color={theme.subText} />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={40} color={theme.subText} />
            <Text style={[styles.emptyText, { color: theme.subText }]}>No users found.</Text>
          </View>
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

  // Header
  headerContainer: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
  },
  headerSubtitle: {
    fontSize: 14,
  },
  headerIcon: {
    padding: 10,
    borderRadius: 12,
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },

  // Stats
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statBox: {
    width: '48%',
    padding: 15,
    borderRadius: 14,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  // List
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    // Shadows
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 2,
  },
  cardPhone: {
    fontSize: 13,
    marginBottom: 6,
  },
  badgesRow: {
    flexDirection: 'row',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // States
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 15,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
  },
});