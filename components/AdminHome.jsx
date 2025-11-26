// AdminHome.jsx

import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  SafeAreaView,
  Easing,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../Context/ThemeContext";

const BASE_URL = "https://saini-record-management.onrender.com";

// === HELPER FUNCTIONS ===
const formatDate = (isoString) => {
  if (!isoString) return "-";
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatCurrency = (amount) => {
  return `₹${amount ? amount.toLocaleString('en-IN') : 0}`;
};

// New Helper: Checks if a date string is "Today" in Local Time
const isToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
};

export default function AdminHome() {
  const navigation = useNavigation();
  const isFocused = useIsFocused(); 
  const { theme, isDarkMode } = useTheme();
  
  // --- Animation Setup ---
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // --- Data States ---
  const [todayStats, setTodayStats] = useState({
    todayDeposit: 0,
    activeSessions: 0,
    dailyEntriesCount: 0,
    dailyEntriesValue: 0
  });
  
  const [depositHistory, setDepositHistory] = useState([]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ]).start();
    
    if (isFocused) {
      fetchDashboardData();
    }
  }, [fadeAnim, slideAnim, isFocused]);

  // --- API CALLS ---
  const fetchDashboardData = async () => {
    if (!refreshing) setLoading(true);
    try {
      const token = await AsyncStorage.getItem("adminToken");
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Deposits
      const resDeposit = await fetch(`${BASE_URL}/deposit/all`, { headers });
      
      // 2. Fetch Daily Entries (Tankers) - Assuming endpoint exists
      // Agar ye endpoint nahi hai to ise try-catch me rakha hai taki app crash na ho
      let tankerData = [];
      try {
          const resDaily = await fetch(`${BASE_URL}/dailyentry/all`, { headers });
          if(resDaily.ok) {
              const d = await resDaily.json();
              tankerData = Array.isArray(d) ? d : (d.data || []);
          }
      } catch(e) { console.log("Daily Entry Fetch Error", e); }

      // 3. Fetch Sessions - Assuming endpoint exists
      let sessionData = [];
      try {
          const resSession = await fetch(`${BASE_URL}/session/all`, { headers });
          if(resSession.ok) {
              const s = await resSession.json();
              sessionData = Array.isArray(s) ? s : (s.data || []);
          }
      } catch(e) { console.log("Session Fetch Error", e); }


      // === PROCESS DEPOSIT DATA ===
      let safeDeposits = [];
      if(resDeposit.ok) {
        const data = await resDeposit.json();
        // Safety check for array
        if (Array.isArray(data)) safeDeposits = data;
        else if (data.data && Array.isArray(data.data)) safeDeposits = data.data;
        else if (data.deposits && Array.isArray(data.deposits)) safeDeposits = data.deposits;
      }
      setDepositHistory(safeDeposits);


      // === CALCULATE TODAY'S STATS (Local Time) ===
      
      // 1. Today's Deposit
      const todaysDepositsList = safeDeposits.filter(d => isToday(d.createdAt));
      const totalDep = todaysDepositsList.reduce((sum, item) => sum + (item.depositAmount || 0), 0);

      // 2. Today's Tankers (Daily Entries)
      const todaysTankers = tankerData.filter(d => isToday(d.date || d.createdAt));
      const totalTankerCount = todaysTankers.length;

      // 3. Active Sessions (Running Now)
      // Check sessions where stopTime is null/undefined
      const activeSess = sessionData.filter(s => !s.stopTime || s.stopTime === null).length;

      setTodayStats({
        todayDeposit: totalDep,
        activeSessions: activeSess,
        dailyEntriesCount: totalTankerCount,
        dailyEntriesValue: 0 // You can calculate value if available
      });

    } catch (error) {
      console.log("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // --- Render Components ---
  const StatCard = ({ title, value, subValue, icon, accentColor }) => (
    <View style={[styles.statCard, { backgroundColor: theme.card, shadowColor: isDarkMode ? "#000" : "#ccc" }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${accentColor}20` }]}> 
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statTitle, { color: theme.subText }]}>{title}</Text>
        <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
        {subValue && <Text style={[styles.statSub, { color: accentColor }]}>{subValue}</Text>}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        
        {/* === HEADER === */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.subText }]}>Hello, Admin 👋</Text>
            <Text style={[styles.title, { color: theme.primary }]}>Dashboard</Text>
          </View>
          <View style={[styles.dateBadge, { backgroundColor: theme.card }]}>
             <Text style={[styles.dateText, { color: theme.text }]}>{formatDate(new Date())}</Text>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.contentArea}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            
            {/* === STATS GRID === */}
            <View style={styles.statsGrid}>
              <StatCard 
                title="Today's Deposit" 
                value={formatCurrency(todayStats.todayDeposit)} 
                icon="💰" 
                accentColor="#10B981" // Emerald
              />
              <StatCard 
                title="Active Sessions" 
                value={todayStats.activeSessions} 
                subValue="Running Now"
                icon="⚡" 
                accentColor="#F59E0B" // Amber
              />
              <StatCard 
                title="Total Tankers" 
                value={todayStats.dailyEntriesCount} 
                subValue="Today's Count"
                icon="🚛" 
                accentColor="#6366F1" // Indigo
              />
              <StatCard 
                title="Pending Due" 
                value="Check" 
                subValue="View All"
                icon="⚠️" 
                accentColor="#EF4444" // Red
              />
            </View>

            {/* === RECENT TRANSACTIONS === */}
            <View style={styles.sectionHeaderRow}>
               <Text style={[styles.sectionHeader, { color: theme.text }]}>Recent Transactions</Text>
               <TouchableOpacity onPress={onRefresh}>
                  <Text style={{color: theme.primary, fontSize: 12, fontWeight: '600'}}>Refresh</Text>
               </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
                 <ActivityIndicator size="large" color={theme.primary} style={{marginTop: 40}} />
            ) : (!depositHistory || depositHistory.length === 0) ? (
                 <View style={[styles.emptyContainer, {backgroundColor: theme.card}]}>
                    <Text style={{fontSize: 40, marginBottom: 10}}>📂</Text>
                    <Text style={[styles.emptyText, {color: theme.subText}]}>No data found</Text>
                    <Text style={{color: theme.subText, fontSize: 10, textAlign:'center', marginTop: 5}}>Check your internet or backend connection</Text>
                 </View>
            ) : (
                <View style={{ paddingBottom: 20 }}>
                  {depositHistory.slice(0, 15).map((dep, index) => (
                    <View key={index} style={[styles.transactionCard, { backgroundColor: theme.card, shadowColor: isDarkMode ? "#000" : "#ddd" }]}>
                        <View style={styles.transLeft}>
                           <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
                              <Text style={styles.avatarText}>
                                {dep.userId?.fullName ? dep.userId.fullName.charAt(0).toUpperCase() : "U"}
                              </Text>
                           </View>
                           <View>
                              <Text style={[styles.transName, { color: theme.text }]}>
                                {dep.userId?.fullName || dep.userName || "Unknown User"}
                              </Text>
                              <Text style={[styles.transDate, { color: theme.subText }]}>
                                {formatDate(dep.createdAt)}
                              </Text>
                           </View>
                        </View>
                        <View style={styles.transRight}>
                           <Text style={styles.transAmount}>+{dep.depositAmount}</Text>
                           <Text style={[styles.transStatus, { color: '#10B981' }]}>Success</Text>
                        </View>
                    </View>
                  ))}
                </View>
            )}

          </Animated.View>
        </ScrollView>

        {/* === FLOATING ACTION BUTTON === */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
          onPress={() => navigation.navigate("userSignup")}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1 },
  container: { flex: 1 },
  
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 15,
  },
  greeting: { fontSize: 14, fontWeight: '500' },
  title: { fontSize: 26, fontWeight: "800", marginTop: 2 },
  dateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 2,
  },
  dateText: { fontSize: 12, fontWeight: '700' },
  
  contentArea: { paddingHorizontal: 20, paddingBottom: 100 },
  
  // Stats Grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25, marginTop: 10 },
  statCard: { 
    width: '48%', 
    padding: 15, 
    borderRadius: 16, 
    marginBottom: 15, 
    elevation: 4, // Android Shadow
    shadowOffset: { width: 0, height: 4 }, // iOS Shadow
    shadowOpacity: 0.1,
    shadowRadius: 6,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  iconContainer: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10
  },
  statTitle: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  statSub: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  // List Section
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionHeader: { fontSize: 18, fontWeight: '700' },

  // Empty State
  emptyContainer: {
    padding: 30, alignItems: 'center', borderRadius: 16,
    borderWidth: 1, borderStyle: 'dashed', borderColor: '#ccc'
  },
  emptyText: { fontSize: 16, fontWeight: '600', marginTop: 10 },

  // Transaction Card (List Item)
  transactionCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderRadius: 16, marginBottom: 12,
    elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4
  },
  transLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarPlaceholder: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center'
  },
  avatarText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  transName: { fontSize: 14, fontWeight: '700' },
  transDate: { fontSize: 12, marginTop: 2 },
  transRight: { alignItems: 'flex-end' },
  transAmount: { fontSize: 16, fontWeight: 'bold', color: '#10B981' },
  transStatus: { fontSize: 10, fontWeight: '600', marginTop: 2, backgroundColor: '#D1FAE5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },

  // FAB (Add Button)
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60, height: 60,
    borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4
  },
  fabText: { fontSize: 30, color: 'white', marginTop: -2 },
});