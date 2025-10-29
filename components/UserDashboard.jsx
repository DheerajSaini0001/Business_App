import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform, // Platform ko import karein
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Helper functions (Ye same rahenge)
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

// ⚠️ API URL ko platform ke hisaab se set karein
// Android Emulator ke liye 10.0.2.2
// iOS Simulator ke liye localhost
const API_BASE_URL = Platform.OS === 'android' ? 'https://saini-record-management.onrender.com' : 'https://saini-record-management.onrender.com';

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState([]);
  const [openRecords, setOpenRecords] = useState({});

  useEffect(() => {
    const fetchUserAndSession = async () => {
      try {
        // 1. localStorage ki jagah AsyncStorage ka istemaal
        const token = await AsyncStorage.getItem("token"); 
        
        if (!token) {
          console.log("Token nahi mila");
          setLoading(false);
          return;
        }

        const userRes = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        
        if (!userData.user) {
           throw new Error(userData.message || "User data nahi mila");
        }
        setUser(userData.user);

        // Sirf user milne par hi session fetch karein
        const sessionRes = await fetch(
          `${API_BASE_URL}/session/${userData.user._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const sessionData = await sessionRes.json();
        setSession(sessionData.session || []);

      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndSession();
  }, []);

  const toggleRecords = (sessionId) => {
    setOpenRecords((prev) => ({ ...prev, [sessionId]: !prev[sessionId] }));
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.centerScreen}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  // User na milne par state
  if (!user) {
    return (
      <SafeAreaView style={styles.centerScreen}>
        <Text style={styles.errorText}>User not found. Please log in again.</Text>
      </SafeAreaView>
    );
  }

  // Main component render
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* User Info Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome, {user.fullName}</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{user.phone}</Text>
          </View>
        </View>

        {/* Seasons Section */}
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
                    {/* Inner Table Header */}
                    <View style={[styles.innerTableRow, styles.innerTableHeaderRow]}>
                      <Text style={styles.innerTableHeaderCell}>Date</Text>
                      <Text style={styles.innerTableHeaderCell}>Start Time</Text>
                      <Text style={styles.innerTableHeaderCell}>Stop Time</Text>
                      <Text style={styles.innerTableHeaderCell}>Duration</Text>
                    </View>
                    {/* Inner Table Body */}
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
// React Native ke liye Stylesheet (Tailwind se convert karke)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6", // bg-gray-100
  },
  container: {
    padding: 16, // p-6 se thoda kam native ke liye
    paddingBottom: 40, // Scroll content ke liye extra space
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
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#111827", // text-gray-800
  },
  infoBox: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 16,
    color: "#4B5563", // text-gray-600
    fontWeight: '600',
    marginRight: 5,
  },
  infoValue: {
    fontSize: 16,
    color: "#1F2937",
  },
  subTitle: {
    fontSize: 22,
    fontWeight: "600", // font-semibold
    color: "#111827", // text-gray-800
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
    color: "#6B7280", // text-gray-500
  },
  tableContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden', // to clip borderRadius
  },
  tableHeaderRow: {
    backgroundColor: "#2563EB", // bg-blue-600
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  tableHeaderCell: {
    color: "#ffffff",
    fontWeight: "600", // font-semibold
    fontSize: 13, // text-sm
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
    borderBottomColor: "#E5E7EB", // divide-gray-200
  },
  tableCell: {
    fontSize: 14,
    color: "#374151", // text-gray-700
  },
  boldText: {
    fontWeight: '600',
  },
  collapsibleArea: {
    backgroundColor: "#f9fafb", // bg-gray-50 (thoda alag)
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
    backgroundColor: "#E5E7EB", // bg-gray-200
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