import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../Context/ThemeContext"; // ✅ Import theme context

// Helper functions
const formatDateDMY = (isoString) => {
  if (!isoString) return "-";
  if (!isoString.includes("T") && !isoString.includes("Z")) {
    const [year, month, day] = isoString.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const d = date.getUTCDate().toString().padStart(2, "0");
    const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const y = date.getUTCFullYear();
    return `${d}/${m}/${y}`;
  }
  const date = new Date(isoString);
  return `${date.getDate().toString().padStart(2, "0")}/${(
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
};

const format12Hour = (isoString) => {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const API_BASE_URL = "https://saini-record-management.onrender.com";

export default function UserDashboard({ navigation }) {
  const { theme, isDarkMode } = useTheme(); // ✅ Use theme
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState([]);
  const [openRecords, setOpenRecords] = useState({});
  const [filterType, setFilterType] = useState("session");
  const [dailyData, setDailyData] = useState([]);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [dailyLoading, setDailyLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) throw new Error("Token not found");

        const res = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || !data.user) throw new Error("User not found");

        setUser(data.user);
      } catch (err) {
        console.error("Fetch user error:", err);
        await AsyncStorage.removeItem("token");
        navigation.reset({ index: 0, routes: [{ name: "userLogin" }] });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigation]);

  const fetchSession = async (userId) => {
    setSessionLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/session/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSession(data.session || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSessionLoading(false);
    }
  };

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
      console.error(err);
    } finally {
      setDailyLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      if (filterType === "session") fetchSession(user._id);
      else fetchDailyData(user._id);
    }
  }, [user, filterType]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          navigation.reset({ index: 0, routes: [{ name: "userLogin" }] });
        },
      },
    ]);
  };

  const toggleRecords = (sessionId) => {
    setOpenRecords((prev) => ({ ...prev, [sessionId]: !prev[sessionId] }));
  };

  if (loading)
    return (
      <SafeAreaView
        style={[styles.centerScreen, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Loading...
        </Text>
      </SafeAreaView>
    );

  if (!user)
    return (
      <SafeAreaView
        style={[styles.centerScreen, { backgroundColor: theme.background }]}
      >
        <Text style={[styles.errorText, { color: theme.text }]}>
          Loading failed. Redirecting...
        </Text>
        <ActivityIndicator size="small" color={theme.icon} />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.headerTopRow}>
            <Text style={[styles.title, { color: theme.text }]}>
              Welcome, {user.fullName}
            </Text>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoBox}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Email:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {user.email}
            </Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Phone:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {user.phone}
            </Text>
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {["session", "daily"].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setFilterType(type)}
              style={[
                styles.filterButton,
                {
                  backgroundColor:
                    filterType === type ? theme.primary : theme.card,
                },
              ]}
            >
              <Text
                style={{
                  color: filterType === type ? "#fff" : theme.text,
                  fontWeight: "600",
                }}
              >
                {type === "session" ? "Session Data" : "Daily Entry Data"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Data Tables */}
        {filterType === "session" ? (
          <>
            <Text style={[styles.subTitle, { color: theme.text }]}>
              Your Sessions
            </Text>
            {sessionLoading ? (
              <ActivityIndicator size="large" color={theme.primary} />
            ) : session.length === 0 ? (
              <Text style={[styles.noSessionsText, { color: theme.textSecondary }]}>
                No sessions yet.
              </Text>
            ) : (
              session.map((sessionItem) => (
                <View
                  key={sessionItem._id}
                  style={[styles.card, { backgroundColor: theme.card }]}
                >
                  <TouchableOpacity onPress={() => toggleRecords(sessionItem._id)}>
                    <Text style={{ color: theme.text }}>
                      Session #{sessionItem.sessionNo} - ₹{sessionItem.totalCost}
                    </Text>
                  </TouchableOpacity>
                  {openRecords[sessionItem._id] && (
                    <View>
                      {sessionItem.records.map((record) => (
                        <Text
                          key={record._id}
                          style={{ color: theme.textSecondary }}
                        >
                          {formatDateDMY(record.sessionDate)} -{" "}
                          {record.durationReadable}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))
            )}
          </>
        ) : (
          <>
            <Text style={[styles.subTitle, { color: theme.text }]}>
              Your Daily Entries
            </Text>
            {dailyLoading ? (
              <ActivityIndicator size="large" color={theme.primary} />
            ) : dailyData.length === 0 ? (
              <Text style={[styles.noSessionsText, { color: theme.textSecondary }]}>
                No daily entries found.
              </Text>
            ) : (
              dailyData.map((entry) => (
                <View
                  key={entry._id}
                  style={[styles.card, { backgroundColor: theme.card }]}
                >
                  <Text style={{ color: theme.text }}>
                    {formatDateDMY(entry.date)} — ₹{entry.dailyAmount}
                  </Text>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 16 },
  centerScreen: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "700" },
  logoutButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: { color: "#fff", fontWeight: "600" },
  infoBox: { flexDirection: "row", marginBottom: 4 },
  infoLabel: { fontSize: 15, fontWeight: "500" },
  infoValue: { fontSize: 15 },
  filterContainer: { flexDirection: "row", gap: 10, marginBottom: 20 },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  subTitle: { fontSize: 20, fontWeight: "600", marginBottom: 10 },
  card: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
  },
  noSessionsText: { textAlign: "center", fontSize: 15, marginTop: 10 },
});
