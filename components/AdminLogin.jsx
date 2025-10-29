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
// Import AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import the specific icons from lucide-react-native
import { Eye, EyeOff } from 'lucide-react-native';

export default function AdminLogin({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // --- NEW STATE FOR PASSWORD VISIBILITY ---
  const [showPassword, setShowPassword] = useState(false);

  // --- UPDATED FUNCTION ---
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://saini-record-management.onrender.com/admin/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // We still need to read the data to process the request
      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success 🎉", "Login successful!");
        
        await AsyncStorage.setItem("adminToken", data.token);
        
        navigation.navigate("adminDashboard");
      } else {
        // ANY failed login (wrong email, wrong password, etc.)
        // will now show "invalid candidate"
        Alert.alert("Login Failed ❌", "invalid candidate");
      }
    } catch (error) {
      // This will catch network errors (server down, no internet)
      console.error(error);
      Alert.alert("Network Error ❌", "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };
  // --- END OF UPDATED FUNCTION ---

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Admin Login</Text>

      {/* Email Field */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your admin email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* --- MODIFIED PASSWORD FIELD --- */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword} // Use state to toggle
          />
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)} 
            style={styles.passwordVisibilityToggle}
          >
            {showPassword ? (
              <Eye color="#888" size={20} />
            ) : (
              <EyeOff color="#888" size={20} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      {/* --- END OF MODIFICATION --- */}


      {/* Login Button */}
      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      {/* Forgot Password */}
      {/* <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => Alert.alert("Info", "Forgot password feature coming soon!")}
      >
        <Text style={styles.linkText}>Forgot Password?</Text>
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f6f9",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4a148c",
    marginBottom: 35,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 6,
  },
  input: { // This style is for the Email input
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  // --- NEW STYLES FOR PASSWORD INPUT ---
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  passwordVisibilityToggle: {
    padding: 10, // Good touchable area
  },
  // --- END NEW STYLES ---
  button: {
    backgroundColor: "#4a148c",
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
  linkContainer: {
    marginTop: 15,
  },
  linkText: {
    color: "#2575fc",
    textDecorationLine: "underline",
    fontSize: 15,
  },
});