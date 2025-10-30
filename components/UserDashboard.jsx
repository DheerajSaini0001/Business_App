import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Alert, // <--- 1. 'Alert' ko import karein
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Helper functions (No change here)
const formatDateDMY = (isoString) => {
  if (!isoString) return "-";
  const date = new Date(isoString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const format12Hour = (isoString) => {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const API_BASE_URL = Platform.OS === 'android' ? 'https://saini-record-management.onrender.com' : 'https://saini-record-management.onrender.com';

export default function UserDashboard({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState([]);
  const [openRecords, setOpenRecords] = useState({});

  useEffect(() => {
    const fetchUserAndSession = async () => {
      try {
        const token = await AsyncStorage.getItem("token"); 
        
        if (!token) {
          console.log("Token nahi mila, redirecting to home");
          navigation.reset({ index: 0, routes: [{ name: 'Home' }] }); 
          setLoading(false);
          return;
        }

        const userRes = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // --- 2. Robust Error Check ---
        // Agar server 401/403 (unauthorized) ya 500 error bhejta hai
        if (!userRes.ok) {
            throw new Error("Invalid token or Server Error");
        }
        
        const userData = await userRes.json();
        
        if (!userData.user) {
           throw new Error(userData.message || "User data nahi mila");
        }
        setUser(userData.user);

        const sessionRes = await fetch(
          `${API_BASE_URL}/session/${userData.user._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const sessionData = await sessionRes.json();
        setSession(sessionData.session || []);

      } catch (err) {
        console.error("Fetch error:", err);
        // --- 3. AUTO-LOGOUT on Error ---
        // Agar kuch bhi fail hota hai (jaise token expire), toh user ko logout kar dein
        try {
            await AsyncStorage.removeItem("token");
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }], // Ensure 'Home' is correct
            });
        } catch (logoutError) {
            console.error("Auto-logout failed:", logoutError);
        }
        // ---------------------------------
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndSession();
  }, [navigation]);

  // --- 4. Logout function with Confirmation ---
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // 1. AsyncStorage se token remove karein
              await AsyncStorage.removeItem("token");
              
              // 2. User ko Home screen par reset karein
              navigation.reset({
                index: 0,
                routes: [{ name: 'homeScreen' }], // Make sure 'Home' is your login/home screen name
              });
            } catch (error) {
              console.error("Logout ke time error:", error);
              Alert.alert("Error", "Logout failed. Please try again.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };


  const toggleRecords = (sessionId) => {
    setOpenRecords((prev) => ({ ...prev, [sessionId]: !prev[sessionId] }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerScreen}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  // Ab 'user' ke null hone par auto-logout handle ho raha hai,
  // lekin yeh ek fallback ki tarah rakhein
  if (!user) {
    return (
      <SafeAreaView style={styles.centerScreen}>
        <Text style={styles.errorText}>Loading failed. Redirecting...</Text>
        <ActivityIndicator size="small" color="#4B5563" style={{marginTop: 10}} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* User Info Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Text style={styles.title}>Welcome, {user.fullName}</Text>
            {/* Logout Button (onPress handleLogout call karega) */}
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{user.phone}</Text>
          </View>
        </View>

        {/* Seasons Section (No change here) */}
        <Text style={styles.subTitle}>Your Seasons</Text>
        
        {session.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.noSessionsText}>No seasons yet.</Text>
          </View>
        ) : (
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>NO.</Text>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Start</Text>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Stop</Text>
              <Text style={[styles.tableHeaderCell, { flex: 2.5 }]}>Duration</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Cost</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.8, textAlign: 'right' }]}>Rec</Text>
            </View>
            
            {/* Table Body */}
            {session.map((sessionItem) => (
              <React.Fragment key={sessionItem._id}>
                <TouchableOpacity onPress={() => toggleRecords(sessionItem._id)} style={styles.touchableRow}>
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.boldText, { flex: 1.2 }]}>{sessionItem.sessionNo}</Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{formatDateDMY(sessionItem.startTime)}</Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{formatDateDMY(sessionItem.stopTime)}</Text>
                    <Text style={[styles.tableCell, { flex: 2.5 }]}>{sessionItem.totalDurationReadable}</Text>
                    <Text style={[styles.tableCell, styles.boldText, { flex: 1.5 }]}>₹{sessionItem.totalCost}</Text>
                    <Text style={[styles.tableCell, { flex: 1.8, color: '#2563EB', fontWeight: '600', textAlign: 'right' }]}>
                      {openRecords[sessionItem._id] ? "Hide ▲" : "Show ▼"}
                    </Text>
                  </View>
                </TouchableOpacity>
                
                {/* Collapsible Inner Table */}
                {openRecords[sessionItem._id] && (
                  <View style={styles.collapsibleArea}>
                    <Text style={styles.recordsTitle}>Session Records</Text>
                    <View style={[styles.innerTableRow, styles.innerTableHeaderRow]}>
                      <Text style={styles.innerTableHeaderCell}>Date</Text>
                      <Text style={styles.innerTableHeaderCell}>Start Time</Text>
                      <Text style={styles.innerTableHeaderCell}>Stop Time</Text>
                      <Text style={styles.innerTableHeaderCell}>Duration</Text>
                    </View>
                    {sessionItem.records.length > 0 ? (
                       sessionItem.records.map((record) => (
                        <View key={record._id} style={styles.innerTableRow}>
                          <Text style={styles.innerTableCell}>{formatDateDMY(record.sessionDate)}</Text>
                          <Text style={styles.innerTableCell}>{format12Hour(record.startTime)}</Text>
                          <Text style={styles.innerTableCell}>{format12Hour(record.stopTime) || "-"}</Text>
                          <Text style={styles.innerTableCell}>{record.durationReadable}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noRecordsText}>No records found for this session.</Text>
                    )}
                  </View>
                )}
              </React.Fragment>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles ---
// (Styles me koi change nahi hai, woh perfect hain)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  centerScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4B5563",
  },
  errorText: {
    fontSize: 16,
    color: "#DC2626",
    textAlign: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24, 
    fontWeight: "bold",
    color: "#111827",
    flex: 1, 
  },
  logoutButton: {
    backgroundColor: '#EF4444', // red-500
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  infoBox: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 16,
    color: "#4B5563",
    fontWeight: '600',
    marginRight: 5,
  },
  infoValue: {
    fontSize: 16,
    color: "#1F2937",
  },
  subTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  card: {
     backgroundColor: '#ffffff',
     borderRadius: 12,
     padding: 20,
     alignItems: 'center',
     shadowColor: "#000",
     shadowOffset: { width: 0, height: 1 },
     shadowOpacity: 0.05,
     shadowRadius: 2,
     elevation: 2,
  },
  noSessionsText: {
    fontSize: 16,
    color: "#6B7280",
  },
  tableContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    backgroundColor: "#2563EB",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  tableHeaderCell: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 14,
    textTransform: "uppercase",
  },
  touchableRow: {
    backgroundColor: 'transparent',
  },
  tableRow: {
    flexDirection: "row",
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tableCell: {
    fontSize: 14,
    color: "#374151",
  },
  boldText: {
    fontWeight: '600',
  },
  collapsibleArea: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  recordsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#111827'
  },
  innerTableHeaderRow: {
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
  },
  innerTableRow: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  innerTableHeaderCell: {
    flex: 1,
    fontWeight: "600",
    fontSize: 13,
    color: "#374151",
  },
  innerTableCell: {
    flex: 1,
    fontSize: 13,
    color: "#4B5563",
  },
  noRecordsText: {
    textAlign: 'center',
    padding: 10,
    fontSize: 13,
    color: '#6B7280'
  }
});