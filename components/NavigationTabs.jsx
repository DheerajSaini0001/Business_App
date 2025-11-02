
import React, { useState, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ThemeContext } from "../Context/ThemeContext"; // ✅ import your theme context

const NavigationTabs = () => {
  const [activeTab, setActiveTab] = useState("User");
  const { theme, isDarkMode } = useContext(ThemeContext); // ✅ get theme & mode

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Tabs */}
      <View
        style={[
          styles.tabRow,
          { backgroundColor: isDarkMode ? "#222" : "#fff" },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "User" && {
              backgroundColor: theme.primary,
            },
          ]}
          onPress={() => setActiveTab("User")}
        >
          <Text
            style={[
              styles.tabText,
              { color: theme.text },
              activeTab === "User" && { color: "#fff" },
            ]}
          >
            User
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "Admin" && {
              backgroundColor: theme.primary,
            },
          ]}
          onPress={() => setActiveTab("Admin")}
        >
          <Text
            style={[
              styles.tabText,
              { color: theme.text },
              activeTab === "Admin" && { color: "#fff" },
            ]}
          >
            Admin
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content area */}
      <View style={styles.content}>
        {activeTab === "User" ? (
          <Text style={[styles.contentText, { color: theme.text }]}>
            👤 User Section Content
          </Text>
        ) : (
          <Text style={[styles.contentText, { color: theme.text }]}>
            🛠️ Admin Section Content
          </Text>
        )}
      </View>
    </View>
  );
};

export default NavigationTabs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    elevation: 4,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentText: {
    fontSize: 18,
  },
});
