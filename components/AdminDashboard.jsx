import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigation = useNavigation();

  const fetchUsers = async () => {
    try {
      const res = await fetch("https://saini-record-management.onrender.com/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLogout = () => {
    // Remove token if stored (you can use AsyncStorage)
    // AsyncStorage.removeItem("adminToken");
    navigation.navigate("adminLogin");
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4a148c" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );

  if (error)
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* User List */}
      <ScrollView contentContainerStyle={styles.userList}>
        {users.length > 0 ? (
          users.map((user) => (
            <TouchableOpacity
              key={user._id}
              style={styles.card}
              onPress={() => navigation.navigate("userDetail", { user })}
            >
              <Text style={styles.userName}>{user.fullName}</Text>
              <Text style={styles.userInfo}>Username: {user.username}</Text>
              <Text style={styles.userInfo}>Email: {user.email}</Text>
              <Text style={styles.userInfo}>Phone: {user.phone}</Text>
              <Text style={styles.userInfo}>Role: {user.role}</Text>
              <Text style={styles.userInfo}>
                Registered: {new Date(user.createdAt).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No users found.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f3f3",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4a148c",
  },
  logoutButton: {
    backgroundColor: "#4a148c",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },
  userList: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  userInfo: {
    color: "#555",
    fontSize: 15,
    marginBottom: 2,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
    marginTop: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4a148c",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});
