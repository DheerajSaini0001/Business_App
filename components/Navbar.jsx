import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Context/ThemeContext"; // ✅ import theme hook

const Navbar = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const { theme, isDarkMode, toggleTheme } = useTheme(); // ✅ Access theme + toggle

  const toggleMenu = () => setMenuVisible(!menuVisible);

  // ✅ Dynamic styles based on theme
  const styles = getStyles(theme);

  return (
    <View style={styles.navbar}>
      {/* 🏷️ App Name */}
      <Text style={styles.title}>Saini Record</Text>



      {/* 🍔 Hamburger Icon */}
      <TouchableOpacity onPress={toggleTheme}>
         <Ionicons
          name={isDarkMode ? "sunny-outline" : "moon-outline"}
          size={24}
          color={theme.text}
          style={{ marginRight: 10 }}
        />
      </TouchableOpacity>

      {/* 🧾 Menu Modal */}
      <Modal
        transparent={true}
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        {/* Background overlay */}
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPressOut={() => setMenuVisible(false)}
        >
          {/* Menu Box */}
          <View style={styles.menu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("homeScreen");
              }}
            >
              <Text style={styles.menuText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("userLogin");
              }}
            >
              <Text style={styles.menuText}>User</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("adminLogin");
              }}
            >
              <Text style={styles.menuText}>Admin</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Navbar;

// ✅ Dynamic styles (theme-based)
const getStyles = (theme) =>
  StyleSheet.create({
    navbar: {
      height: 60,
      backgroundColor: theme.card, // themed background
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      elevation: 5,
      borderBottomWidth: 1,
      borderColor: theme.border,
    },
    title: {
      color: theme.text,
      fontSize: 20,
      fontWeight: "bold",
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)", // semi-dark overlay
      justifyContent: "flex-start",
      alignItems: "flex-end",
    },
    menu: {
      backgroundColor: theme.card,
      marginTop: 70,
      marginRight: 10,
      borderRadius: 8,
      paddingVertical: 10,
      width: 150,
      elevation: 6,
      borderWidth: 1,
      borderColor: theme.border,
    },
    menuItem: {
      paddingVertical: 10,
      paddingHorizontal: 15,
    },
    menuText: {
      fontSize: 16,
      color: theme.text,
    },
  });
