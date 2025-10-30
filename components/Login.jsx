import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView, 
  Platform 
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen({ navigation }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    const trimmedEmail = formData.email.trim();
    const trimmedPassword = formData.password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert("Missing Fields", "Please fill all fields!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://saini-record-management.onrender.com/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success 🎉", "Login successful!");
        await AsyncStorage.setItem("token", data.token);
        
        // This reset is correct for logging in
        navigation.reset({
               index: 0,
               routes: [{ name: 'Dashboard' }], // Make sure 'Dashboard' is the correct screen name
        });
      } else {
        Alert.alert("Login Failed ❌", data.error || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Network Error", "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>User Login</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => handleChange("email", text)}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            // --- FIX 1: Add these props for email autofill ---
            autoComplete="email"
            textContentType="emailAddress"
            // --------------------------------------------------
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(text) => handleChange("password", text)}
              secureTextEntry={!showPassword} 
              style={styles.passwordInput}
              // --- FIX 2: Add these props for password autofill ---
              autoComplete="password"
              textContentType="password"
              // ----------------------------------------------------
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

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1, 
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#333", // Added a color for the title
  },
  inputGroup: {
    width: "100%",
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 6,
    fontWeight: "500",
  },
  input: { 
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    fontSize: 16, // Added font size
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    // Removed paddingRight, adding it to the toggle button instead
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16, // Added font size
  },
  passwordVisibilityToggle: {
    padding: 10,
    paddingRight: 12, // Ensure toggle is not flush with the border
  },
  button: {
    backgroundColor: "#3b82f6", // Blue color
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20, 
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});