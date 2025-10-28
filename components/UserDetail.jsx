import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

// Helper functions from web version
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

// Adapted helper to get a Date object, or null
const toDate = (isoString) => {
  if (!isoString) return null;
  return new Date(isoString);
};

export default function UserDetail() {
  const route = useRoute();
  const navigation = useNavigation();

  // Get full user object from route params
  const { user } = route.params;

  const [sessions, setSessions] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timerRunning, setTimerRunning] = useState(false);

  // State from web version
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editStartTime, setEditStartTime] = useState(null); // Use Date objects
  const [editStopTime, setEditStopTime] = useState(null); // Use Date objects

  const [newStartTime, setNewStartTime] = useState(null); // Use Date objects
  const [newStopTime, setNewStopTime] = useState(null); // Use Date objects

  const [openSession, setOpenSession] = useState({}); // Track toggle state

  // State for DateTimePicker
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [pickerConfig, setPickerConfig] = useState({
    onConfirm: () => {},
    onCancel: () => {},
    date: new Date(),
  });

  const COST_PER_HOUR = 150;
  const API_URL = "https://saini-record-management.onrender.com"; // Use your server URL

  const fetchSessions = async () => {
    if (!user?._id) return;
    try {
      const res = await fetch(`${API_URL}/session/${user._id}`);
      const data = await res.json();
      const sessionData = data.session || [];
      setSessions(sessionData);

      const allRecords = [];
      sessionData.forEach((s) => {
        (s.records || []).forEach((r) => {
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
            sessionId: s._id,
            durationReadable,
            cost,
            sessionDate: s.startTime, // For a consistent date column
          });
        });
      });

      allRecords.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setRecords(allRecords);
      setTimerRunning(!!allRecords.find((r) => !r.stopTime));
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  // --- DateTimePicker Handlers ---
  const hidePicker = () => setPickerVisible(false);
  
  const showPicker = (config) => {
    setPickerConfig({
      ...config,
      onCancel: hidePicker,
      onConfirm: (date) => {
        config.onConfirm(date);
        hidePicker();
      },
    });
    setPickerVisible(true);
  };

  // --- Accordion Handler ---
  const toggleSession = (sessionId) => {
    setOpenSession((prev) => ({ ...prev, [sessionId]: !prev[sessionId] }));
  };

  // --- API Handlers ---
  const handleAddSession = async () => {
    try {
      const res = await fetch(`${API_URL}/session/start/${user._id}`, {
        method: "POST",
      });
      if (res.ok) {
        Alert.alert("Success", "New session started!");
        fetchSessions();
      } else {
        const data = await res.json();
        Alert.alert("Error", data.message || "Failed to start session");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to start session");
    }
  };

  const handleEndSession = async () => {
    const active = sessions.find((s) => !s.stopTime);
    if (!active) return Alert.alert("Info", "No running session found.");
    try {
      const res = await fetch(`${API_URL}/session/end/${active._id}`, {
        method: "POST",
      });
      if (res.ok) {
        Alert.alert("Success", "Session ended!");
        fetchSessions();
      } else {
        const data = await res.json();
        Alert.alert("Error", data.message || "Failed to end session");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to end session");
    }
  };

  const handleStartRecord = async () => {
    if (timerRunning) return;
    const active = sessions.find((s) => !s.stopTime);
    if (!active) return Alert.alert("Info", "No active session! Start a session first.");

    try {
      const res = await fetch(`${API_URL}/session/addRecord/${active._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime: new Date().toISOString() }),
      });
      if (res.ok) fetchSessions();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to start record");
    }
  };

  const handleStopRecord = async () => {
    const activeSession = sessions.find((s) => !s.stopTime);
    if (!activeSession) return Alert.alert("Info", "No active session found.");
    const activeRecord = records.find((r) => !r.stopTime);
    if (!activeRecord) return;

    try {
      const res = await fetch(
        `${API_URL}/session/stopRecord/${activeSession._id}/${activeRecord._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stopTime: new Date().toISOString() }),
        }
      );
      if (res.ok) fetchSessions();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to stop record");
    }
  };

  const handleAddRecord = async (sessionId) => {
    if (!newStartTime || !newStopTime)
      return Alert.alert("Info", "Select start and stop time.");
    if (new Date(newStartTime) >= new Date(newStopTime))
      return Alert.alert("Info", "Stop time must be after start time.");

    try {
      const res = await fetch(
        `${API_URL}/session/addRecordToSession/${sessionId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startTime: newStartTime.toISOString(),
            stopTime: newStopTime.toISOString(),
          }),
        }
      );
      if (res.ok) {
        fetchSessions();
        setNewStartTime(null);
        setNewStopTime(null);
      } else {
        const data = await res.json();
        Alert.alert("Error", data.message || "Failed to add record");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to add record");
    }
  };

  const handleEditClick = (record) => {
    setEditingRecordId(record._id);
    setEditStartTime(toDate(record.startTime));
    setEditStopTime(toDate(record.stopTime));
  };

  const handleCancelEdit = () => {
    setEditingRecordId(null);
    setEditStartTime(null);
    setEditStopTime(null);
  };

  const handleSaveEdit = async (record) => {
    try {
      const payload = {
        startTime: editStartTime.toISOString(),
        stopTime: editStopTime.toISOString(),
      };
      const res = await fetch(
        `${API_URL}/session/editRecord/${record.sessionId}/${record._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (res.ok) {
        fetchSessions();
        handleCancelEdit();
      } else {
        Alert.alert("Error", "Failed to save record");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save record");
    }
  };

  const handleDelete = (record) => {
    Alert.alert(
      "Delete Record",
      "Are you sure you want to delete this record?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(
                `${API_URL}/session/deleteRecord/${record.sessionId}/${record._id}`,
                { method: "DELETE" }
              );
              if (res.ok) {
                fetchSessions();
              } else {
                Alert.alert("Error", "Failed to delete record");
              }
            } catch (err) {
              console.error(err);
              Alert.alert("Error", "Failed to delete record");
            }
          },
        },
      ]
    );
  };

  const handleDeleteSession = (sessionId) => {
    Alert.alert(
      "Delete Session",
      "Are you sure you want to delete this entire session and all its records?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(
                `${API_URL}/session/deleteSession/${sessionId}`,
                { method: "DELETE" }
              );
              if (res.ok) {
                Alert.alert("Success", "Session deleted successfully!");
                fetchSessions();
              } else {
                const data = await res.json();
                Alert.alert("Error", data.message || "Failed to delete session");
              }
            } catch (error) {
              console.error("Error deleting session:", error);
              Alert.alert("Error", "Server error while deleting session");
            }
          },
        },
      ]
    );
  };

  const handleTanker = () => {
    // Assuming you have a screen named "Tanker" in your navigator
    navigation.navigate("Tanker");
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6b21a8" />
        <Text>Loading sessions...</Text>
      </View>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back to Dashboard</Text>
        </TouchableOpacity>

        {/* USER CARD */}
        <View style={styles.card}>
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.cardText}>Username: {user.username}</Text>
          <Text style={styles.cardText}>Email: {user.email}</Text>
          <Text style={styles.cardText}>Phone: {user.phone}</Text>
          <Text style={styles.cardText}>Role: {user.role}</Text>
          <Text style={styles.cardText}>
            Registered: {new Date(user.createdAt).toLocaleDateString()}
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.greenBtn} onPress={handleAddSession}>
              <Text style={styles.btnText}>Add Session</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.redBtn} onPress={handleEndSession}>
              <Text style={styles.btnText}>End Session</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.greenBtn, timerRunning && styles.disabledBtn]}
              disabled={timerRunning}
              onPress={handleStartRecord}
            >
              <Text style={styles.btnText}>Start Record</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.redBtn, !timerRunning && styles.disabledBtn]}
              disabled={!timerRunning}
              onPress={handleStopRecord}
            >
              <Text style={styles.btnText}>Stop Record</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tankerButtonContainer}>
            <TouchableOpacity style={styles.tankerBtn} onPress={handleTanker}>
              <Text style={styles.btnText}>Tanker</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SESSIONS */}
        {sessions.map((session, idx) => {
          const sessionRecords = records.filter(
            (r) => r.sessionId === session._id
          );
          const totalDurationReadable = session.totalDurationReadable;
          const totalCost = session.totalCost;
          const isOpen = openSession[session._id];

          return (
            <View key={session._id} style={styles.sessionCard}>
              {/* Session Header */}
              <View style={styles.sessionHeader}>
                <View style={styles.sessionHeaderLeft}>
                  <Text style={styles.sessionTitle}>
                    Session {session.sessionNo || idx + 1}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteSession(session._id)}
                    style={styles.deleteSessionBtn}
                  >
                    <Text style={styles.deleteSessionBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => toggleSession(session._id)}>
                  <Text style={styles.toggleBtnText}>
                    {isOpen ? "Hide Records ▲" : "Show Records ▼"}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sessionTimeText}>
                {session.startTime && new Date(session.startTime).toLocaleString()}
                {session.stopTime &&
                  ` → ${new Date(session.stopTime).toLocaleString()}`}
              </Text>

              {/* Records Table - Toggleable */}
              {isOpen && (
                <View>
                  {/* Add Manual Record Form */}
                  <View style={styles.manualAddForm}>
                    <Text style={styles.manualAddTitle}>
                      Add Record Manually
                    </Text>
                    <View style={styles.pickerRow}>
                      <TouchableOpacity
                        style={styles.pickerBtn}
                        onPress={() =>
                          showPicker({
                            date: newStartTime || new Date(),
                            onConfirm: (date) => setNewStartTime(date),
                          })
                        }
                      >
                        <Text style={styles.pickerBtnText}>
                          {newStartTime
                            ? newStartTime.toLocaleString()
                            : "Set Start Time"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.pickerBtn}
                        onPress={() =>
                          showPicker({
                            date: newStopTime || new Date(),
                            onConfirm: (date) => setNewStopTime(date),
                          })
                        }
                      >
                        <Text style={styles.pickerBtnText}>
                          {newStopTime
                            ? newStopTime.toLocaleString()
                            : "Set Stop Time"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={styles.addRecordBtn}
                      onPress={() => handleAddRecord(session._id)}
                    >
                      <Text style={styles.btnText}>Add Record</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Records List */}
                  <View style={styles.recordsTable}>
                    {/* Header Row */}
                    <View style={styles.tableRowHeader}>
                      <Text style={[styles.tableCell, styles.tableHeader, { flex: 2 }]}>Date</Text>
                      <Text style={[styles.tableCell, styles.tableHeader, { flex: 2 }]}>Start</Text>
                      <Text style={[styles.tableCell, styles.tableHeader, { flex: 2 }]}>Stop</Text>
                      <Text style={[styles.tableCell, styles.tableHeader, { flex: 3 }]}>Duration</Text>
                      <Text style={[styles.tableCell, styles.tableHeader, { flex: 3, textAlign: 'right' }]}>Actions</Text>
                    </View>

                    {/* Data Rows */}
                    {sessionRecords.map((r) =>
                      editingRecordId === r._id ? (
                        // --- Edit Mode ---
                        <View key={r._id} style={styles.tableRowEdit}>
                          <TouchableOpacity
                            style={styles.editPickerBtn}
                            onPress={() =>
                              showPicker({
                                date: editStartTime || new Date(),
                                onConfirm: (date) => setEditStartTime(date),
                              })
                            }
                          >
                            <Text style={styles.pickerBtnTextSmall}>
                              {editStartTime
                                ? editStartTime.toLocaleString()
                                : "Set Start"}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.editPickerBtn}
                            onPress={() =>
                              showPicker({
                                date: editStopTime || new Date(),
                                onConfirm: (date) => setEditStopTime(date),
                              })
                            }
                          >
                            <Text style={styles.pickerBtnTextSmall}>
                              {editStopTime
                                ? editStopTime.toLocaleString()
                                : "Set Stop"}
                            </Text>
                          </TouchableOpacity>
                          <View style={styles.editActions}>
                            <TouchableOpacity
                              style={styles.saveBtn}
                              onPress={() => handleSaveEdit(r)}
                            >
                              <Text style={styles.btnTextSmall}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.cancelBtn}
                              onPress={handleCancelEdit}
                            >
                              <Text style={styles.btnTextSmall}>Cancel</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        // --- Display Mode ---
                        <View key={r._id} style={styles.tableRow}>
                          <Text style={[styles.tableCell, { flex: 2 }]}>{formatDateDMY(r.sessionDate)}</Text>
                          <Text style={[styles.tableCell, { flex: 2 }]}>{format12Hour(r.startTime)}</Text>
                          <Text style={[styles.tableCell, { flex: 2 }]}>{format12Hour(r.stopTime)}</Text>
                          <Text style={[styles.tableCell, { flex: 3 }]}>{r.durationReadable}</Text>
                          <View style={[styles.tableCell, { flex: 3, flexDirection: 'row', justifyContent: 'flex-end' }]}>
                            <TouchableOpacity
                              style={styles.editBtn}
                              onPress={() => handleEditClick(r)}
                            >
                              <Text style={styles.btnTextSmall}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.deleteBtn}
                              onPress={() => handleDelete(r)}
                            >
                              <Text style={styles.btnTextSmall}>Delete</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )
                    )}
                  </View>
                  <Text style={styles.sessionTotalText}>
                    Total Duration: {totalDurationReadable} | Total Cost: ₹
                    {totalCost}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Global DateTimePicker Modal */}
      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode="datetime"
        date={pickerConfig.date || new Date()}
        onConfirm={pickerConfig.onConfirm}
        onCancel={pickerConfig.onCancel}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f3f4f6" },
  container: { padding: 16 },
  backBtn: { color: "#2563eb", marginBottom: 10, fontSize: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.4,
  },
  name: { fontSize: 22, fontWeight: "bold", marginBottom: 8, color: "#111827" },
  cardText: { fontSize: 14, marginBottom: 4, color: "#374151" },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  greenBtn: {
    backgroundColor: "#16a34a",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    flex: 1,
    minWidth: 120,
  },
  redBtn: {
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    flex: 1,
    minWidth: 120,
  },
  tankerButtonContainer: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  tankerBtn: {
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  disabledBtn: { opacity: 0.5 },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  btnTextSmall: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  sessionCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 8,
    marginBottom: 8,
  },
  sessionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sessionTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  deleteSessionBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteSessionBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  toggleBtnText: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 14,
  },
  sessionTimeText: { fontSize: 12, color: "#6b7280", marginBottom: 12 },
  manualAddForm: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  manualAddTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  pickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },
  pickerBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  pickerBtnText: { color: "#374151", fontSize: 12 },
  pickerBtnTextSmall: { color: "#374151", fontSize: 10 },
  addRecordBtn: {
    backgroundColor: "#16a34a",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  recordsTable: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRowHeader: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 6,
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRowEdit: {
    padding: 10,
    backgroundColor: "#fef9c3",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableCell: { fontSize: 12, color: "#374151", flex: 1 },
  tableHeader: { fontWeight: "bold", fontSize: 12, color: "#111827" },
  editPickerBtn: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    alignItems: "center",
    marginBottom: 8,
  },
  editActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  editBtn: {
    backgroundColor: "#f59e0b",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  deleteBtn: {
    backgroundColor: "#ef4444",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  saveBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  cancelBtn: {
    backgroundColor: "#6b7280",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  sessionTotalText: {
    textAlign: "right",
    fontWeight: "bold",
    marginTop: 10,
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
});
