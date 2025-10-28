import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🏠 Welcome to Saini Record!</Text>
      <Text style={styles.subText}>Please choose an option below</Text>

      {/* Buttons Section */}
      <View style={styles.buttonContainer}>
        {/* 🔹 User Login */}
        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={() => navigation.navigate("userLogin")}
        >
          <Text style={styles.buttonText}>User Login</Text>
        </TouchableOpacity>

        {/* 🔹 User Signup */}
        <TouchableOpacity
          style={[styles.button, styles.signupButton]}
          onPress={() => navigation.navigate("userSignup")}
        >
          <Text style={styles.buttonText}>User Signup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    paddingHorizontal: 20,
  },
  text: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subText: {
    color: "#ccc",
    fontSize: 16,
    marginBottom: 40,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    gap: 20,
  },
  button: {
    width: "80%",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  loginButton: {
    backgroundColor: "#6a11cb", // purple gradient start
  },
  signupButton: {
    backgroundColor: "#2575fc", // blue gradient start
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
