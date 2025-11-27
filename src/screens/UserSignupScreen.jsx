import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { User, Phone, Lock, CheckCircle } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function UserSignup({ navigation }) {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user",
    terms: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "homeScreen" }],
    });
  };

  // Handle change
  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle submit
  const handleSubmit = async () => {
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      Alert.alert("Error", "Please fill all fields!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    if (!formData.terms) {
      Alert.alert("Error", "You must accept the terms and conditions!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "https://saini-record-management.onrender.com/users/UserSignup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success 🎉", "User Added Successfully!");
        setFormData({
          fullName: "",
          phone: "",
          password: "",
          confirmPassword: "",
          role: "user",
          terms: false,
        });
        navigation.navigate("adminDashboard");
      } else {
        Alert.alert("Signup Failed ❌", data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Network Error ❌", "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#4c669f", "#3b5998", "#192f6a"]}
      style={styles.gradientBackground}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.card}>
            <Text style={styles.header}>Add User</Text>

            {/* This message text will appear if you set the 'message' state */}
            {message ? <Text style={styles.message}>{message}</Text> : null}

            {/* --- Full Name --- */}
            <View style={styles.inputContainer}>
              <User color="#666" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#999"
                value={formData.fullName}
                onChangeText={(text) => handleChange("fullName", text)}
              />
            </View>

            {/* --- Phone --- */}
            <View style={styles.inputContainer}>
              <Phone color="#666" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => handleChange("phone", text)}
              />
            </View>

            {/* --- Password --- */}
            <View style={styles.inputContainer}>
              <Lock color="#666" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => handleChange("password", text)}
              />
            </View>

            {/* --- Confirm Password --- */}
            <View style={styles.inputContainer}>
              <CheckCircle color="#666" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                secureTextEntry
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange("confirmPassword", text)}
              />
            </View>

            {/* Terms */}
            <View style={styles.termsContainer}>
              <Switch
                trackColor={{ false: "#767577", true: "#4c669f" }}
                thumbColor={formData.terms ? "#fff" : "#f4f3f4"}
                onValueChange={(val) => handleChange("terms", val)}
                value={formData.terms}
              />
              <Text style={styles.termsText}>
                I agree to the terms & conditions
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <TouchableOpacity onPress={handleLogin} style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginLinkBold}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
  },
  message: {
    textAlign: "center",
    fontSize: 14,
    color: "#e74c3c",
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: "#333",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    marginTop: 5,
  },
  termsText: {
    marginLeft: 10,
    color: "#555",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#4c669f",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#4c669f",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginLinkContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  loginLinkText: {
    color: "#666",
    fontSize: 15,
  },
  loginLinkBold: {
    color: "#4c669f",
    fontWeight: "bold",
  },
});