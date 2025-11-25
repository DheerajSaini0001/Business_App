import React, { useEffect, useState } from "react";
// Import React Native components
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
// Import React Navigation hooks
import { useRoute, useNavigation } from "@react-navigation/native";

// === API Base URL ===
// Change this one line to update your API endpoint everywhere
const BASE_URL = "https://saini-record-management.onrender.com";
// =====================

// Helper functions (Unchanged)
const toLocalInputString = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const format12Hour = (isoString) => {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
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
  // React Navigation hooks replace react-router-dom
  const route = useRoute();
  const navigation = useNavigation();
  // Get the user passed from the previous screen
  const { user: initialUser } = route.params; // <-- 1. Renamed to initialUser

  // --- State variables ---
  // 2. Create local state for the user, initialized with the prop
  const [user, setUser] = useState(initialUser);

  const [session, setSession] = useState([]);
  const [records, setRecords] = useState([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editStartTime, setEditStartTime] = useState("");
  const [editStopTime, setEditStopTime] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newStopTime, setNewStopTime] = useState("");
  const [openSession, setOpenSession] = useState({});
  const [filterType, setFilterType] = useState("session");
  const [dailyData, setDailyData] = useState([]);
  const [manualDate, setManualDate] = useState("");
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

  // New state to manage collapsible daily entries (replaces <details>)
  const [openDaily, setOpenDaily] = useState({});

  const COST_PER_HOUR = 150;

  // 3. Re-introduced fetchUser to refresh local state
  const fetchUser = async () => {
    if (!user?._id) return; // Safety check
    try {
      const res = await fetch(`${BASE_URL}/admin/users/${user._id}`);
      const data = await res.json();
      if (res.ok) {
        setUser(data.user); // This updates the local state
      } else {
        console.warn("Failed to refresh user:", data.message);
      }
    } catch (err) {
      console.warn("Failed to load user refresh.", err);
    }
  };


  // Fetch session (Updated with BASE_URL and user._id)
  const fetchSession = async () => {
    try {
      const res = await fetch(`${BASE_URL}/session/${user._id}`); // <-- Use user._id
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
            const minutes = Math.floor(
              (diffMs % (1000 * 60 * 60)) / (1000 * 60)
            );
            durationReadable = `${hours} hr ${minutes} min`;
            durationDecimal = hours + minutes / 60;
            cost = durationDecimal * COST_PER_HOUR;
          }
          allRecords.push({
            ...r,
            sessionId: session._id,
            durationReadable,
            durationDecimal,
            cost,
          });
        });
      });

      allRecords.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setRecords(allRecords);
      const running = allRecords.find((r) => !r.stopTime);
      setTimerRunning(!!running);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch daily data (Updated with BASE_URL and user._id)
  const fetchDailyData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/dailyentry/${user._id}`); // <-- Use user._id
      const data = await res.json();
      setDailyData(data.data);
    } catch (err) {
      console.error("❌ Error fetching daily entries:", err);
    }
  };

  // useEffect (Updated dependencies)
  useEffect(() => {
    if (filterType === "session") {
      fetchSession();
    } else {
      fetchDailyData();
    }
  }, [user._id, filterType]); // <-- Use user._id

  // Session toggles (Unchanged)
  const toggleSession = (sessionId) => {
    setOpenSession((prev) => ({ ...prev, [sessionId]: !prev[sessionId] }));
  };

  // New toggle handler for daily entries
  const toggleDaily = (dayId) => {
    setOpenDaily((prev) => ({ ...prev, [dayId]: !prev[dayId] }));
  };

  // === Handlers ===
  // All handlers updated to use user._id

  const handleAddSession = async () => {
    try {
      const res = await fetch(`${BASE_URL}/session/start/${user._id}`, { // <-- Use user._id
        method: "POST",
      });
      if (res.ok) {
        Alert.alert("Success", "New session started!");
        fetchSession();
      } else {
        const data = await res.json();
        Alert.alert("Error", data.message || "Failed to start session");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "A network error occurred.");
    }
  };

  const handleEndSession = async () => {
    const runningSession = session.find((s) => !s.stopTime);
    if (!runningSession) return Alert.alert("Info", "No running session found.");
    try {
      const res = await fetch(`${BASE_URL}/session/end/${runningSession._id}`, {
        method: "POST",
      });
      if (res.ok) {
        Alert.alert("Success", "Session ended!");
        fetchSession();
      } else {
        const data = await res.json();
        Alert.alert("Error", data.message || "Failed to end session");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "A network error occurred.");
    }
  };

  const handleStartRecord = async () => {
    if (timerRunning) return;
    const runningSession = session.find((s) => !s.stopTime);
    if (!runningSession)
      return Alert.alert("Info", "No active session! Start a session first.");

    try {
      const res = await fetch(`${BASE_URL}/session/addRecord/${runningSession._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime: new Date().toISOString() }),
      });
      if (res.ok) fetchSession();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStopRecord = async () => {
    const runningSession = session.find((s) => !s.stopTime);
    if (!runningSession) return Alert.alert("Info", "No active session found.");
    const runningRecord = records.find((r) => !r.stopTime);
    if (!runningRecord) return;

    try {
      const res = await fetch(
        `${BASE_URL}/session/stopRecord/${runningSession._id}/${runningRecord._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stopTime: new Date().toISOString() }),
        }
      );
      if (res.ok) {
        fetchSession();
        await fetchUser(); // <-- 4. Call fetchUser() here
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRecord = async (sessionId) => {
    if (!newStartTime || !newStopTime)
      return Alert.alert("Info", "Select start and stop time.");
    if (new Date(newStartTime) >= new Date(newStopTime))
      return Alert.alert("Info", "Stop must be after start.");

    try {
      const res = await fetch(`${BASE_URL}/session/addRecordToSession/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: new Date(newStartTime).toISOString(),
          stopTime: new Date(newStopTime).toISOString(),
        }),
      });
      if (res.ok) {
        fetchSession();
        await fetchUser(); // <-- 4. Call fetchUser() here
        setNewStartTime("");
        setNewStopTime("");
      } else {
        const data = await res.json();
        Alert.alert("Error", data.message || "Failed to add record");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Edit/Cancel handlers (Unchanged)
  const handleEditClick = (record) => {
    setEditingRecordId(record._id);
    setEditStartTime(toLocalInputString(record.startTime));
    setEditStopTime(toLocalInputString(record.stopTime));
  };
  const handleCancelEdit = () => {
    setEditingRecordId(null);
    setEditStartTime("");
    setEditStopTime("");
  };

  const handleSaveEdit = async (record) => {
    try {
      const payload = {
        startTime: new Date(editStartTime).toISOString(),
        stopTime: new Date(editStopTime).toISOString(),
      };
      const res = await fetch(
        `${BASE_URL}/session/editRecord/${record.sessionId}/${record._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (res.ok) {
        fetchSession();
        await fetchUser(); // <-- 4. Call fetchUser() here
        handleCancelEdit();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (record) => {
    Alert.alert("Confirm Delete", "Delete this record?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(
              `${BASE_URL}/session/deleteRecord/${record.sessionId}/${record._id}`,
              { method: "DELETE" }
            );
            if (res.ok) {
              fetchSession();
              await fetchUser(); // <-- 4. Call fetchUser() here
            }
          } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to delete record.");
          }
        },
      },
    ]);
  };

  const handleDeleteSession = (sessionId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${BASE_URL}/session/deleteSession/${sessionId}`, {
                method: "DELETE",
              });
              const data = await res.json();
              if (res.ok) {
                Alert.alert("Success", "Session deleted successfully!");
                fetchSession();
                await fetchUser(); // <-- 4. Call fetchUser() here
              } else {
                Alert.alert(
                  "Error",
                  data.message || "Failed to delete session"
                );
              }
            } catch (error) {
              console.error("Error deleting session:", error);
              Alert.alert("Error", "A network error occurred.");
            }
          },
        },
      ]
    );
  };

  const handleAddData = async (userId) => {
    try {
      const response = await fetch(`${BASE_URL}/dailyentry/addEntry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }), // userId is passed from button
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "✅ Entry added successfully!");
        fetchDailyData();
        await fetchUser(); // <-- 4. Call fetchUser() here
      } else Alert.alert("Error", data.message || "Failed to add entry.");
    } catch (error) {
      console.error("⚠️ Network error:", error);
      Alert.alert("Error", "A network error occurred.");
    }
  };

  const handleManualDailyEntry = async () => {
    if (!manualDate || !manualTotal || !manualAmount) {
      Alert.alert("Info", "⚠️ Please fill all fields");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/dailyentry/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id, // <-- Use user._id
          date: manualDate,
          value: parseFloat(manualTotal),
          amount: parseFloat(manualAmount),
        }),
      });
      const result = await res.json();
      if (res.ok) {
        Alert.alert("Success", "✅ Manual daily entry added!");
        setManualDate("");
        setManualTotal("");
        setManualAmount("");
        fetchDailyData();
        await fetchUser(); // <-- 4. Call fetchUser() here
      } else Alert.alert("Error", result.message || "Failed to add entry");
    } catch (err) {
      console.error("❌ Error adding manual entry:", err);
    }
  };

  // === Daily Edit/Delete handlers ===
  const handleEditDailyEntry = (entry) => {
    setEditingDailyId(entry._id);
    setEditDailyDate(entry.date?.split("T")[0] || "");
    setEditDailyTotal(String(entry.dailyTotal)); // Ensure string for input
    setEditDailyAmount(String(entry.dailyAmount)); // Ensure string for input
  };

  const handleCancelDailyEdit = () => {
    setEditingDailyId(null);
    setEditDailyDate("");
    setEditDailyTotal("");
    setEditDailyAmount("");
  };

  const handleSaveDailyEdit = async (entryId) => {
    try {
      const res = await fetch(`${BASE_URL}/dailyentry/editUserEntry/${user._id}/${entryId}`, { // <-- Use user._id
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: editDailyDate,
          value: parseFloat(editDailyTotal),
          amount: parseFloat(editDailyAmount),
        }),
      });
      const result = await res.json();
      if (res.ok) {
        Alert.alert("Success", "✅ Daily entry updated!");
        handleCancelDailyEdit();
        fetchDailyData();
        await fetchUser(); // <-- 4. Call fetchUser() here
      } else {
        Alert.alert("Error", result.message || "Failed to update entry");
      }
    } catch (err) {
      console.error("❌ Error updating daily entry:", err);
    }
  };

  const handleDeleteDailyEntry = (entryId) => {
    Alert.alert("Confirm Delete", "🗑️ Delete this daily entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(
              `${BASE_URL}/dailyentry/deleteUserEntry/${user._id}/${entryId}`, // <-- Use user._id
              {
                method: "DELETE",
              }
            );
            const result = await res.json();
            if (res.ok) {
              Alert.alert("Success", "✅ Daily entry deleted!");
              fetchDailyData();
              await fetchUser(); // <-- 4. Call fetchUser() here
            } else
              Alert.alert("Error", result.message || "Failed to delete entry");
          } catch (err) {
            console.error("❌ Error deleting entry:", err);
          }
        },
      },
    ]);
  };

  const handleDeleteDate = (date) => {
    Alert.alert("Confirm Delete", `Delete all entries for ${date}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(
              `${BASE_URL}/dailyentry/delete/date/${user._id}/${date}`, // <-- Use user._id
              { method: "DELETE" }
            );
            const data = await res.json();

            if (res.ok) {
              Alert.alert("Success", `✅ All entries for ${date} deleted`);
              setDailyData(data.data); // Update frontend instantly
              fetchDailyData();
              await fetchUser(); // <-- 4. Call fetchUser() here
            } else {
              Alert.alert("Error", `❌ ${data.message}`);
            }
          } catch (error) {
            console.error("Error deleting date entries:", error);
            Alert.alert("Error", "Server error while deleting date entries");
          }
        },
      },
    ]);
  };

  const handleAddDeposit = async () => {
    if (!depositAmount && !discountAmount) {
      Alert.alert("Info", "⚠️ Please enter deposit or discount amount");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/deposit/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id, // <-- Use user._id
          depositAmount: parseFloat(depositAmount) || 0,
          discountAmount: parseFloat(discountAmount) || 0,
          message,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert("Success", "✅ Deposit / Discount added successfully!");
        setDepositAmount("");
        setDiscountAmount("");
        setMessage("");
        await fetchUser(); // <-- 4. THIS IS THE FIX
      } else {
        Alert.alert("Error", data.message || "❌ Failed to add deposit");
      }
    } catch (error) {
      console.error("Error adding deposit:", error);
      Alert.alert("Error", "Server error while adding deposit");
    }
  };

  const fetchDepositHistory = async () => {
    try {
      const res = await fetch(`${BASE_URL}/deposit/user/${user._id}`); // <-- Use user._id
      const data = await res.json();
      if (res.ok) setDeposits(data || []);
      else console.error(data.message || "Failed to fetch deposit history");
    } catch (error) {
      console.error("Error fetching deposit history:", error);
    }
  };

  // === Render ===
  // UI renders from the 'user' state variable
  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backLink}>← Back to Dashboard</Text>
      </TouchableOpacity>

      {/* USER CARD */}
      <View style={styles.card}>
        <Text style={styles.heading1}>{user.fullName}</Text>
        <Text style={styles.text}>
          Pending Amount: {user.pendingAmount}
        </Text>
        <Text style={styles.text}>
          Phone: {user.phone}
        </Text>
        <Text style={styles.text}>
          Role: {user.role}
        </Text>
        <Text style={styles.text}>
          Discount Amount: {user.discountAmount}
        </Text>
        <Text style={styles.text}>
          Registered: {formatDateDMY(new Date(user.createdAt))}
        </Text>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            onPress={() => setFilterType("session")}
            style={[
              styles.filterButton,
              filterType === "session"
                ? styles.activeFilter
                : styles.inactiveFilter,
            ]}
          >
            <Text
              style={
                filterType === "session"
                  ? styles.activeFilterText
                  : styles.inactiveFilterText
              }
            >
              Session
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilterType("daily")}
            style={[
              styles.filterButton,
              filterType === "daily"
                ? styles.activeFilter
                : styles.inactiveFilter,
            ]}
          >
            <Text
              style={
                filterType === "daily"
                  ? styles.activeFilterText
                  : styles.inactiveFilterText
              }
            >
              Daily Entry
            </Text>
          </TouchableOpacity>
          
            <TouchableOpacity
              onPress={() => setShowDepositForm(!showDepositForm)}
              style={styles.buttonGreen}
            >
              <Text style={styles.buttonText}>
                {showDepositForm ? "Close" : "Deposit"}
              </Text>
            </TouchableOpacity>
        </View>

        {/* === DEPOSIT / DISCOUNT SECTION === */}
        <View style={styles.depositCard}>
          {showDepositForm && (
            <View style={styles.depositForm}>
              <View>
                <Text style={styles.label}>Deposit Amount (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={depositAmount}
                  onChangeText={setDepositAmount}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <View>
                <Text style={styles.label}>Discount Amount (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={discountAmount}
                  onChangeText={setDiscountAmount}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <View>
                <Text style={styles.label}>Message</Text>
                <TextInput
                  style={styles.input}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Optional message"
                />
              </View>
              <TouchableOpacity
                onPress={handleAddDeposit}
                style={[styles.buttonBlue, { marginTop: 10 }]}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      <View style={{
  backgroundColor: "#f9fafb",
  borderWidth: 1,
  borderColor: "#d1d5db",
  borderRadius: 8,
  padding: 12,
  marginBottom: 12
}}>
<View>
    <TouchableOpacity
            onPress={() => {
              setShowDepositHistory(!showDepositHistory);
              if (!showDepositHistory) fetchDepositHistory();
            }}
            style={[
              styles.buttonBlue,
              { marginTop: 10, alignSelf: "" },
            ]}
          >
            <Text style={styles.buttonText}>
              {showDepositHistory
                ? "Hide Deposit History"
                : "View Deposit History"}
            </Text>
          </TouchableOpacity>
</View>
          {showDepositHistory && (
            <View style={styles.historyContainer}>
              <Text style={styles.heading3}>📜 Deposit History</Text>
              {deposits.length === 0 ? (
                <Text style={styles.text}>No deposit history found.</Text>
              ) : (
                <View style={styles.table}>
                  {renderTableRow(
                    ["Date", "Deposit (₹)", "Discount (₹)", "Message"],
                    "header",
                    true
                  )}
                  {deposits.map((dep) => (
                    <View key={dep._id} style={styles.tableRow}>
                      <Text style={styles.tableCell}>
                        {formatDateDMY(dep.createdAt)}-
                        {format12Hour(dep.createdAt)}
                      </Text>
                      <Text style={[styles.tableCell, { color: "green" }]}>
                        ₹{dep.depositAmount || 0}
                      </Text>
                      <Text style={[styles.tableCell, { color: "red" }]}>
                        ₹{dep.discountAmount || 0}
                      </Text>
                      <Text style={styles.tableCell}>{dep.message || "-"}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

      </View>

      {/* === DAILY ENTRY DATA SECTION === */}
      {filterType === "daily" && (
        <View>
          <View style={styles.card}>
            <TouchableOpacity
              onPress={() => handleAddData(user._id)} // <-- Pass user._id
              style={[
                styles.buttonGreen,
                { marginBottom: 16, alignSelf: "flex-start" },
              ]}
            >
              <Text style={styles.buttonText}>Add Today's Entry</Text>
            </TouchableOpacity>

            <View style={styles.manualEntryForm}>
              <Text style={styles.heading3}>Add Daily Entry Manually</Text>
              <View>
                <Text style={styles.label}>Date</Text>
                <TextInput
                  style={styles.input}
                  value={manualDate}
                  onChangeText={setManualDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              <View>
                <Text style={styles.label}>Value</Text>
                <TextInput
                  style={styles.input}
                  value={manualTotal}
                  onChangeText={setManualTotal}
                  keyboardType="numeric"
                />
              </View>
              <View>
                <Text style={styles.label}>Amount</Text>
                <TextInput
                  style={styles.input}
                  value={manualAmount}
                  onChangeText={setManualAmount}
                  keyboardType="numeric"
                />
              </View>
              <TouchableOpacity
                onPress={handleManualDailyEntry}
                style={[styles.buttonGreen, { marginTop: 10 }]}
              >
                <Text style={styles.buttonText}>Add Entry</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.heading2}>📅 Daily Entries</Text>
            {!dailyData?.days || dailyData.days.length === 0 ? (
              <Text>No daily entries found.</Text>
            ) : (
              <View>
                {dailyData.days.map((day) => (
                  <View key={day._id} style={styles.collapsibleContainer}>
                    <TouchableOpacity
                      onPress={() => toggleDaily(day._id)}
                      style={styles.collapsibleHeader}
                    >
                      <Text style={styles.collapsibleHeaderText}>
                        {formatDateDMY(day.date)}
                      </Text>
                      <Text style={styles.collapsibleHeaderSubtitle}>
                        Tanker: {day.dailyTotal || 0} | Cost: {day.dailyAmount}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleDeleteDate(day.date)}
                        style={styles.buttonRedSmall}
                      >
                        <Text style={styles.buttonTextSmall}>Delete Date</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>

                    {openDaily[day._id] && (
                      <View style={styles.collapsibleContent}>
                        {!day.entries || day.entries.length === 0 ? (
                          <Text>No entries available for this day.</Text>
                        ) : (
                          <View style={styles.table}>
                            {renderTableRow(
                              ["Tanker", "Amount (₹)", "Created At", "Actions"],
                              "header",
                              true
                            )}
                            {day.entries.map((entry) => (
                              <View key={entry._id} style={styles.tableRow}>
                                {editingDailyId === entry._id ? (
                                  <>
                                    <TextInput
                                      style={styles.tableInput}
                                      value={editDailyTotal}
                                      onChangeText={setEditDailyTotal}
                                      keyboardType="numeric"
                                    />
                                    <TextInput
                                      style={styles.tableInput}
                                      value={editDailyAmount}
                                      onChangeText={setEditDailyAmount}
                                      keyboardType="numeric"
                                    />
                                    <Text style={styles.tableCell}>
                                      {formatDateDMY(entry.createdAt)}
                                    </Text>
                                    <View style={styles.tableCell}>
                                      <TouchableOpacity
                                        onPress={() =>
                                          handleSaveDailyEdit(entry._id)
                                        }
                                        style={styles.buttonBlueSmall}
                                      >
                                        <Text style={styles.buttonTextSmall}>
                                          Save
                                        </Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity
                                        onPress={handleCancelDailyEdit}
                                        style={styles.buttonGraySmall}
                                      >
                                        <Text style={styles.buttonTextSmall}>
                                          Cancel
                                        </Text>
                                      </TouchableOpacity>
                                    </View>
                                  </>
                                ) : (
                                  <>
                                    <Text style={styles.tableCell}>
                                      {entry.value}
                                    </Text>
                                    <Text style={styles.tableCell}>
                                      ₹{entry.amount}
                                    </Text>
                                    <Text style={styles.tableCell}>
                                      {format12Hour(entry.createdAt)}
                                    </Text>
                                    <View style={styles.tableCell}>
                                      <TouchableOpacity
                                        onPress={() =>
                                          handleEditDailyEntry(entry)
                                        }
                                        style={styles.buttonYellowSmall}
                                      >
                                        <Text style={styles.buttonTextSmall}>
                                          Edit
                                        </Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity
                                        onPress={() =>
                                          handleDeleteDailyEntry(entry._id)
                                        }
                                        style={styles.buttonRedSmall}
                                      >
                                        <Text style={styles.buttonTextSmall}>
                                          Delete
                                        </Text>
                                      </TouchableOpacity>
                                    </View>
                                  </>
                                )}
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      )}

      {/* === SESSION DATA SECTION === */}
      {filterType === "session" && (
        <View style={styles.card}>
          <Text style={styles.heading2}>🕒 Session Data</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={handleAddSession}
              style={styles.buttonGreen}
            >
              <Text style={styles.buttonText}>➕ Start Session</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleEndSession}
              style={styles.buttonRed}
            >
              <Text style={styles.buttonText}>⛔ End Session</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleStartRecord}
              disabled={timerRunning}
              style={timerRunning ? styles.buttonDisabled : styles.buttonBlue}
            >
              <Text style={styles.buttonText}>▶ Start Timer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleStopRecord}
              style={styles.buttonOrange}
            >
              <Text style={styles.buttonText}>⏹ Stop Timer</Text>
            </TouchableOpacity>
          </View>

          {session.length === 0 ? (
            <Text>No sessions found.</Text>
          ) : (
            session.map((s) => (
              <View key={s._id} style={styles.sessionBox}>
                <View style={styles.sessionHeader}>
                  <View>
                    <Text>
                      Start:{" "}
                      {s.startTime
                        ? formatDateDMY(new Date(s.startTime))
                        : "—"}
                    </Text>
                    <Text>
                      Stop:{" "}
                      {s.stopTime
                        ? formatDateDMY(new Date(s.startTime))
                        : "Running..."}
                    </Text>
                    <Text style={styles.bold}>
                      Total Duration: {s.totalDurationReadable}
                    </Text>
                    <Text style={styles.bold}>Total Cost: ₹{s.totalCost}</Text>
                  </View>
                  <View>
                    <TouchableOpacity
                      onPress={() => toggleSession(s._id)}
                      style={[styles.buttonBlue, { marginBottom: 5 }]}
                    >
                      <Text style={styles.buttonText}>
                        {openSession[s._id] ? "Hide" : "Show"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteSession(s._id)}
                      style={styles.buttonRed}
                    >
                      <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {openSession[s._id] && (
                  <View style={styles.sessionContent}>
                    <Text style={styles.heading3}>Add Record Manually</Text>
                    <View style={styles.manualEntryForm}>
                      <Text style={styles.label}>Start Time</Text>
                      <TextInput
                        style={styles.input}
                        value={newStartTime}
                        onChangeText={setNewStartTime}
                        placeholder="YYYY-MM-DDTHH:MM"
                      />
                      <Text style={styles.label}>Stop Time</Text>
                      <TextInput
                        style={styles.input}
                        value={newStopTime}
                        onChangeText={setNewStopTime}
                        placeholder="YYYY-MM-DDTHH:MM"
                      />
                      <TouchableOpacity
                        onPress={() => handleAddRecord(s._id)}
                        style={[styles.buttonGreen, { marginTop: 10 }]}
                      >
                        <Text style={styles.buttonText}>Add Record</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Records Table */}
                    {records.filter((r) => r.sessionId === s._id).length ===
                    0 ? (
                      <Text>No records found.</Text>
                    ) : (
                      <View style={styles.table}>
                        {renderTableRow(
                          ["Date", "Start", "Stop", "Duration", "Actions"],
                          "header",
                          true
                        )}
                        {records
                          .filter((r) => r.sessionId === s._id)
                          .map((record) => (
                            <View key={record._id} style={styles.tableRow}>
                              {editingRecordId === record._id ? (
                                <>
                                  <Text style={styles.tableCell}>
                                    {formatDateDMY(record.startTime)}
                                  </Text>
                                  <TextInput
                                    style={styles.tableInput}
                                    value={editStartTime}
                                    onChangeText={setEditStartTime}
                                  />
                                  <TextInput
                                    style={styles.tableInput}
                                    value={editStopTime}
                                    onChangeText={setEditStopTime}
                                  />
                                  <Text style={styles.tableCell}>
                                    {record.durationReadable}
                                  </Text>
                                  <View style={styles.tableCell}>
                                    <TouchableOpacity
                                      onPress={() => handleSaveEdit(record)}
                                      style={styles.buttonBlueSmall}
                                    >
                                      <Text style={styles.buttonTextSmall}>
                                        Save
                                      </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      onPress={handleCancelEdit}
                                      style={styles.buttonGraySmall}
                                    >
                                      <Text style={styles.buttonTextSmall}>
                                        Cancel
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                </>
                              ) : (
                                <>
                                  <Text style={styles.tableCell}>
                                    {formatDateDMY(record.startTime)}
                                  </Text>
                                  <Text style={styles.tableCell}>
                                    {format12Hour(record.startTime)}
                                  </Text>
                                  <Text style={styles.tableCell}>
                                    {record.stopTime
                                      ? format12Hour(record.stopTime)
                                      : "Running..."}
                                  </Text>
                                  <Text style={styles.tableCell}>
                                    {record.durationReadable}
                                  </Text>
                                  <View style={styles.tableCell}>
                                    <TouchableOpacity
                                      onPress={() => handleEditClick(record)}
                                      style={styles.buttonYellowSmall}
                                    >
                                      <Text style={styles.buttonTextSmall}>
                                        Edit
                                      </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      onPress={() => handleDelete(record)}
                                      style={styles.buttonRedSmall}
                                    >
                                      <Text style={styles.buttonTextSmall}>
                                        Delete
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                </>
                              )}
                            </View>
                          ))}
                      </View>
                    )}
                    <Text
                      style={[
                        styles.bold,
                        { marginTop: 10, textAlign: "right" },
                      ]}
                    >
                      Total Duration: {s.totalDurationReadable} | Total Cost: ₹
                      {s.totalCost}
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}

// StyleSheet for all components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f3f4f6",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20, // Added padding
    textAlign: "center", // Ensure text is centered
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  notFoundImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
    opacity: 0.7,
  },
  backLink: {
    color: "#3b82f6",
    marginBottom: 16,
    fontSize: 16,
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  heading1: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  heading2: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  heading3: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    marginBottom: 4,
  },
  bold: {
    fontWeight: "bold",
  },
  filterContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeFilter: {
    backgroundColor: "#2563eb",
  },
  inactiveFilter: {
    backgroundColor: "#e5e7eb",
  },
  activeFilterText: {
    color: "white",
    fontWeight: "bold",
  },
  inactiveFilterText: {
    color: "#374151",
  },
  depositCard: {
    backgroundColor: "white",
    borderRadius: 8,
  },
  depositHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  depositForm: {
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    paddingTop: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: "white",
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  buttonGreen: {
    backgroundColor: "#10b981",
    padding: 10,
    borderRadius: 6,
  },
  buttonBlue: {
    backgroundColor: "#3b82f6",
    padding: 10,
    borderRadius: 6,
  },
  buttonRed: {
    backgroundColor: "#ef4444",
    padding: 10,
    borderRadius: 6,
  },
  buttonOrange: {
    backgroundColor: "#f97316",
    padding: 10,
    borderRadius: 6,
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
    padding: 10,
    borderRadius: 6,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonGreenSmall: {
    backgroundColor: "#10b981",
    padding: 5,
    borderRadius: 4,
    margin: 2,
  },
  buttonBlueSmall: {
    backgroundColor: "#3b82f6",
    padding: 5,
    borderRadius: 4,
    margin: 2,
  },
  buttonRedSmall: {
    backgroundColor: "#ef4444",
    padding: 5,
    borderRadius: 4,
    margin: 2,
  },
  buttonYellowSmall: {
    backgroundColor: "#f59e0b",
    padding: 5,
    borderRadius: 4,
    margin: 2,
  },
  buttonGraySmall: {
    backgroundColor: "#6b7280",
    padding: 5,
    borderRadius: 4,
    margin: 2,
  },
  buttonTextSmall: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },

  historyContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    paddingTop: 12,
  },
  manualEntryForm: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    backgroundColor: "#f9fafb",
  },
  collapsibleContainer: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    marginBottom: 8,
    overflow: "hidden",
  },
  collapsibleHeader: {
    backgroundColor: "#f9fafb",
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  collapsibleHeaderText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  collapsibleHeaderSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  collapsibleContent: {
    padding: 12,
  },
  sessionBox: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#f9fafb",
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sessionContent: {
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    marginTop: 12,
    paddingTop: 12,
  },

  // Table Styles
  table: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  tableHeader: {
    fontWeight: "bold",
    backgroundColor: "#f9fafb",
    padding: 8,
    flex: 1,
  },
  tableCell: {
    flex: 1,
    padding: 8,
    flexWrap: "wrap", // Allow content to wrap
  },
  tableInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 4,
    borderRadius: 4,
    margin: 4,
    flex: 1,
  },
});