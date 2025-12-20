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
  Platform,
  LayoutAnimation,
  UIManager
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";

const BASE_URL = "https://water-record-management-system-back.vercel.app";

// Android Layout Animation Enable
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// === HELPER FUNCTIONS ===
const formatDate = (isoString) => {
  if (!isoString) return "-";
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatCurrency = (amount) => {
  return `₹${amount ? amount.toLocaleString('en-IN') : 0}`;
};

const isToday = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();

  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

export default function AdminOverviewScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { theme, isDarkMode } = useTheme();

  // --- Animation Setup ---
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [adminRole, setAdminRole] = useState(null);

  // --- Toggle States for View All ---
  const [expandTankers, setExpandTankers] = useState(false);
  const [expandSessions, setExpandSessions] = useState(false);
  const [expandDeposits, setExpandDeposits] = useState(false);

  // --- Data States ---
  const [todayStats, setTodayStats] = useState({
    todayDeposit: 0,
    activeSessions: 0,
    todaySessionCost: 0,
    dailyEntriesCount: 0,
    dailyEntriesValue: 0
  });

  const [depositHistory, setDepositHistory] = useState([]);
  const [tankerList, setTankerList] = useState([]);
  const [sessionList, setSessionList] = useState([]);

  // --- Animation Effect ---
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
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchDashboardData();
    }
  }, [isFocused]);

  // --- TOGGLE FUNCTION WITH ANIMATION ---
  const toggleSection = (section) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (section === 'tankers') setExpandTankers(!expandTankers);
    if (section === 'sessions') setExpandSessions(!expandSessions);
    if (section === 'deposits') setExpandDeposits(!expandDeposits);
  };

  // --- API CALLS (UNCHANGED) ---
  const fetchDashboardData = async () => {
    if (!refreshing) setLoading(true);
    try {
      const token = await AsyncStorage.getItem("adminToken");
      const role = await AsyncStorage.getItem("adminRole");
      setAdminRole(role);
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Deposits
      const resDeposit = await fetch(`${BASE_URL}/deposit/all`, { headers });

      // 2. Fetch Daily Entries
      let calculatedTankerCount = 0;
      let calculatedTankerValue = 0;
      let todaysTankersData = [];
      try {
        const resDaily = await fetch(`${BASE_URL}/dailyentry/today/all`, { headers });
        if (resDaily.ok) {
          const d = await resDaily.json();
          if (d.data && Array.isArray(d.data)) {
            todaysTankersData = d.data;
            todaysTankersData.forEach(userRecord => {
              if (userRecord.totalValue) calculatedTankerCount += userRecord.totalValue;
              if (userRecord.totalAmount) calculatedTankerValue += userRecord.totalAmount;
            });
          }
        }
      } catch (e) { console.log("Daily Entry Fetch Error", e); }
      setTankerList(todaysTankersData);

      // 3. Fetch Sessions
      let todaySessionCount = 0;
      let totalSessionCost = 0;
      let todaysSessionsData = [];
      try {
        const resSession = await fetch(`${BASE_URL}/session/today/all`, { headers });
        if (resSession.ok) {
          const s = await resSession.json();
          if (s.success) {
            todaysSessionsData = s.data || [];
            todaySessionCount = s.finalDuration;
            totalSessionCost = s.totalCost || 0;
          }
        }
      } catch (e) { console.log("Session Fetch Error", e); }
      setSessionList(todaysSessionsData);

      // 4. Process Deposits
      let safeDeposits = [];
      if (resDeposit.ok) {
        const data = await resDeposit.json();
        if (data.success && Array.isArray(data.deposits)) {
          safeDeposits = data.deposits;
        } else if (Array.isArray(data)) {
          safeDeposits = data;
        }
      }
      setDepositHistory(safeDeposits);

      // 5. Calculate Stats
      const todaysDepositsList = safeDeposits.filter(d => isToday(d.createdAt));
      const totalDep = todaysDepositsList.reduce((sum, item) => sum + (item.depositAmount || 0), 0);

      setTodayStats({
        todayDeposit: totalDep,
        activeSessions: todaySessionCount,
        todaySessionCost: totalSessionCost,
        dailyEntriesCount: calculatedTankerCount,
        dailyEntriesValue: calculatedTankerValue
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

  // --- NEW COMPACT STAT CARD ---
  const CompactStatCard = ({ title, value, icon, color, subValue, isPrimary }) => (
    <View style={[
      styles.compactCard,
      {
        backgroundColor: isPrimary ? color : theme.card,
        borderColor: isPrimary ? color : theme.border,
        shadowColor: color
      }
    ]}>
      <View style={styles.compactCardHeader}>
        <View style={[
          styles.compactIconBox,
          { backgroundColor: isPrimary ? 'rgba(255,255,255,0.2)' : color + '15' }
        ]}>
          <Text style={{ fontSize: 18 }}>{icon}</Text>
        </View>
        {subValue && (
          <View style={[styles.compactBadge, { backgroundColor: isPrimary ? 'rgba(255,255,255,0.2)' : theme.background }]}>
            <Text style={[styles.compactBadgeText, { color: isPrimary ? '#fff' : theme.text }]}>{subValue}</Text>
          </View>
        )}
      </View>
      <View style={{ marginTop: 8 }}>
        <Text style={[styles.compactValue, { color: isPrimary ? '#fff' : theme.text }]}>{value}</Text>
        <Text style={[styles.compactTitle, { color: isPrimary ? 'rgba(255,255,255,0.8)' : theme.subText }]}>{title}</Text>
      </View>
    </View>
  );

  const SectionHeader = ({ title, expanded, onPress }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.sectionHeaderRow}>
      <Text style={[styles.sectionHeader, { color: theme.text }]}>{title}</Text>
      <View style={[styles.viewAllBtn, { backgroundColor: expanded ? theme.primary : theme.card }]}>
        <Text style={{ color: expanded ? '#fff' : theme.primary, fontSize: 11, fontWeight: '700' }}>
          {expanded ? "Show Less ▲" : "View All ▼"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />

      <View style={[styles.container, { backgroundColor: theme.background }]}>

        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.logoBox}>
              <Text style={styles.logoLetter}>S</Text>
            </View>
            <View>
              <Text style={[styles.greeting, { color: theme.subText }]}>Hello, Admin 👋</Text>
              <Text style={[styles.title, { color: theme.text }]}>Overview</Text>
            </View>
          </View>
          <View style={[styles.dateBadge, { backgroundColor: theme.card }]}>
            <Text style={[styles.dateText, { color: theme.primary }]}>{formatDate(new Date())}</Text>
          </View>
        </View>

        {/* === SUPER ADMIN ACTION === */}
        {adminRole === 'superadmin' && (
          <View style={{ paddingHorizontal: 20, marginBottom: 15 }}>
            <TouchableOpacity
              style={[styles.createAdminBtn, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate("createAdmin")}
            >
              <Text style={styles.createAdminText}>+ Create New Admin</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.contentArea}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* === NEW COMPACT STATS GRID === */}
            <View style={styles.statsGrid}>
              {/* Full Width Main Card */}
              <View style={{ marginBottom: 12 }}>
                <CompactStatCard
                  title="Today's Deposit"
                  value={formatCurrency(todayStats.todayDeposit)}
                  icon="💰"
                  color="#10B981"
                  isPrimary={true}
                />
              </View>

              {/* Two Columns Row */}
              <View style={styles.statsRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <CompactStatCard
                    title="Sessions Cost"
                    value={formatCurrency(todayStats.todaySessionCost)}
                    subValue={`${todayStats.activeSessions}`}
                    icon="⚡"
                    color="#F59E0B"
                    isPrimary={false}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <CompactStatCard
                    title="Tankers Value"
                    value={formatCurrency(todayStats.dailyEntriesValue)}
                    subValue={`${todayStats.dailyEntriesCount}`}
                    icon="🚛"
                    color="#6366F1"
                    isPrimary={false}
                  />
                </View>
              </View>
            </View>

            {/* === SECTION 1: TANKERS === */}
            <SectionHeader
              title="Today's Tankers"
              expanded={expandTankers}
              onPress={() => toggleSection('tankers')}
            />

            {/* Logic: If expandTankers is true, show ALL, else show slice(0,2) */}
            {(!tankerList || tankerList.length === 0) ? (
              <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={{ fontSize: 20 }}>🚛</Text>
                <Text style={[styles.emptyText, { color: theme.subText }]}>No Data</Text>
              </View>
            ) : (
              <View style={{ paddingBottom: 10 }}>
                {(expandTankers ? tankerList : tankerList.slice(0, 2)).map((item, index) => (
                  <View key={index} style={[styles.transactionCard, { backgroundColor: theme.card, shadowColor: "#000" }]}>
                    <View style={styles.transLeft}>
                      <View style={[styles.avatarPlaceholder, { backgroundColor: '#6366F1' }]}>
                        <Text style={styles.avatarText}>{item.name ? item.name.charAt(0).toUpperCase() : "T"}</Text>
                      </View>
                      <View>
                        <Text style={[styles.transName, { color: theme.text }]}>{item.name}</Text>
                        <Text style={[styles.transDate, { color: theme.subText }]}>{item.totalValue} Tankers</Text>
                      </View>
                    </View>
                    <Text style={[styles.transAmount, { color: '#6366F1' }]}>{formatCurrency(item.totalAmount)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* === SECTION 2: SESSIONS === */}
            <SectionHeader
              title="Today's Sessions"
              expanded={expandSessions}
              onPress={() => toggleSection('sessions')}
            />

            {(!sessionList || sessionList.length === 0) ? (
              <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={{ fontSize: 20 }}>⚡</Text>
                <Text style={[styles.emptyText, { color: theme.subText }]}>No Data</Text>
              </View>
            ) : (
              <View style={{ paddingBottom: 10 }}>
                {(expandSessions ? sessionList : sessionList.slice(0, 2)).map((item, index) => (
                  <View key={index} style={[styles.transactionCard, { backgroundColor: theme.card, shadowColor: "#000" }]}>
                    <View style={styles.transLeft}>
                      <View style={[styles.avatarPlaceholder, { backgroundColor: '#F59E0B' }]}>
                        <Text style={styles.avatarText}>{item.userName ? item.userName.charAt(0).toUpperCase() : "S"}</Text>
                      </View>
                      <View>
                        <Text style={[styles.transName, { color: theme.text }]}>{item.userName}</Text>
                        <Text style={[styles.transDate, { color: theme.subText }]}>{item.totalDuration || "0 min"}</Text>
                      </View>
                    </View>
                    <Text style={[styles.transAmount, { color: '#F59E0B' }]}>{formatCurrency(item.cost)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* === SECTION 3: DEPOSITS === */}
            <SectionHeader
              title="Recent Deposits"
              expanded={expandDeposits}
              onPress={() => toggleSection('deposits')}
            />

            {loading && !refreshing ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (!depositHistory || depositHistory.length === 0) ? (
              <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={{ fontSize: 20 }}>📂</Text>
                <Text style={[styles.emptyText, { color: theme.subText }]}>No Data</Text>
              </View>
            ) : (
              <View style={{ paddingBottom: 20 }}>
                {(expandDeposits ? depositHistory : depositHistory.slice(0, 2)).map((dep, index) => (
                  <View key={index} style={[styles.transactionCard, { backgroundColor: theme.card, shadowColor: "#000" }]}>
                    <View style={styles.transLeft}>
                      <View style={[styles.avatarPlaceholder, { backgroundColor: '#10B981' }]}>
                        <Text style={styles.avatarText}>{dep.userId?.name ? dep.userId.name.charAt(0).toUpperCase() : "D"}</Text>
                      </View>
                      <View>
                        <Text style={[styles.transName, { color: theme.text }]}>{dep.userId?.fullName || "User"}</Text>
                        <Text style={[styles.transDate, { color: theme.subText }]}>{formatDate(dep.createdAt)}</Text>
                      </View>
                    </View>
                    <Text style={[styles.transAmount, { color: '#10B981' }]}>+{dep.depositAmount}</Text>
                  </View>
                ))}
              </View>
            )}

          </Animated.View>
        </ScrollView>
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
    paddingTop: Platform.OS === 'android' ? 25 : 10,
    paddingBottom: 15,
  },
  greeting: { fontSize: 12, fontWeight: '600', opacity: 0.7, marginBottom: 2 },
  title: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  dateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  dateText: { fontSize: 12, fontWeight: '700' },

  contentArea: { paddingHorizontal: 20, paddingBottom: 80 },

  // === NEW COMPACT STATS STYLES ===
  statsGrid: { marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  compactCard: {
    padding: 16,
    borderRadius: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1, // Subtle border
  },
  compactCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6
  },
  compactIconBox: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center'
  },
  compactBadge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6
  },
  compactBadgeText: { fontSize: 10, fontWeight: '700' },
  compactValue: { fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
  compactTitle: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  // Section Header
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 24,
    paddingVertical: 5
  },
  sectionHeader: { fontSize: 17, fontWeight: '700' },
  viewAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  // Empty State (Compact)
  emptyContainer: {
    padding: 15, alignItems: 'center', borderRadius: 12,
    borderWidth: 1, borderStyle: 'dashed', marginBottom: 10,
    flexDirection: 'row', justifyContent: 'center', gap: 10
  },
  emptyText: { fontSize: 14, fontWeight: '500' },

  // Transaction Card (Compact)
  transactionCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderRadius: 16, marginBottom: 12,
    elevation: 2, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3
  },
  transLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarPlaceholder: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center'
  },
  avatarText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  transName: { fontSize: 14, fontWeight: '700' },
  transDate: { fontSize: 11, marginTop: 1 },
  transAmount: { fontSize: 15, fontWeight: 'bold' },

  // Create Admin Button
  createAdminBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createAdminText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // --- Logo Styles ---
  logoBox: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#0B1C38', // Brand NAVY
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#0B1C38',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  logoLetter: {
    fontSize: 28,
    fontWeight: '900',
    color: '#BFA15F', // Brand GOLD
    marginBottom: 2,
  },
});