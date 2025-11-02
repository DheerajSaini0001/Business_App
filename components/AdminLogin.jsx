import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Eye, EyeOff } from "lucide-react-native";
import { useTheme } from "../Context/ThemeContext"; // 👈 import theme context

export default function AdminLogin({ navigation }) {
  const { theme, isDarkMode } = useTheme(); // 🎨 get theme and mode
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://saini-record-management.onrender.com/admin/admin-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success 🎉", "Login successful!");
        await AsyncStorage.setItem("adminToken", data.token);

        navigation.reset({
          index: 0,
          routes: [{ name: "adminDashboard" }],
        });
      } else {
        Alert.alert("Login Failed ❌", "Invalid candidate");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Network Error ❌", "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <Text style={[styles.heading, { color: theme.primary }]}>
        Admin Login
      </Text>

      {/* Email Field */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.text }]}>Email</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: isDarkMode ? "#555" : "#bbb",
            },
          ]}
          placeholder="Enter your admin email"
          placeholderTextColor={isDarkMode ? "#aaa" : "#666"}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Password Field */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.text }]}>Password</Text>
        <View
          style={[
            styles.passwordInputContainer,
            {
              backgroundColor: theme.card,
              borderColor: isDarkMode ? "#555" : "#bbb",
            },
          ]}
        >
          <TextInput
            style={[styles.passwordInput, { color: theme.text }]}
            placeholder="Enter your password"
            placeholderTextColor={isDarkMode ? "#aaa" : "#666"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.passwordVisibilityToggle}
          >
            {showPassword ? (
              <Eye color={isDarkMode ? "#aaa" : "#666"} size={20} />
            ) : (
              <EyeOff color={isDarkMode ? "#aaa" : "#666"} size={20} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Login Button */}
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: theme.primary },
          loading && { opacity: 0.7 },
        ]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 35,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  passwordVisibilityToggle: {
    padding: 10,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
