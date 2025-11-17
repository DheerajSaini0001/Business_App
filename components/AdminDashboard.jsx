import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../Context/ThemeContext";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigation = useNavigation();

  const { theme, isDarkMode } = useTheme();

  // This function is kept to handle automatic logout on token expiry
  const performLogout = async () => {
    try {
      await AsyncStorage.removeItem("adminToken");
      navigation.reset({ index: 0, routes: [{ name: "homeScreen" }] });
    } catch (e) {
      Alert.alert("Error", "Logout failed.");
    }
  };

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem("adminToken");
      if (!token) {
        performLogout();
        return;
      }

      const res = await fetch(
        "https://saini-record-management.onrender.com/admin/users",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error("Invalid token");
        throw new Error("Server error");
      }

      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError("Failed to load users.");
      if (err.message === "Invalid token") performLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Loading
  if (loading)
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading users...</Text>
      </View>
    );

  // Error
  if (error)
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
      </View>
    );

  // Main render
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header - Buttons removed */}
      <View style={[styles.header, { borderBottomColor: theme.logOut,alignContent:"center",justifyContent:"center"  }]}>
        <Text style={[styles.title, { color: theme.primary,}]}>Admin Dashboard</Text>
      </View>

      {/* User List - Simplified */}
      <ScrollView contentContainerStyle={styles.userList}>
        {users.length > 0 ? (
          users.map((user) => (
            <TouchableOpacity
              key={user._id}
              style={[
                styles.card,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  shadowColor: isDarkMode ? "#000" : "#999",
                },
              ]}
              onPress={() => navigation.navigate("userDetail", { user })}
            >
              {/* Name */}
              <Text style={[styles.userName, { color: theme.text }]}>{user.fullName}</Text>
              
              {/* Phone Number */}
              <View style={styles.infoRow}>
                <Text style={[styles.label, { color: theme.primary }]}>Phone: </Text>
                <Text style={[styles.userInfo, { color: theme.subText }]}>{user.phone}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: theme.subText }]}>No users found.</Text>
        )}
      </ScrollView>
    </View>
  );
}

// Styles - Removed logoutButton, logoutText, addButton, buttonText, and date
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between", // This will now just space the title
    alignItems: "center",
    borderBottomWidth: 0.6,
    paddingBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
  },
  userList: {
    paddingTop: 15, // Added some padding since the button is gone
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
  userName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  userInfo: {
    fontSize: 15,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 40,
  },
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
  },
});