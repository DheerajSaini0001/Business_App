import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🏠 Welcome to the Home Screen!</Text>
      <Text style={styles.subText}>This is your component showing at "/"</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
  },
  text: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  subText: {
    color: "#ccc",
    fontSize: 16,
    marginTop: 8,
  },
});
