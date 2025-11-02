import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert, // 1. Alert ko import karein
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage'; // 2. AsyncStorage ko import karein
import { Bold } from "lucide-react-native";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigation = useNavigation();

  // --- 3. UPDATED fetchUsers ---
  const fetchUsers = async () => {
    try {
      // Token ko storage se get karein
      const token = await AsyncStorage.getItem("adminToken");
      if (!token) {
        // Agar token nahi hai, toh auto-logout
        performLogout(); 
        return;
      }

      const res = await fetch(
        "https://saini-record-management.onrender.com/admin/users",
        {
          // Server ko token bhejein
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Agar token invalid ya expire ho gaya hai
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
           throw new Error("Invalid token");
        }
        throw new Error("Server error");
      }

      const data = await res.json();
      setUsers(data.users || []);

    } catch (err) {
      console.error(err);
      setError("Failed to load users.");
      // Agar token invalid hai, toh auto-logout
      if (err.message === "Invalid token") {
          performLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Jab component load ho, users fetch karein
    fetchUsers();
  }, []);

  // --- 4. UPDATED handleLogout (Confirmation ke saath) ---
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: performLogout, // Asli logout function ko call karein
        },
      ],
      { cancelable: true }
    );
  };

  // Yeh alag se async function banaya
  const performLogout = async () => {
    try {
      // Storage se 'adminToken' remove karein
      await AsyncStorage.removeItem("adminToken");
      
      // 'homeScreen' par reset karein
      navigation.reset({
        index: 0,
        routes: [{ name: 'homeScreen' }], 
      });
    } catch (e) {
      console.error("Failed to remove admin token", e);
      Alert.alert("Error", "Logout failed.");
    }
  };
  // --- End of Logout Logic ---


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

  <TouchableOpacity
            style={[styles.button, styles.signupButton,{marginVertical:10,
      padding:2,
      alignItems:'center',
      flex:1,
      justifyContent:"center" ,
      backgroundColor: 'skyblue',   
      borderRadius: 8}]}
            onPress={() => navigation.navigate("userSignup")}
          >
            <Text style={[styles.buttonText,{fontSize:20,fontWeight:'bold'}]}>User Signup</Text>
          </TouchableOpacity>

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
    // Add safe area padding (StatusBar height se aapka App.js manage kar raha hai)
    paddingTop: 80, // Navbar ki height ke hisaab se adjust karein
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
    backgroundColor: "#c1121f", // Logout ke liye Red color
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
