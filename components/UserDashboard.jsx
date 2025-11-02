import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// 1. Aapke instruction ke mutabik 'useTheme' import kiya
import { useTheme } from "../Context/ThemeContext";

// Helper functions (No Change)
const formatDateDMY = (isoString) => {
  // ... (No Change in logic)
  if (!isoString) return "-";
  // Handle "YYYY-MM-DD" dates from daily entries
  if (!isoString.includes('T') && !isoString.includes('Z')) {
    const [year, month, day] = isoString.split('-').map(Number);
    // Create date as UTC to avoid timezone shift
    const date = new Date(Date.UTC(year, month - 1, day));
    const d = date.getUTCDate().toString().padStart(2, "0");
    const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const y = date.getUTCFullYear();
    return `${d}/${m}/${y}`;
  }
  // Handle full ISO strings from session entries
  const date = new Date(isoString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const format12Hour = (isoString) => {
  // ... (No Change in logic)
  if (!isoString) return "-";
  return new Date(isoString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// API URL (No Change)
const API_BASE_URL = "https://saini-record-management.onrender.com";

export default function UserDashboard({ navigation }) {
  // 2. 'useTheme' hook ka istemaal kiya
  const { theme, isDarkMode } = useTheme();

  // --- State (No Change) ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState([]);
  const [openRecords, setOpenRecords] = useState({});
  const [filterType, setFilterType] = useState("session");
  const [dailyData, setDailyData] = useState([]);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [dailyLoading, setDailyLoading] = useState(false);

  // --- Fetch User Info (No Change in logic) ---
  useEffect(() => {
    const fetchUser = async () => {
      let token;
      try {
        token = await AsyncStorage.getItem("token");
        if (!token) {
          throw new Error("Token nahi mila");
        }

        const userRes = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!userRes.ok) {
          throw new Error("Invalid token or Server Error");
        }
        
        const userData = await userRes.json();
        if (!userData.user) {
           throw new Error(userData.message || "User data nahi mila");
        }
        setUser(userData.user);

      } catch (err) {
        console.error("Fetch user error:", err);
        try {
            await AsyncStorage.removeItem("token");
            navigation.reset({ index: 0, routes: [{ name: 'homeScreen' }] });
        } catch (logoutError) {
            console.error("Auto-logout failed:", logoutError);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigation]);

  // --- Fetch Session Data (No Change in logic) ---
  const fetchSession = async (userId) => {
    setSessionLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const sessionRes = await fetch(
        `${API_BASE_URL}/session/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const sessionData = await sessionRes.json();
      setSession(sessionData.session || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSessionLoading(false);
    }
  };

  // --- Fetch Daily Data (No Change in logic) ---
  const fetchDailyData = async (userId) => {
    setDailyLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/dailyentry/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      const dailyTotals = Array.isArray(data?.data?.days)
        ? data.data.days.map((day) => ({
            _id: day._id || day.date,
            date: day.date,
            dailyTotal: day.dailyTotal || 0,
            dailyAmount: day.dailyAmount || 0,
          }))
        : [];
        
      dailyTotals.sort((a, b) => new Date(b.date) - new Date(a.date));
      setDailyData(dailyTotals);

    } catch (err) {
      console.error("❌ Error fetching daily entries:", err);
    } finally {
      setDailyLoading(false);
    }
  };

  // --- Effect to fetch data (No Change in logic) ---
  useEffect(() => {
    if (user && user._id) {
      if (filterType === "session") {
        fetchSession(user._id);
      } else {
        fetchDailyData(user._id);
      }
    }
  }, [user, filterType]);

  // --- Logout Function (No Change in logic) ---
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("token");
              navigation.reset({
                index: 0,
                routes: [{ name: 'homeScreen' }],
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

  // --- Toggle Records (No Change in logic) ---
  const toggleRecords = (sessionId) => {
    setOpenRecords((prev) => ({ ...prev, [sessionId]: !prev[sessionId] }));
  };

  // --- RENDER ---

  // 3. Styles ko 'theme' object se dynamically apply kiya
  
  if (loading) { // Initial user loading
    return (
      <SafeAreaView style={[styles.centerScreen, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={[styles.loadingText, { color: theme.subText }]}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!user) { // User fetch failed
    return (
      <SafeAreaView style={[styles.centerScreen, { backgroundColor: theme.background }]}>
        <Text style={styles.errorText}>Loading failed. Redirecting...</Text>
        <ActivityIndicator size="small" color="#4B5563" style={{marginTop: 10}} />
      </SafeAreaView>
    );
  }

  // --- Main Dashboard UI ---
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* User Info Header */}
        <View style={[styles.header, { backgroundColor: theme.card }]}>
          <View style={styles.headerTopRow}>
            <Text style={[styles.title, { color: theme.text }]}>Welcome, {user.fullName}</Text>
           
          </View>

          <View style={styles.infoBox}>
            <Text style={[styles.infoLabel, { color: theme.subText }]}>Email:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{user.email}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={[styles.infoLabel, { color: theme.subText }]}>Phone:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{user.phone}</Text>
          </View>
        </View>

        {/* --- Filter Buttons --- */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            onPress={() => setFilterType("session")}
            style={[
              styles.filterButton,
              filterType === "session" 
                ? styles.activeFilterButton 
                : { backgroundColor: theme.card } // Inactive button background
            ]}
          >
            <Text 
              style={[
                styles.filterButtonText,
                filterType === "session" 
                  ? styles.activeFilterButtonText 
                  : { color: theme.text } // Inactive text color
              ]}
            >
              Session Data
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilterType("daily")}
            style={[
              styles.filterButton,
              filterType === "daily" 
                ? styles.activeFilterButton 
                : { backgroundColor: theme.card } // Inactive button background
            ]}
          >
            <Text 
              style={[
                styles.filterButtonText,
                filterType === "daily" 
                  ? styles.activeFilterButtonText 
                  : { color: theme.text } // Inactive text color
              ]}
            >
              Daily Entry Data
            </Text>
          </TouchableOpacity>
        </View>

        {/* --- Conditional Content --- */}
        {filterType === "session" ? (
          // --- SESSION DATA ---
          <>
            <Text style={[styles.subTitle, { color: theme.text }]}>Your Sessions</Text>
            {sessionLoading ? (
              <ActivityIndicator size="large" color="#2563EB" style={{marginTop: 20}} />
            ) : session.length === 0 ? (
              <View style={[styles.card, { backgroundColor: theme.card }]}>
                <Text style={[styles.noSessionsText, { color: theme.subText }]}>No sessions yet.</Text>
              </View>
            ) : (
              <View style={[styles.tableContainer, { backgroundColor: theme.card }]}>
                {/* Table Header */}
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                  <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>NO.</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Start</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 2.5 }]}>Duration</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Cost</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1.8, textAlign: 'right' }]}>Rec</Text>
                </View>
                
                {/* Table Body */}
                {session.map((sessionItem) => (
                  <React.Fragment key={sessionItem._id}>
                    <TouchableOpacity onPress={() => toggleRecords(sessionItem._id)} style={styles.touchableRow}>
                      {/* Border color dynamic using isDarkMode */}
                      <View style={[styles.tableRow, { borderBottomColor: isDarkMode ? "#333" : "#E5E7EB" }]}>
                        <Text style={[styles.tableCell, styles.boldText, { color: theme.text, flex: 1.2 }]}>{sessionItem.sessionNo}</Text>
                        <Text style={[styles.tableCell, { color: theme.text, flex: 2 }]}>{formatDateDMY(sessionItem.startTime)}</Text>
                        <Text style={[styles.tableCell, { color: theme.text, flex: 2.5 }]}>{sessionItem.totalDurationReadable}</Text>
                        <Text style={[styles.tableCell, styles.boldText, { color: theme.text, flex: 1.5 }]}>₹{sessionItem.totalCost}</Text>
                        <Text style={[styles.tableCell, { flex: 1.8, color: '#2563EB', fontWeight: '600', textAlign: 'right' }]}>
                          {openRecords[sessionItem._id] ? "Hide ▲" : "Show ▼"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    
                    {/* Collapsible Inner Table */}
                    {openRecords[sessionItem._id] && (
                      <View style={[styles.collapsibleArea, { backgroundColor: theme.background, borderBottomColor: isDarkMode ? "#333" : "#E5E7EB" }]}>
                        <Text style={[styles.recordsTitle, { color: theme.text }]}>Session Records</Text>
                        <View style={[styles.innerTableRow, styles.innerTableHeaderRow, { backgroundColor: theme.card }]}>
                          <Text style={[styles.innerTableHeaderCell, { color: theme.subText }]}>Date</Text>
                          <Text style={[styles.innerTableHeaderCell, { color: theme.subText }]}>Start Time</Text>
                          <Text style={[styles.innerTableHeaderCell, { color: theme.subText }]}>Stop Time</Text>
                          <Text style={[styles.innerTableHeaderCell, { color: theme.subText }]}>Duration</Text>
                        </View>
                        {sessionItem.records.length > 0 ? (
                           sessionItem.records.map((record) => (
                            <View key={record._id} style={[styles.innerTableRow, { borderBottomColor: isDarkMode ? "#222" : "#F3F4F6" }]}>
                              <Text style={[styles.innerTableCell, { color: theme.subText }]}>{formatDateDMY(record.sessionDate)}</Text>
                              <Text style={[styles.innerTableCell, { color: theme.subText }]}>{format12Hour(record.startTime)}</Text>
                              <Text style={[styles.innerTableCell, { color: theme.subText }]}>{format12Hour(record.stopTime) || "-"}</Text>
                              <Text style={[styles.innerTableCell, { color: theme.subText }]}>{record.durationReadable}</Text>
                            </View>
                          ))
                        ) : (
                          <Text style={[styles.noRecordsText, { color: theme.subText }]}>No records found for this session.</Text>
                        )}
                      </View>
                    )}
                  </React.Fragment>
                ))}
              </View>
            )}
          </>
        ) : (
          // --- DAILY ENTRY DATA ---
          <>
            <Text style={[styles.subTitle, { color: theme.text }]}>Your Daily Entries</Text>
            {dailyLoading ? (
              <ActivityIndicator size="large" color="#2563EB" style={{marginTop: 20}} />
            ) : dailyData.length === 0 ? (
              <View style={[styles.card, { backgroundColor: theme.card }]}>
                <Text style={[styles.noSessionsText, { color: theme.subText }]}>No daily entries found.</Text>
              </View>
            ) : (
              <View style={[styles.tableContainer, { backgroundColor: theme.card }]}>
                {/* Table Header */}
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                  <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Date</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Total</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'right' }]}>Amount</Text>
                </View>
                
                {/* Table Body */}
                {dailyData.map((entry) => (
                  <View key={entry._id} style={[styles.tableRow, { borderBottomColor: isDarkMode ? "#333" : "#E5E7EB" }]}>
                    <Text style={[styles.tableCell, styles.boldText, { color: theme.text, flex: 2 }]}>
                      {formatDateDMY(entry.date)}
                    </Text>
                    <Text style={[styles.tableCell, { color: theme.text, flex: 1.5 }]}>
                      {entry.dailyTotal} Tanker
                    </Text>
                    <Text style={[styles.tableCell, styles.boldText, { color: theme.text, flex: 1.5, textAlign: 'right' }]}>
                      ₹{entry.dailyAmount}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles ---
// 4. Stylesheet se hardcoded colors (backgroundColor, color) hata diye.
// Layout (padding, flex, etc.) ko waise hi rehne diya.
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // backgroundColor: "#f3f4f6", // Removed
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  centerScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#f3f4f6", // Removed
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    // color: "#4B5563", // Removed
  },
  errorText: {
    fontSize: 16,
    color: "#DC2626", // Semantic color - kept
    textAlign: 'center',
  },
  header: {
    padding: 20,
    // backgroundColor: '#ffffff', // Removed
    borderRadius: 12,
    marginBottom: 16, 
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
    // color: "#111827", // Removed
    flex: 1, 
  },
  logoutButton: {
    backgroundColor: '#EF4444', // Semantic color - kept
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#ffffff', // Kept (for red button)
    fontWeight: '600',
    fontSize: 14,
  },
  infoBox: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 16,
    // color: "#4B5563", // Removed
    fontWeight: '600',
    marginRight: 5,
  },
  infoValue: {
    fontSize: 16,
    // color: "#1F2937", // Removed
  },
  // --- Filter Button Styles ---
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    // backgroundColor: '#E5E7EB', // Removed
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#2563EB', // Primary color - kept
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    // color: '#374151', // Removed
  },
  activeFilterButtonText: {
    color: '#FFFFFF', // Kept (for blue button)
  },
  // --- End Filter Styles ---
  subTitle: {
    fontSize: 22,
    fontWeight: "600",
    // color: "#111827", // Removed
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  card: {
    //  backgroundColor: '#ffffff', // Removed
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
    // color: "#6B7280", // Removed
  },
  tableContainer: {
    // backgroundColor: "#ffffff", // Removed
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    backgroundColor: "#2563EB", // Primary color - kept
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  tableHeaderCell: {
    color: "#ffffff", // Kept (for blue header)
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
    // borderBottomColor: "#E5E7EB", // Removed
  },
  tableCell: {
    fontSize: 14,
    // color: "#374151", // Removed
  },
  boldText: {
    fontWeight: '600',
  },
  collapsibleArea: {
    // backgroundColor: "#f9fafb", // Removed
    padding: 12,
    borderBottomWidth: 1,
    // borderBottomColor: "#E5E7EB", // Removed
  },
  recordsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    // color: '#111827' // Removed
  },
  innerTableHeaderRow: {
    // backgroundColor: "#E5E7EB", // Removed
    borderRadius: 6,
  },
  innerTableRow: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    // borderBottomColor: "#F3F4F6", // Removed
  },
  innerTableHeaderCell: {
    flex: 1,
    fontWeight: "600",
    fontSize: 13,
    // color: "#374151", // Removed
  },
  innerTableCell: {
    flex: 1,
    fontSize: 13,
    // color: "#4B5563", // Removed
  },
  noRecordsText: {
    textAlign: 'center',
    padding: 10,
    fontSize: 13,
    // color: '#6B7280' // Removed
  }
});
