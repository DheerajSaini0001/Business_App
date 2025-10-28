import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // install if not: expo install @expo/vector-icons

const Navbar = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => setMenuVisible(!menuVisible);

  return (
    <View style={styles.navbar}>
      {/* 🏷️ App Name */}
      <Text style={styles.title}>Saini Record</Text>

      {/* 🍔 Hamburger Icon */}
      <TouchableOpacity onPress={toggleMenu}>
        <Ionicons name="menu" size={28} color="#fff" />
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
                console.log("Home Pressed");
                setMenuVisible(false);
                navigation.navigate("homeScreen");
              }}
            >
              <Text style={styles.menuText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                console.log("User Pressed");
                setMenuVisible(false);
                navigation.navigate("userLogin");
              }}
            >
              <Text style={styles.menuText}>User</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                console.log("Admin Pressed");
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

const styles = StyleSheet.create({
  navbar: {
    height: 60,
    backgroundColor: "#4a148c",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    elevation: 5,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  menu: {
    backgroundColor: "#fff",
    marginTop: 70,
    marginRight: 10,
    borderRadius: 8,
    paddingVertical: 10,
    width: 150,
    elevation: 6,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
});
