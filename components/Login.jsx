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
  Platform,
  StatusBar // Added StatusBar
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Eye, EyeOff, UserCircle } from 'lucide-react-native'; // Added UserCircle

export default function LoginScreen({ navigation }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 

  // --- NEW: State to track input focus ---
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  // ----------------------------------------

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    // (Your existing handleSubmit logic... no changes needed here)
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
        
        navigation.reset({
               index: 0,
               routes: [{ name: 'Dashboard' }],
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
      {/* Set status bar style to match new background */}
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" /> 
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled" // Closes keyboard on tap
      >
        {/* --- NEW: Logo Container --- */}
        <View style={styles.logoContainer}>
          <UserCircle color="#3b82f6" size={64} />
        </View>
        {/* --------------------------- */}

        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => handleChange("email", text)}
            keyboardType="email-address"
            autoCapitalize="none"
            // --- UPDATED: Apply focus style dynamically ---
            style={[
              styles.input, 
              isEmailFocused && styles.inputFocused
            ]}
            onFocus={() => setIsEmailFocused(true)}
            onBlur={() => setIsEmailFocused(false)}
            // ---------------------------------------------
            autoComplete="email"
            textContentType="emailAddress"
            placeholderTextColor="#999" // Lighter placeholder text
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          {/* --- UPDATED: Apply focus style to container --- */}
          <View 
            style={[
              styles.passwordInputContainer,
              isPasswordFocused && styles.inputFocused
            ]}
          >
            <TextInput
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(text) => handleChange("password", text)}
              secureTextEntry={!showPassword} 
              style={styles.passwordInput}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              autoComplete="password"
              textContentType="password"
              placeholderTextColor="#999" // Lighter placeholder text
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)} 
              style={styles.passwordVisibilityToggle}
            >
              {showPassword ? (
                <Eye color="#666" size={20} />
              ) : (
                <EyeOff color="#666" size={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* --- NEW: Sign Up / Forgot Password --- */}

        {/* -------------------------------------- */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// --- NEW STYLES ---
const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: "#f8f9fa", // Lighter, cleaner background
  },
  scrollContainer: {
    flexGrow: 1, 
    padding: 24,
    justifyContent: "center",
    paddingBottom: 48, // Add padding at the bottom
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32, // Larger title
    fontWeight: "700", // Bolder
    textAlign: "center",
    marginBottom: 8,
    color: "#212529", // Darker text color
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6c757d', // Softer subtitle color
    marginBottom: 32,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 20, // Increased spacing
  },
  label: {
    fontSize: 14, // Slightly smaller label
    color: "#495057", // Medium gray
    marginBottom: 8,
    fontWeight: "600", // Bolder label
  },
  input: { 
    borderWidth: 1,
    borderColor: "#ced4da", // Lighter border
    borderRadius: 12, // More rounded corners
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fff', // White input background
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    // Elevation for Android
    elevation: 2,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 12,
    backgroundColor: '#fff',
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    // Elevation for Android
    elevation: 2,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#212529',
  },
  passwordVisibilityToggle: {
    padding: 12,
  },
  // --- NEW: Style for focused inputs ---
  inputFocused: {
    borderColor: '#3b82f6', // Primary blue border
    borderWidth: 2, // Make it pop
    // iOS shadow
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android elevation
    elevation: 5,
  },
  button: {
    backgroundColor: "#3b82f6", // Blue color
    padding: 16, // More padding
    borderRadius: 12, // Match input border radius
    alignItems: "center",
    marginTop: 24, 
    // Shadow for iOS
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    // Elevation for Android
    elevation: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  // --- NEW: Styles for links ---
  linksContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#6c757d',
    fontSize: 14,
    marginBottom: 8, // Space between links
  },
  signUpLink: {
    color: '#3b82f6',
    fontWeight: 'bold',
  }
});