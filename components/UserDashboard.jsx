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
  Alert, // 1. 'Alert' ko import kiya gaya
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // 2. AsyncStorage ko import kiya gaya
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
// ... existing code ...
  if (!isoString) return "-";
  return new Date(isoString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// API URL ko setup kiya gaya
const API_BASE_URL = "https://saini-record-management.onrender.com";

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
          console.log("Token nahi mila, redirecting to homeScreen");
          // FIX: 'Home' ko 'homeScreen' kiya (App.js se match karne ke liye)
          navigation.reset({ index: 0, routes: [{ name: 'homeScreen' }] }); 
          setLoading(false);
          return;
        }

        const userRes = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Agar token invalid/expire ho gaya hai (jaise 401 error)
        if (!userRes.ok) {
            throw new Error("Invalid token or Server Error");
        }
        
        const userData = await userRes.json();
        
        if (!userData.user) {
           throw new Error(userData.message || "User data nahi mila");
        }
        setUser(userData.user);

        // Session data fetch karein
        const sessionRes = await fetch(
          `${API_BASE_URL}/session/${userData.user._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const sessionData = await sessionRes.json();
        setSession(sessionData.session || []);

      } catch (err) {
        console.error("Fetch error:", err);
        // --- 3. AUTO-LOGOUT (Jab kuch bhi fail ho) ---
        // Agar token expire ho gaya hai, toh user ko automatically logout kar dein
        try {
            await AsyncStorage.removeItem("token");
            // FIX: 'Home' ko 'homeScreen' kiya
            navigation.reset({
                index: 0,
                routes: [{ name: 'homeScreen' }], 
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

  // --- 4. Logout Function ---
  // Yeh function 'Logout' button dabane par chalega
  const handleLogout = () => {
    Alert.alert(
      "Logout", // Title
      "Are you sure you want to log out?", // Message
      [
        // Button 1: Cancel
        {
          text: "Cancel",
          style: "cancel",
        },
        // Button 2: Logout
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // 1. Storage se token remove karein
              await AsyncStorage.removeItem("token");
              
              // 2. User ko 'homeScreen' par waapas bhej dein
              navigation.reset({
                index: 0,
                routes: [{ name: 'homeScreen' }], // (App.js se match karta hua)
              });
            } catch (error) {
              console.error("Logout ke time error:", error);
              Alert.alert("Error", "Logout failed. Please try again.");
            }
          },
        },
      ],
      { cancelable: true } // Alert ke bahar click karke band kar sakte hain
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

  // Fallback (agar user fetch fail ho jaaye auto-logout se pehle)
  if (!user) {
// ... existing code ...
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
            {/* 5. Logout Button ko onPress diya gaya */}
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
// ... existing code ...
          <View style={styles.card}>
            <Text style={styles.noSessionsText}>No seasons yet.</Text>
          </View>
        ) : (
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
{/* ... existing code ... */}
              <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>NO.</Text>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Start</Text>
              <Text style={[styles.tableHeaderCell, { flex: 2.5 }]}>Duration</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Cost</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.8, textAlign: 'right' }]}>Rec</Text>
            </View>
            
            {/* Table Body */}
            {session.map((sessionItem) => (
// ... existing code ...
              <React.Fragment key={sessionItem._id}>
                <TouchableOpacity onPress={() => toggleRecords(sessionItem._id)} style={styles.touchableRow}>
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.boldText, { flex: 1.2 }]}>{sessionItem.sessionNo}</Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{formatDateDMY(sessionItem.startTime)}</Text>
                    
                    <Text style={[styles.tableCell, { flex: 2.5 }]}>{sessionItem.totalDurationReadable}</Text>
                    <Text style={[styles.tableCell, styles.boldText, { flex: 1.5 }]}>₹{sessionItem.totalCost}</Text>
                    <Text style={[styles.tableCell, { flex: 1.8, color: '#2563EB', fontWeight: '600', textAlign: 'right' }]}>
                      {openRecords[sessionItem._id] ? "Hide ▲" : "Show ▼"}
                    </Text>
                  </View>
                </TouchableOpacity>
                
                {/* Collapsible Inner Table */}
                {openRecords[sessionItem._id] && (
// ... existing code ...
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
// (Styles me koi change nahi hai)
const styles = StyleSheet.create({
// ... existing code ...
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  container: {
// ... existing code ...
    padding: 16,
    paddingBottom: 40,
  },
  centerScreen: {
// ... existing code ...
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    padding: 20,
  },
  loadingText: {
// ... existing code ...
    marginTop: 10,
    fontSize: 16,
    color: "#4B5563",
  },
  errorText: {
// ... existing code ...
    fontSize: 16,
    color: "#DC2626",
    textAlign: 'center',
  },
  header: {
// ... existing code ...
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
// ... existing code ...
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
// ... existing code ...
    fontSize: 24, 
    fontWeight: "bold",
    color: "#111827",
    flex: 1, 
  },
  logoutButton: {
// ... existing code ...
    backgroundColor: '#EF4444', // red-500
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
// ... existing code ...
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  infoBox: {
// ... existing code ...
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
// ... existing code ...
    fontSize: 16,
    color: "#4B5563",
    fontWeight: '600',
    marginRight: 5,
  },
  infoValue: {
// ... existing code ...
    fontSize: 16,
    color: "#1F2937",
  },
  subTitle: {
// ... existing code ...
    fontSize: 22,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  card: {
// ... existing code ...
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
// ... existing code ...
    fontSize: 16,
    color: "#6B7280",
  },
  tableContainer: {
// ... existing code ...
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
// ... existing code ...
    backgroundColor: "#2563EB",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  tableHeaderCell: {
// ... existing code ...
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 14,
    textTransform: "uppercase",
  },
  touchableRow: {
// ... existing code ...
    backgroundColor: 'transparent',
  },
  tableRow: {
// ... existing code ...
    flexDirection: "row",
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tableCell: {
// ... existing code ...
    fontSize: 14,
    color: "#374151",
  },
  boldText: {
// ... existing code ...
    fontWeight: '600',
  },
  collapsibleArea: {
// ... existing code ...
    backgroundColor: "#f9fafb",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  recordsTitle: {
// ... existing code ...
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#111827'
  },
  innerTableHeaderRow: {
// ... existing code ...
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
  },
  innerTableRow: {
// ... existing code ...
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  innerTableHeaderCell: {
// ... existing code ...
    flex: 1,
    fontWeight: "600",
    fontSize: 13,
    color: "#374151",
  },
  innerTableCell: {
// ... existing code ...
    flex: 1,
    fontSize: 13,
    color: "#4B5563",
  },
  noRecordsText: {
// ... existing code ...
    textAlign: 'center',
    padding: 10,
    fontSize: 13,
    color: '#6B7280'
  }
});
