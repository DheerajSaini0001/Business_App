// AdminHome.jsx (UserDetail Logic)

import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const BASE_URL = "https://saini-record-management.onrender.com";
const COST_PER_HOUR = 150;

// === COLOR PALETTE ===
const COLORS = {
  primary: "#4F46E5", // Indigo
  background: "#F3F4F6", // Light Gray
  card: "#FFFFFF",
  text: "#1F2937", // Dark Gray
  subText: "#6B7280",
  success: "#10B981", // Emerald
  danger: "#EF4444", // Red
  warning: "#F59E0B", // Amber
  border: "#E5E7EB",
  inputBg: "#F9FAFB",
};

// === HELPER FUNCTIONS ===
const format12Hour = (isoString) => {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleTimeString([], {
    hour: "numeric", minute: "2-digit", hour12: true,
  });
};

const formatDateDMY = (isoString) => {
  if (!isoString) return "-";
  const date = new Date(isoString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function UserDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const initialUser = route.params?.user || {};

  const [user, setUser] = useState(initialUser);
  const [session, setSession] = useState([]);
  const [records, setRecords] = useState([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [loading, setLoading] = useState(false); // Added loading state
  
  // Edit States
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editStartTime, setEditStartTime] = useState("");
  const [editStopTime, setEditStopTime] = useState("");
  
  // Add New States
  const [newStartTime, setNewStartTime] = useState(new Date());
  const [newStopTime, setNewStopTime] = useState(new Date());

  // Picker States
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date'); 
  const [activeTimeField, setActiveTimeField] = useState(null); 

  const [openSession, setOpenSession] = useState({});
  const [filterType, setFilterType] = useState("session");
  const [dailyData, setDailyData] = useState({ days: [] }); // Initialized safely
  
  const [manualDate, setManualDate] = useState(new Date());
  const [manualTotal, setManualTotal] = useState("");
  const [manualAmount, setManualAmount] = useState("");

  const [editingDailyId, setEditingDailyId] = useState(null);
  const [editDailyDate, setEditDailyDate] = useState("");
  const [editDailyTotal, setEditDailyTotal] = useState("");
  const [editDailyAmount, setEditDailyAmount] = useState("");
  
  const [depositAmount, setDepositAmount] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [message, setMessage] = useState("");
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [deposits, setDeposits] = useState([]);
  const [showDepositHistory, setShowDepositHistory] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showManualFormSession, setShowManualFormSession] = useState(false);

  const [openDaily, setOpenDaily] = useState({});

  // === HANDLERS ===
  const handleShowPicker = (mode, field) => {
    setPickerMode(mode);
    setActiveTimeField(field);
    setShowPicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowPicker(false);
    
    if (selectedDate) {
      if (activeTimeField === 'daily') {
          setManualDate(selectedDate);
      } else if (activeTimeField === 'start') {
        const current = newStartTime || new Date();
        const newDate = new Date(current);
        if (pickerMode === 'date') newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        else newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
        setNewStartTime(newDate);
      } else if (activeTimeField === 'stop') {
        const current = newStopTime || new Date();
        const newDate = new Date(current);
        if (pickerMode === 'date') newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        else newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
        setNewStopTime(newDate);
      } else if (activeTimeField === 'editStart') {
         const current = editStartTime ? new Date(editStartTime) : new Date();
         const newDate = new Date(current);
         if (pickerMode === 'date') newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
         else newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
         setEditStartTime(newDate.toISOString());
      } else if (activeTimeField === 'editStop') {
         const current = editStopTime ? new Date(editStopTime) : new Date();
         const newDate = new Date(current);
         if (pickerMode === 'date') newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
         else newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
         setEditStopTime(newDate.toISOString());
      }
    }
  };

  const fetchUser = async () => {
    if (!user?._id) return;
    try {
      const token = await AsyncStorage.getItem("adminToken");
      const res = await fetch(`${BASE_URL}/admin/users/${user._id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
      }
    } catch (err) { console.warn(err); }
  };

  // --- UPDATED FETCH SESSION (Added Token) ---
  const fetchSession = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("adminToken"); // Token retrieve kiya
      const res = await fetch(`${BASE_URL}/session/${user._id}`, {
        headers: { "Authorization": `Bearer ${token}` } // Header add kiya
      });
      const data = await res.json();
      
      const sessionData = data.session || [];
      setSession(sessionData);

      const allRecords = [];
      sessionData.forEach((session) => {
        (session.records || []).forEach((r) => {
          let durationReadable = "-";
          let durationDecimal = 0;
          let cost = 0;
          if (r.startTime && r.stopTime) {
            const diffMs = new Date(r.stopTime) - new Date(r.startTime);
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            durationReadable = `${hours}h ${minutes}m`;
            durationDecimal = hours + minutes / 60;
            cost = durationDecimal * COST_PER_HOUR;
          }
          allRecords.push({ ...r, sessionId: session._id, durationReadable, durationDecimal, cost });
        });
      });
      allRecords.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setRecords(allRecords);
      const running = allRecords.find((r) => !r.stopTime);
      setTimerRunning(!!running);
    } catch (err) { 
        console.error("Session Fetch Error:", err); 
    } finally {
        setLoading(false);
    }
  };

  // --- UPDATED FETCH DAILY (Added Token) ---
  const fetchDailyData = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("adminToken"); // Token retrieve kiya
      const res = await fetch(`${BASE_URL}/dailyentry/${user._id}`, {
        headers: { "Authorization": `Bearer ${token}` } // Header add kiya
      });
      const data = await res.json();
      // Ensure we set a valid object structure
      setDailyData(data.data || { days: [] });
    } catch (err) { 
        console.error("Daily Fetch Error:", err); 
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if(user?._id) {
        fetchUser(); 
        if (filterType === "session") fetchSession();
        else fetchDailyData();
    }
  }, [user?._id, filterType]);

  const toggleSession = (sessionId) => setOpenSession((prev) => ({ ...prev, [sessionId]: !prev[sessionId] }));
  const toggleDaily = (dayId) => setOpenDaily((prev) => ({ ...prev, [dayId]: !prev[dayId] }));

  // ... (Baaki handlers same hain, unme headers already the) ...
  const handleAddSession = async () => { 
    try {
        const token = await AsyncStorage.getItem("adminToken");
        const res = await fetch(`${BASE_URL}/session/start/${user._id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) { 
            Alert.alert("Success", "Session Started!"); 
            fetchSession(); 
            await fetchUser();
        }
      } catch (err) { Alert.alert("Error", "Network error"); }
  };

  const handleEndSession = async () => {
    const token = await AsyncStorage.getItem("adminToken");
    const runningSession = session.find((s) => !s.stopTime);
    if (!runningSession) return Alert.alert("Info", "No running session.");
    try {
      const res = await fetch(`${BASE_URL}/session/end/${runningSession._id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { 
          Alert.alert("Success", "Session Ended!"); 
          fetchSession(); 
          await fetchUser();
      }
    } catch (err) { Alert.alert("Error", "Network error"); }
   };

  const handleStartRecord = async () => {
    const token = await AsyncStorage.getItem("adminToken");
    if (timerRunning) return;
    const runningSession = session.find((s) => !s.stopTime);
    if (!runningSession) return Alert.alert("Info", "Start session first.");
    try {
      const res = await fetch(`${BASE_URL}/session/addRecord/${runningSession._id}`, {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ startTime: new Date().toISOString() }),
      });
      if (res.ok) { 
        Alert.alert("Success", "Timer Started!"); 
          fetchSession(); 
          await fetchUser(); 
      }
    } catch (err) { console.error(err); }
   };

  const handleStopRecord = async () => {
    const token = await AsyncStorage.getItem("adminToken");
    const runningSession = session.find((s) => !s.stopTime);
    if (!runningSession) return Alert.alert("Info", "No active session.");
    const runningRecord = records.find((r) => !r.stopTime);
    if (!runningRecord) return;
    try {
      const res = await fetch(`${BASE_URL}/session/stopRecord/${runningSession._id}/${runningRecord._id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ stopTime: new Date().toISOString() }),
      });
      if (res.ok) {
        Alert.alert("Success", "Timer Stoped!"); 
        fetchSession(); await fetchUser(); }
    } catch (err) { console.error(err); }
   };

  const handleAddRecord = async (sessionId) => {
    const token = await AsyncStorage.getItem("adminToken");
    if (!newStartTime || !newStopTime) return Alert.alert("Info", "Select times.");
    const start = new Date(newStartTime);
    const stop = new Date(newStopTime);
    if (start >= stop) return Alert.alert("Info", "Stop must be after start.");
    try {
      const res = await fetch(`${BASE_URL}/session/addRecordToSession/${sessionId}`, {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ startTime: start.toISOString(), stopTime: stop.toISOString() }),
      });
      if (res.ok) { 
        Alert.alert("Success", "Manually Session Added!"); 
        fetchSession(); await fetchUser(); setNewStartTime(new Date()); setNewStopTime(new Date()); }
      else { const data = await res.json(); Alert.alert("Error", data.message); }
    } catch (err) { console.error(err); }
  };

  const handleEditClick = (record) => {
    setEditingRecordId(record._id);
    setEditStartTime(record.startTime);
    setEditStopTime(record.stopTime);
  };
  const handleCancelEdit = () => {
    setEditingRecordId(null);
    setEditStartTime("");
    setEditStopTime("");
  };
  const handleSaveEdit = async (record) => {
    const token = await AsyncStorage.getItem("adminToken");
    try {
      const payload = { startTime: new Date(editStartTime).toISOString(), stopTime: new Date(editStopTime).toISOString() };
      const res = await fetch(`${BASE_URL}/session/editRecord/${record.sessionId}/${record._id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) { 
        Alert.alert("Success", "Updated!"); 
        fetchSession(); await fetchUser(); handleCancelEdit(); }
    } catch (err) { console.error(err); }
  };

  const handleDelete =async (record) => { 
    const token = await AsyncStorage.getItem("adminToken");
    Alert.alert("Confirm", "Delete record?", [{ text: "Cancel" }, { text: "Delete", style: "destructive", onPress: async () => {
          try {
            const res = await fetch(`${BASE_URL}/session/deleteRecord/${record.sessionId}/${record._id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) { 
              Alert.alert("Success", "Deleted Session Entry!"); 
              fetchSession(); await fetchUser(); }
          } catch (err) {}
    }}]);
  };
  const handleDeleteSession = async (sessionId) => {
    const token = await AsyncStorage.getItem("adminToken");
    Alert.alert("Confirm", "Delete session?", [{ text: "Cancel" }, { text: "Delete", style: "destructive", onPress: async () => {
        try {
            const res = await fetch(`${BASE_URL}/session/deleteSession/${sessionId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) { Alert.alert("Success", "Deleted Session!"); fetchSession(); await fetchUser(); }
        } catch (error) {}
    }}]);
   };

  const handleAddData = async (userId) => {
    const token = await AsyncStorage.getItem("adminToken");
    try {
        const response = await fetch(`${BASE_URL}/dailyentry/addEntry`, {
          method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ userId }),
        });
        if (response.ok) { Alert.alert("Success", "Tanker Added!"); fetchDailyData(); await fetchUser(); }
      } catch (error) {}
   };

  const handleManualDailyEntry = async () => {
    const token = await AsyncStorage.getItem("adminToken");
    if (!manualDate || !manualTotal || !manualAmount) return Alert.alert("Info", "Fill all fields");
    const formattedDate = manualDate.toISOString().split('T')[0];
    try {
      const res = await fetch(`${BASE_URL}/dailyentry/add`, {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ userId: user._id, date: formattedDate, value: parseFloat(manualTotal), amount: parseFloat(manualAmount) }),
      });
      if (res.ok) { Alert.alert("Success", "Manually Tanker Added!"); setManualDate(new Date()); setManualTotal(""); setManualAmount(""); fetchDailyData(); await fetchUser(); }
    } catch (err) {}
  };

  const handleEditDailyEntry = (entry) => {
    setEditingDailyId(entry._id);
    setEditDailyDate(entry.date || entry.createdAt); 
    setEditDailyTotal(String(entry.value)); 
    setEditDailyAmount(String(entry.amount)); 
  };

  const handleCancelDailyEdit = () => {
    setEditingDailyId(null);
    setEditDailyDate("");
    setEditDailyTotal("");
    setEditDailyAmount("");
  };

  const handleSaveDailyEdit = async (entryId) => {
    const token = await AsyncStorage.getItem("adminToken");
    try {
      const formattedDate = new Date(editDailyDate).toISOString().split('T')[0];
      const res = await fetch(`${BASE_URL}/dailyentry/editUserEntry/${user._id}/${entryId}`, {
        method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ date: formattedDate, value: parseFloat(editDailyTotal), amount: parseFloat(editDailyAmount) }),
      });
      if (res.ok) { Alert.alert("Success", "Updated!"); handleCancelDailyEdit(); fetchDailyData(); await fetchUser(); }
    } catch (err) { console.error("Error", err); }
  };

  const handleDeleteDailyEntry =async (entryId) => { 
    const token = await AsyncStorage.getItem("adminToken");
    Alert.alert("Confirm", "Delete entry?", [{text:"Cancel"}, {text:"Delete", style:"destructive", onPress: async()=>{
        try { const res = await fetch(`${BASE_URL}/dailyentry/deleteUserEntry/${user._id}/${entryId}`, {method:"DELETE", headers: { Authorization: `Bearer ${token}` }});
        if(res.ok) {Alert.alert("Success","Deleted Entry!"); fetchDailyData(); await fetchUser();} } catch(e){}
    }}]);
  };
  const handleDeleteDate =async (date) => { 
    const token = await AsyncStorage.getItem("adminToken");
    Alert.alert("Confirm", "Delete all entries for date?", [{text:"Cancel"}, {text:"Delete", style:"destructive", onPress: async()=>{
        try { const res = await fetch(`${BASE_URL}/dailyentry/delete/date/${user._id}/${date}`, {method:"DELETE", headers: { Authorization: `Bearer ${token}` }});
        if(res.ok) {Alert.alert("Success","Deleted Particular Date!"); fetchDailyData(); await fetchUser();} } catch(e){}
    }}]);
  };

  const handleAddDeposit = async () => {
    const token = await AsyncStorage.getItem("adminToken");
    if (!depositAmount && !discountAmount) return Alert.alert("Info", "Enter amount");
    try {
        const res = await fetch(`${BASE_URL}/deposit/add`, {
          method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ userId: user._id, depositAmount: parseFloat(depositAmount)||0, discountAmount: parseFloat(discountAmount)||0, message }),
        });
        if (res.ok) { Alert.alert("Success", "Deposited!"); setDepositAmount(""); setDiscountAmount(""); setMessage(""); await fetchUser(); }
      } catch (error) {}
   };

  const fetchDepositHistory = async () => { 
    const token = await AsyncStorage.getItem("adminToken");
    try { const res = await fetch(`${BASE_URL}/deposit/user/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
    ); const data = await res.json(); if (res.ok) setDeposits(data || []); } catch (e) {}
  };

  // === RENDER HELPERS ===
  const getPickerValue = () => {
    if (activeTimeField === 'daily') return manualDate;
    if (activeTimeField === 'start') return newStartTime;
    if (activeTimeField === 'stop') return newStopTime;
    if (activeTimeField === 'editStart') return editStartTime ? new Date(editStartTime) : new Date();
    if (activeTimeField === 'editStop') return editStopTime ? new Date(editStopTime) : new Date();
    return new Date();
  };

  const TableHeader = ({ items }) => (
    <View style={styles.tableHeaderRow}>
      {items.map((item, index) => (
        <Text key={index} style={[styles.tableHeaderText, { flex: index === items.length - 1 ? 0.8 : 1 }]}>{item}</Text>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* WRAPPER FOR TABS AND CONTENT */}
      <View style={{ flex: 1 }}>
          
          <ScrollView style={styles.container} contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 }]}>
            
            {/* === HEADER & NAV === */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>← Back to Dashboard</Text>
            </TouchableOpacity>

            {/* === USER PROFILE CARD === */}
            <View style={styles.card}>
              <View style={styles.userHeader}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}</Text>
                </View>
                <View>
                    <Text style={styles.userName}>{user.fullName}</Text>
                    <Text style={styles.userRole}>{user.role} • {formatDateDMY(new Date(user.createdAt))}</Text>
                    <Text style={styles.userPhone}>{user.phone}</Text>
                </View>
              </View>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Pending</Text>
                    <Text style={[styles.statValue, { color: COLORS.danger }]}>{user.pendingAmount}</Text>
                </View>
                <View style={styles.verticalDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Discount</Text>
                    <Text style={[styles.statValue, { color: COLORS.success }]}>{user.discountAmount}</Text>
                </View>
              </View>

              {/* === TABS === */}
              <View style={styles.tabContainer}>
                <TouchableOpacity onPress={() => setFilterType("session")} style={[styles.tabButton, filterType === "session" && styles.activeTab]}>
                  <Text style={[styles.tabText, filterType === "session" && styles.activeTabText]}>Session</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFilterType("daily")} style={[styles.tabButton, filterType === "daily" && styles.activeTab]}>
                  <Text style={[styles.tabText, filterType === "daily" && styles.activeTabText]}>Tanker</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => setShowDepositForm(!showDepositForm)} style={styles.actionButtonSecondary}>
                <Text style={styles.actionButtonSecondaryText}>{showDepositForm ? "Close Deposit Form" : "Deposit Money"}</Text>
              </TouchableOpacity>

              {showDepositForm && (
                <View style={styles.formContainer}>
                  <Text style={styles.sectionTitle}>Add Deposit</Text>
                  <TextInput style={styles.input} placeholder="Deposit Amount" value={depositAmount} onChangeText={setDepositAmount} keyboardType="numeric" placeholderTextColor={COLORS.subText}/>
                  <TextInput style={styles.input} placeholder="Discount Amount" value={discountAmount} onChangeText={setDiscountAmount} keyboardType="numeric" placeholderTextColor={COLORS.subText}/>
                  <TextInput style={styles.input} placeholder="Message (Optional)" value={message} onChangeText={setMessage} placeholderTextColor={COLORS.subText}/>
                  <TouchableOpacity onPress={handleAddDeposit} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Submit Deposit</Text></TouchableOpacity>
                </View>
              )}
            </View>

            {/* === DEPOSIT HISTORY === */}
            <View style={styles.card}>
                <TouchableOpacity 
                    style={styles.accordionHeader} 
                    onPress={() => { setShowDepositHistory(!showDepositHistory); if (!showDepositHistory) fetchDepositHistory(); }}
                >
                    <Text style={styles.cardTitle}>Deposit History</Text>
                    <Text style={styles.accordionIcon}>{showDepositHistory ? "▲" : "▼"}</Text>
                </TouchableOpacity>
                
                {showDepositHistory && (
                    <View style={styles.historyList}>
                        <TableHeader items={["Date", "Dep", "Disc", "Msg"]} />
                        {deposits.map((dep) => (
                        <View key={dep._id} style={styles.tableRow}>
                            <Text style={styles.tableCell}>{formatDateDMY(dep.createdAt)}</Text>
                            <Text style={[styles.tableCell, { color: COLORS.success, fontWeight: 'bold' }]}>{dep.depositAmount}</Text>
                            <Text style={[styles.tableCell, { color: COLORS.danger }]}>{dep.discountAmount}</Text>
                            <Text style={[styles.tableCell, styles.msgCell]}>{dep.message || "-"}</Text>
                        </View>
                        ))}
                        {deposits.length === 0 && <Text style={styles.emptyText}>No history found.</Text>}
                    </View>
                )}
            </View>

            {/* === LOADING SPINNER === */}
            {loading && <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }} />}

            {/* === DAILY ENTRY SECTION === */}
            {!loading && filterType === "daily" && (
                <>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📅 Tanker Management</Text>
                    <View style={styles.actionRow}>
                        <TouchableOpacity onPress={() => handleAddData(user._id)} style={[styles.quickActionButton, {backgroundColor: COLORS.success}]}>
                            <Text style={styles.quickActionText}>+ Today's Tanker</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowManualForm(!showManualForm)} style={[styles.quickActionButton, {backgroundColor: COLORS.primary}]}>
                            <Text style={styles.quickActionText}>{showManualForm ? "Close Manual" : "+ Manual Entry"}</Text>
                        </TouchableOpacity>
                    </View>

                    {showManualForm && ( 
                        <View style={styles.formContainer}>
                        <Text style={styles.sectionSubtitle}>Add Manual Entry</Text>
                        <TouchableOpacity onPress={() => handleShowPicker('date', 'daily')} style={styles.datePickerButton}>
                            <Text style={styles.datePickerText}>{formatDateDMY(manualDate.toISOString())}</Text>
                            <Text>🗓️</Text>
                        </TouchableOpacity>
                        <TextInput style={styles.input} placeholder="Value" value={manualTotal} onChangeText={setManualTotal} keyboardType="numeric" placeholderTextColor={COLORS.subText}/>
                        <TextInput style={styles.input} placeholder="Amount" value={manualAmount} onChangeText={setManualAmount} keyboardType="numeric" placeholderTextColor={COLORS.subText}/>
                        <TouchableOpacity onPress={handleManualDailyEntry} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Add Entry</Text></TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={styles.dataListContainer}>
                    {/* SAFE CHECK FOR DATA */}
                    {(!dailyData.days || dailyData.days.length === 0) ? ( 
                        <Text style={styles.emptyText}>No daily entries found.</Text> 
                    ) : (
                    dailyData.days.map((day) => (
                        <View key={day._id} style={styles.dailyCard}>
                        <TouchableOpacity onPress={() => toggleDaily(day._id)} style={styles.dailyHeader}>
                            <View>
                                <Text style={styles.dailyDate}>{formatDateDMY(day.date)}</Text>
                                <Text style={styles.dailyTotal}>Total: {day.dailyTotal}</Text>
                            </View>
                            <View style={styles.dailyHeaderActions}>
                                <TouchableOpacity onPress={() => handleDeleteDate(day.date)} style={styles.iconButtonRed}><Text style={styles.iconButtonText}>🗑️</Text></TouchableOpacity>
                                <Text style={styles.chevron}>{openDaily[day._id] ? "▲" : "▼"}</Text>
                            </View>
                        </TouchableOpacity>

                        {openDaily[day._id] && (
                            <View style={styles.dailyContent}>
                                <TableHeader items={["Tanker", "Amt", "Time", "Act"]} />
                                {day.entries.map((entry) => (
                                    <View key={entry._id} style={styles.tableRow}>
                                    {editingDailyId === entry._id ? (
                                        <>
                                        <View style={{flex: 2, flexDirection:'row', gap: 4}}>
                                            <TextInput style={[styles.smallInput, {flex: 1}]} value={editDailyTotal} onChangeText={setEditDailyTotal} keyboardType="numeric" />
                                            <TextInput style={[styles.smallInput, {flex: 1}]} value={editDailyAmount} onChangeText={setEditDailyAmount} keyboardType="numeric" />
                                        </View>
                                        <Text style={styles.tableCell}>{format12Hour(entry.createdAt)}</Text>
                                        <View style={styles.actionCell}>
                                            <TouchableOpacity onPress={() => handleSaveDailyEdit(entry._id)} style={styles.saveBadge}><Text style={styles.badgeText}>✓</Text></TouchableOpacity>
                                            <TouchableOpacity onPress={handleCancelDailyEdit} style={styles.cancelBadge}><Text style={styles.badgeText}>✕</Text></TouchableOpacity>
                                        </View>
                                        </>
                                    ) : (
                                        <>
                                        <Text style={styles.tableCell}>{entry.value}</Text>
                                        <Text style={styles.tableCell}>{entry.amount}</Text>
                                        <Text style={styles.tableCell}>{format12Hour(entry.createdAt)}</Text>
                                        <View style={styles.actionCell}>
                                            <TouchableOpacity onPress={() => handleEditDailyEntry(entry)} style={styles.editBadge}><Text style={styles.badgeText}>✎</Text></TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleDeleteDailyEntry(entry._id)} style={styles.deleteBadge}><Text style={styles.badgeText}>🗑</Text></TouchableOpacity>
                                        </View>
                                        </>
                                    )}
                                    </View>
                                ))}
                            </View>
                        )}
                        </View>
                    ))
                    )}
                </View>
                </>
            )}

            {/* === SESSION DATA SECTION === */}
            {!loading && filterType === "session" && (
                <>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🕒 Session Controls</Text>
                    <View style={styles.gridControls}>
                        <TouchableOpacity onPress={handleAddSession} style={[styles.controlButton, {backgroundColor: COLORS.success}]}>
                            <Text style={styles.controlButtonText}>Start Session</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleEndSession} style={[styles.controlButton, {backgroundColor: COLORS.danger}]}>
                            <Text style={styles.controlButtonText}>End Session</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleStartRecord} disabled={timerRunning} style={[styles.controlButton, {backgroundColor: timerRunning ? COLORS.subText : COLORS.primary}]}>
                            <Text style={styles.controlButtonText}>Start Timer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleStopRecord} style={[styles.controlButton, {backgroundColor: COLORS.warning}]}>
                            <Text style={styles.controlButtonText}>Stop Timer</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.dataListContainer}>
                    {session.map((s) => (
                    <View key={s._id} style={styles.sessionCard}>
                        <View style={styles.sessionHeaderRow}>
                            <View style={{flex: 1}}>
                                <View style={styles.dateBadge}>
                                    <Text style={styles.dateBadgeText}>{s.startTime ? formatDateDMY(new Date(s.startTime)) : "Pending"}</Text>
                                </View>
                                <Text style={styles.sessionTimeText}>{s.startTime ? format12Hour(s.startTime) : "-"} → {s.stopTime ? format12Hour(s.stopTime) : "Running..."}</Text>
                                <Text style={styles.costText}>₹{s.totalCost} <Text style={styles.durationText}>({s.totalDurationReadable})</Text></Text>
                            </View>
                            <View style={styles.sessionActions}>
                                <View style={{flexDirection:'row', gap: 8, marginBottom: 8}}>
                                    <TouchableOpacity onPress={() => setShowManualFormSession(showManualFormSession === s._id ? null : s._id)} style={styles.iconButtonBlue}><Text style={styles.iconButtonText}>+</Text></TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDeleteSession(s._id)} style={styles.iconButtonRed}><Text style={styles.iconButtonText}>🗑</Text></TouchableOpacity>
                                </View>
                                <TouchableOpacity onPress={() => toggleSession(s._id)} style={styles.toggleTextBtn}>
                                    <Text style={styles.toggleTextBtnText}>{openSession[s._id] ? "Hide Details" : "View Details"}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {showManualFormSession === s._id && (
                            <View style={styles.inlineForm}>
                                <Text style={styles.sectionSubtitle}>Add Record Manually</Text>
                                <View style={styles.pickerRow}>
                                    <View style={{flex:1}}>
                                        <Text style={styles.label}>Start</Text>
                                        <View style={styles.miniPickerGroup}>
                                            <TouchableOpacity onPress={() => handleShowPicker('date', 'start')} style={styles.miniPicker}><Text style={styles.miniPickerText}>{formatDateDMY(newStartTime.toISOString())}</Text></TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleShowPicker('time', 'start')} style={styles.miniPicker}><Text style={styles.miniPickerText}>{format12Hour(newStartTime.toISOString())}</Text></TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style={{flex:1}}>
                                        <Text style={styles.label}>Stop</Text>
                                        <View style={styles.miniPickerGroup}>
                                            <TouchableOpacity onPress={() => handleShowPicker('date', 'stop')} style={styles.miniPicker}><Text style={styles.miniPickerText}>{formatDateDMY(newStopTime.toISOString())}</Text></TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleShowPicker('time', 'stop')} style={styles.miniPicker}><Text style={styles.miniPickerText}>{format12Hour(newStopTime.toISOString())}</Text></TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => handleAddRecord(s._id)} style={styles.smallPrimaryButton}><Text style={styles.smallPrimaryButtonText}>Save Record</Text></TouchableOpacity>
                            </View>
                        )}

                        {openSession[s._id] && (
                            <View style={styles.sessionDetails}>
                                <TableHeader items={["Date", "Time", "Dur", "Act"]} />
                                {records.filter((r) => r.sessionId === s._id).map((record) => (
                                    <View key={record._id} style={styles.tableRow}>
                                        {editingRecordId === record._id ? (
                                            <>
                                                <View style={styles.tableCell}>
                                                    <TouchableOpacity onPress={()=>handleShowPicker('date', 'editStart')} style={styles.editTimeBtn}><Text style={styles.editTimeText}>{formatDateDMY(editStartTime)}</Text></TouchableOpacity>
                                                </View>
                                                <View style={styles.tableCell}>
                                                    <TouchableOpacity onPress={()=>handleShowPicker('time', 'editStart')} style={styles.editTimeBtn}><Text style={styles.editTimeText}>{format12Hour(editStartTime)}</Text></TouchableOpacity>
                                                    <Text style={{textAlign:'center', fontSize: 10}}>to</Text>
                                                    <TouchableOpacity onPress={()=>handleShowPicker('time', 'editStop')} style={styles.editTimeBtn}><Text style={styles.editTimeText}>{format12Hour(editStopTime)}</Text></TouchableOpacity>
                                                </View>
                                                <Text style={styles.tableCell}>-</Text>
                                                <View style={styles.actionCell}>
                                                    <TouchableOpacity onPress={() => handleSaveEdit(record)} style={styles.saveBadge}><Text style={styles.badgeText}>✓</Text></TouchableOpacity>
                                                    <TouchableOpacity onPress={handleCancelEdit} style={styles.cancelBadge}><Text style={styles.badgeText}>✕</Text></TouchableOpacity>
                                                </View>
                                            </>
                                        ) : (
                                            <>
                                                <Text style={styles.tableCell}>{formatDateDMY(record.startTime)}</Text>
                                                <View style={styles.tableCell}>
                                                    <Text style={styles.timeText}>{format12Hour(record.startTime)}</Text>
                                                    <Text style={styles.subTimeText}>{record.stopTime ? format12Hour(record.stopTime) : "..."}</Text>
                                                </View>
                                                <Text style={[styles.tableCell, {fontSize: 12}]}>{record.durationReadable}</Text>
                                                <View style={styles.actionCell}>
                                                    <TouchableOpacity onPress={() => handleEditClick(record)} style={styles.editBadge}><Text style={styles.badgeText}>✎</Text></TouchableOpacity>
                                                    <TouchableOpacity onPress={() => handleDelete(record)} style={styles.deleteBadge}><Text style={styles.badgeText}>🗑</Text></TouchableOpacity>
                                                </View>
                                            </>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                    ))}
                    {session.length === 0 && <Text style={styles.emptyText}>No sessions found.</Text>}
                </View>
                </>
            )}

            {/* === DATE TIME PICKER MODAL === */}
            {showPicker && (
              <DateTimePicker
                value={getPickerValue()}
                mode={pickerMode} 
                is24Hour={false}
                display="default"
                onChange={handleDateChange}
              />
            )}
          </ScrollView>

          
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  
  // Back Button
  backButton: { marginBottom: 16, flexDirection: 'row', alignItems: 'center' },
  backButtonText: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },

  // Cards
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  
  // User Profile
  userHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  userName: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  userRole: { fontSize: 14, color: COLORS.subText },
  userPhone: { fontSize: 14, color: COLORS.text, marginTop: 2 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.background, marginBottom: 16 },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 12, color: COLORS.subText, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  verticalDivider: { width: 1, height: 30, backgroundColor: COLORS.border },

  // Tabs
  tabContainer: { flexDirection: 'row', backgroundColor: COLORS.background, borderRadius: 12, padding: 4, marginBottom: 12 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: COLORS.card, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, elevation: 2 },
  tabText: { fontWeight: '600', color: COLORS.subText },
  activeTabText: { color: COLORS.primary, fontWeight: 'bold' },

  // Actions
  actionButtonSecondary: { paddingVertical: 10, alignItems: 'center' },
  actionButtonSecondaryText: { color: COLORS.primary, fontWeight: '600' },

  // Forms
  formContainer: { marginTop: 12, padding: 12, backgroundColor: COLORS.inputBg, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: COLORS.text },
  sectionSubtitle: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: COLORS.text },
  input: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 10, color: COLORS.text },
  smallInput: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, fontSize: 12, textAlign: 'center' },
  
  primaryButton: { backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  
  smallPrimaryButton: { backgroundColor: COLORS.primary, paddingVertical: 8, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  smallPrimaryButtonText: { color: 'white', fontWeight: 'bold', fontSize: 12 },

  datePickerButton: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 10 },
  datePickerText: { color: COLORS.text },

  // Lists & Tables
  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  accordionIcon: { fontSize: 16, color: COLORS.subText },
  historyList: { marginTop: 12 },
  
  tableHeaderRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 8, marginBottom: 8 },
  tableHeaderText: { fontSize: 12, fontWeight: '700', color: COLORS.subText, textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.background, alignItems: 'center' },
  tableCell: { flex: 1, fontSize: 13, color: COLORS.text },
  msgCell: { color: COLORS.subText, fontStyle: 'italic', fontSize: 12 },
  emptyText: { textAlign: 'center', padding: 20, color: COLORS.subText, fontStyle: 'italic' },

  // Daily Section Specifics
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  quickActionButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  quickActionText: { color: 'white', fontWeight: '600', fontSize: 13 },
  
  dailyCard: { backgroundColor: COLORS.card, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  dailyHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, backgroundColor: '#FAFAFA' },
  dailyDate: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  dailyTotal: { fontSize: 14, color: COLORS.subText, marginTop: 2 },
  dailyHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chevron: { fontSize: 14, color: COLORS.subText },
  dailyContent: { padding: 12 },
  
  // Session Controls
  gridControls: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  controlButton: { width: '48%', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  controlButtonText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  
  // Session Card
  sessionCard: { backgroundColor: COLORS.card, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, padding: 12 },
  sessionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dateBadge: { backgroundColor: COLORS.inputBg, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 6 },
  dateBadgeText: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  sessionTimeText: { fontSize: 13, color: COLORS.subText, marginBottom: 4 },
  costText: { fontSize: 16, fontWeight: 'bold', color: COLORS.success },
  durationText: { fontSize: 13, color: COLORS.subText, fontWeight: 'normal' },
  sessionActions: { justifyContent: 'space-between', alignItems: 'flex-end' },
  toggleTextBtn: { padding: 4 },
  toggleTextBtnText: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },

  // Icon Buttons
  iconButtonBlue: { backgroundColor: COLORS.primary, width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  iconButtonRed: { backgroundColor: '#FEE2E2', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  iconButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  
  // Inline Form
  inlineForm: { backgroundColor: COLORS.inputBg, padding: 10, borderRadius: 8, marginTop: 10 },
  pickerRow: { flexDirection: 'row', gap: 10 },
  label: { fontSize: 11, color: COLORS.subText, marginBottom: 4 },
  miniPickerGroup: { gap: 4 },
  miniPicker: { backgroundColor: COLORS.card, padding: 6, borderRadius: 4, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  miniPickerText: { fontSize: 11 },

  // Actions Badges
  actionCell: { flex: 0.8, flexDirection: 'row', justifyContent: 'flex-end', gap: 6 },
  editBadge: { backgroundColor: '#FEF3C7', padding: 6, borderRadius: 6 },
  deleteBadge: { backgroundColor: '#FEE2E2', padding: 6, borderRadius: 6 },
  saveBadge: { backgroundColor: '#D1FAE5', padding: 6, borderRadius: 6 },
  cancelBadge: { backgroundColor: '#F3F4F6', padding: 6, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: COLORS.text },

  editTimeBtn: { backgroundColor: COLORS.background, padding: 4, borderRadius: 4, marginVertical: 1 },
  editTimeText: { fontSize: 10, textAlign: 'center' },
  timeText: { fontSize: 13 },
  subTimeText: { fontSize: 11, color: COLORS.subText },
});