import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet,
  Alert 
} from "react-native";
// Import AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import the specific icons from lucide-react-native
import { Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen({ navigation }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Missing Fields", "Please fill all fields!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://saini-record-management.onrender.com/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success 🎉", "Login successful!");
        // Store token locally
        await AsyncStorage.setItem("token", data.token);

        navigation.navigate("Dashboard");
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
    <View style={styles.container}>
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
        />
      </View>

      {/* --- MODIFIED PASSWORD FIELD SECTION --- */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            placeholder="Enter your password"
            value={formData.password}
            onChangeText={(text) => handleChange("password", text)}
            secureTextEntry={!showPassword} // Conditionally set secureTextEntry
            style={styles.passwordInput}
          />
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)} 
            style={styles.passwordVisibilityToggle}
          >
            {/* Conditionally render the Lucide icons */}
            {showPassword ? (
              <Eye color="#888" size={20} />
            ) : (
              <EyeOff color="#888" size={20} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      {/* --- END OF MODIFICATION --- */}

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
    </View>
  );
}

// 💅 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
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
  input: { // Regular input style (for email)
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
  },
  // --- STYLES FOR PASSWORD FIELD (no changes needed here) ---
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingRight: 12, // Space for the icon
  },
  passwordInput: {
    flex: 1, // Allow TextInput to take available space
    padding: 12,
  },
  passwordVisibilityToggle: {
    padding: 10, // Make the touchable area larger
  },
  // --- END STYLES ---
  button: {
    backgroundColor: "#3b82f6",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20, // Added margin for better spacing
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});