import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert, // Alert import zaroori hai notification ke liye
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  LayoutAnimation, // Smooth animation ke liye (Optional but good)
  Platform,
  UIManager
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../Context/ThemeContext";
import { LogOut, Phone, Calendar, ChevronDown, ChevronUp, Sun, Moon, Wallet } from "lucide-react-native";

const API_BASE_URL = "https://saini-record-management.onrender.com";

// Android par LayoutAnimation enable karne ke liye
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Helper Functions ---
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

export default function HomeScreen({ navigation }) {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  // --- State ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Deposit State
  const [deposits, setDeposits] = useState([]);
  const [loadingDeposits, setLoadingDeposits] = useState(false);
  const [showAllDeposits, setShowAllDeposits] = useState(false); // Ye toggle karega

  // Records State (Session/Daily)
  const [filterType, setFilterType] = useState("session");
  const [session, setSession] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [openRecords, setOpenRecords] = useState({}); 

  // --- Fetch User Data ---
  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const storedUserId = await AsyncStorage.getItem("userId");

      if (!token || !storedUserId) {
        setLoading(false);
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        return;
      }

      const res = await fetch(`${API_BASE_URL}/users/${storedUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (res.ok && data) {
        const userData = data.user || data;
        setUser(userData);
        fetchDepositHistory(userData._id);
        if (filterType === 'session') fetchSession(userData._id);
        else fetchDailyData(userData._id);
      } else {
        await AsyncStorage.clear();
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      }
    } catch (err) {
      console.error("User fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepositHistory = async (userId) => {
    const token = await AsyncStorage.getItem("userToken");
    setLoadingDeposits(true);
    try {
      const res = await fetch(`${API_BASE_URL}/deposit/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) setDeposits(data || []);
    } catch (e) {
      console.error("Deposit fetch error", e);
    } finally {
      setLoadingDeposits(false);
    }
  };

  const fetchSession = async (userId) => {
    setLoadingRecords(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const res = await fetch(`${API_BASE_URL}/session/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSession(data.session || []);
    } catch (err) {
      console.error("Session fetch error:", err);
    } finally {
      setLoadingRecords(false);
    }
  };

  const fetchDailyData = async (userId) => {
    setLoadingRecords(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
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
      console.error("Daily fetch error:", err);
    } finally {
      setLoadingRecords(false);
    }
  };

  const toggleRecords = (sessionId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Animation
    setOpenRecords((prev) => ({ ...prev, [sessionId]: !prev[sessionId] }));
  };

  // --- Toggle Deposit View ---
  const toggleDepositView = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Smooth expand animation
    setShowAllDeposits(!showAllDeposits);
  };

  useEffect(() => {
    if (user?._id) {
      if (filterType === "session") fetchSession(user._id);
      else fetchDailyData(user._id);
    }
  }, [filterType, user]);

  useEffect(() => {
    fetchUser();
  }, []);

  // --- LOGOUT CONFIRMATION LOGIC ---
  const handleLogoutPress = () => {
    Alert.alert(
      "Confirm Logout", // Title
      "Are you sure you want to log out?", // Message
      [
        {
          text: "Cancel",
          onPress: () => console.log("Logout Cancelled"),
          style: "cancel"
        },
        { 
          text: "Yes, Logout", 
          onPress: performLogout,
          style: "destructive" // iOS pe red color dega
        }
      ]
    );
  };

  const performLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userId");
      navigation.reset({ index: 0, routes: [{ name: "homeScreen" }] });
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.text, marginTop: 10 }}>Loading Profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>User not found.</Text>
      </View>
    );
  }

  // Logic: Agar showAllDeposits false hai to sirf first 2 dikhao, varna sab
  const displayedDeposits = showAllDeposits ? deposits : deposits.slice(0, 2);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      
      {/* --- HEADER --- */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.appName, { color: theme.primary }]}>Saini Record Manager</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Dashboard Overview</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={toggleTheme} 
            style={[styles.iconBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            {isDarkMode ? 
              <Sun size={20} color="#FDB813" /> : 
              <Moon size={20} color="#6B7280" />
            }
          </TouchableOpacity>

          {/* Logout Button pe ab handleLogoutPress function hai */}
          <TouchableOpacity onPress={handleLogoutPress} style={[styles.iconBtn, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
            <LogOut size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* --- 1. USER GREETING & SUMMARY --- */}
        <View style={[styles.card, styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <Text style={styles.avatarText}>
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
            <View>
                <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>Welcome back,</Text>
                <Text style={[styles.userName, { color: theme.text }]}>{user.fullName}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.metaInfoRow}>
             <View style={styles.metaItem}>
                <Phone size={14} color={theme.textSecondary} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>{user.phone || "N/A"}</Text>
             </View>
             <View style={styles.metaItem}>
                <Calendar size={14} color={theme.textSecondary} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>{user.createdAt ? formatDateDMY(user.createdAt) : "-"}</Text>
             </View>
          </View>
        </View>

        {/* --- 2. PENDING AMOUNT --- */}
        <View style={[styles.balanceCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
           <View style={styles.balanceHeader}>
             <View style={styles.balanceIconBg}>
                <Wallet size={20} color="#DC2626" />
             </View>
             <Text style={styles.balanceLabel}>Pending Dues</Text>
           </View>
           <Text style={styles.balanceValue}>₹{user.pendingAmount || 0}</Text>
        </View>

        {/* --- 3. DEPOSIT HISTORY (UPDATED) --- */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
             <Text style={[styles.sectionHeading, { color: theme.text }]}>Recent Deposits</Text>
             {/* Header wala View All hata diya hai, ab niche dikhega */}
          </View>

          {loadingDeposits ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : deposits.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
              <Text style={{ color: theme.textSecondary }}>No deposits yet.</Text>
            </View>
          ) : (
            <View style={[styles.listContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
              
              {/* List of Deposits */}
              {displayedDeposits.map((item, index) => (
                <View key={item._id || index} style={[styles.listItem, index !== displayedDeposits.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: 1 }]}>
                  <View style={styles.listItemLeft}>
                      <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#064E3B' : '#ECFDF5' }]}>
                        <Text style={{fontSize: 12, color: '#10B981'}}>₹</Text>
                      </View>
                      <View>
                        <Text style={[styles.listMainText, { color: theme.text }]}>Deposit</Text>
                        <Text style={[styles.listSubText, { color: theme.textSecondary }]}>{formatDateDMY(item.createdAt)}</Text>
                      </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.amountText, { color: '#10B981' }]}>+ ₹{item.depositAmount}</Text>
                    {item.discountAmount > 0 && <Text style={{ fontSize: 10, color: '#F59E0B' }}>Disc: ₹{item.discountAmount}</Text>}
                  </View>
                </View>
              ))}

              {/* View All Button inside the card at the bottom */}
              {deposits.length > 2 && (
                <TouchableOpacity 
                    onPress={toggleDepositView} 
                    style={[styles.cardFooterBtn, { borderTopColor: theme.border, borderTopWidth: 1 }]}
                >
                  <Text style={[styles.viewMoreText, { color: theme.primary }]}>
                    {showAllDeposits ? "Show Less" : `View All (${deposits.length - 2} more)`}
                  </Text>
                  {showAllDeposits ? <ChevronUp size={16} color={theme.primary}/> : <ChevronDown size={16} color={theme.primary}/>}
                </TouchableOpacity>
              )}

            </View>
          )}
        </View>

        {/* --- 4. MY RECORDS --- */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeading, { color: theme.text }]}>Work Records</Text>
          
          <View style={[styles.toggleContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TouchableOpacity 
              onPress={() => setFilterType("session")} 
              style={[styles.toggleBtn, filterType === "session" && { backgroundColor: theme.primary }]}
            >
              <Text style={[styles.toggleText, { color: filterType === "session" ? "#fff" : theme.text }]}>Sessions</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setFilterType("daily")} 
              style={[styles.toggleBtn, filterType === "daily" && { backgroundColor: theme.primary }]}
            >
              <Text style={[styles.toggleText, { color: filterType === "daily" ? "#fff" : theme.text }]}>Daily Entries</Text>
            </TouchableOpacity>
          </View>

          {/* Table Data */}
          <View style={[styles.tableWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {loadingRecords ? (
               <View style={{ padding: 40 }}>
                 <ActivityIndicator size="small" color={theme.primary} />
               </View>
            ) : filterType === "session" ? (
              // SESSION DATA
              session.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No session records found.</Text>
              ) : (
                session.map((item, index) => (
                  <View key={item._id} style={index !== session.length -1 ? { borderBottomWidth: 1, borderBottomColor: theme.border } : {}}>
                     <TouchableOpacity onPress={() => toggleRecords(item._id)} style={styles.recordRow}>
                        <View style={{ flex: 1 }}>
                           <Text style={[styles.recordDate, { color: theme.text }]}>{formatDateDMY(item.startTime)}</Text>
                           <Text style={[styles.recordSub, { color: theme.textSecondary }]}>{item.totalDurationReadable}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                           <Text style={[styles.recordAmount, { color: theme.text }]}>₹{item.totalCost}</Text>
                           <Text style={{ fontSize: 10, color: theme.primary }}>{openRecords[item._id] ? "Hide Details" : "View Details"}</Text>
                        </View>
                     </TouchableOpacity>
                     
                     {openRecords[item._id] && (
                       <View style={[styles.expandedDetails, { backgroundColor: isDarkMode ? '#1f2937' : '#F8FAFC' }]}>
                          {item.records?.map(r => (
                             <View key={r._id} style={styles.detailRow}>
                                <Text style={{ fontSize: 12, color: theme.textSecondary, flex: 1 }}>
                                   {/* DATE + TIME */}
                                   <Text style={{fontWeight: '600'}}>{formatDateDMY(r.sessionDate)}</Text> • {format12Hour(r.startTime)} - {r.stopTime ? format12Hour(r.stopTime) : '...'}
                                </Text>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: theme.text }}>{r.durationReadable}</Text>
                             </View>
                          ))}
                       </View>
                     )}
                  </View>
                ))
              )
            ) : (
              // DAILY DATA
              dailyData.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No daily entries found.</Text>
              ) : (
                dailyData.map((item, index) => (
                  <View key={item._id} style={[styles.recordRow, index !== dailyData.length -1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                     <View style={{ flex: 1 }}>
                        <Text style={[styles.recordDate, { color: theme.text }]}>{formatDateDMY(item.date)}</Text>
                        <Text style={[styles.recordSub, { color: theme.textSecondary }]}>{item.dailyTotal} Tankers</Text>
                     </View>
                     <Text style={[styles.recordAmount, { color: theme.text }]}>₹{item.dailyAmount}</Text>
                  </View>
                ))
              )
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            © {new Date().getFullYear()} Saini Record Manager
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  
  // Profile Card
  profileCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    opacity: 0.3,
    marginVertical: 15,
  },
  metaInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Hero Balance Card
  balanceCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  balanceIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FECACA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  balanceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#DC2626',
  },

  // Sections
  sectionContainer: {
    marginBottom: 25,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
  },
  
  // List Styles
  listContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listMainText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listSubText: {
    fontSize: 12,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },

  // View All Button (Footer style)
  cardFooterBtn: {
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  viewMoreText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Toggle & Records
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 15,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tableWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  recordRow: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordDate: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  recordSub: {
    fontSize: 12,
  },
  recordAmount: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  expandedDetails: {
    padding: 16,
    paddingTop: 0,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyText: {
    padding: 30,
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 13,
  },

  footer: {
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.6,
  },
});