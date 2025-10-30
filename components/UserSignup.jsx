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
} from "react-native";

export default function UserSignup({ navigation }) {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user",
    terms: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle change
  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle submit
  const handleSubmit = async () => {
    if (
      !formData.fullName ||
      !formData.username ||
      !formData.email ||
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
      const response = await fetch("https://saini-record-management.onrender.com/users/UserSignup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success 🎉", "Signup successful!");
        setFormData({
          fullName: "",
          username: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          role: "user",
          terms: false,
        });
        navigation.navigate("userLogin");
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Create an Account</Text>

      {/* This message text will appear if you set the 'message' state */}
      {message ? <Text style={styles.message}>{message}</Text> : null}

      {/* --- Full Name --- */}
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your full name"
        value={formData.fullName}
        onChangeText={(text) => handleChange("fullName", text)}
      />

      {/* --- Username --- */}
      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Choose a username"
        value={formData.username}
        onChangeText={(text) => handleChange("username", text)}
      />

      {/* --- Email --- */}
      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={formData.email}
        onChangeText={(text) => handleChange("email", text)}
      />

      {/* --- Phone --- */}
      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
        value={formData.phone}
        onChangeText={(text) => handleChange("phone", text)}
      />

      {/* --- Password --- */}
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Create a password"
        secureTextEntry
        value={formData.password}
        onChangeText={(text) => handleChange("password", text)}
      />

      {/* --- Confirm Password --- */}
      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirm your password"
        secureTextEntry
        value={formData.confirmPassword}
        onChangeText={(text) => handleChange("confirmPassword", text)}
      />

      {/* Terms */}
      <View style={styles.termsContainer}>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={formData.terms ? "#4a148c" : "#f4f3f4"}
          onValueChange={(val) => handleChange("terms", val)}
          value={formData.terms}
        />
        <Text style={styles.termsText}>I agree to the terms & conditions</Text>
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
      <TouchableOpacity onPress={() => navigation.navigate("userLogin")}>
        <Text style={styles.loginLink}>
          Already have an account? Login here
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#4a148c",
  },
  // --- NEW STYLE for labels ---
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333", // Dark grey for label
  },
  input: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    fontSize: 16,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    marginTop: 5, // Added some space above
  },
  termsText: {
    marginLeft: 10,
    color: "#555",
    fontSize: 15,
  },
  button: {
    backgroundColor: "#4a148c",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  loginLink: {
    textAlign: "center",
    color: "#4a148c",
    fontWeight: "500",
    marginTop: 5,
    fontSize: 15,
  },
  // Added a style for the 'message' text
  message: {
    textAlign: "center",
    fontSize: 16,
    color: "red", // Default to red for errors
    marginBottom: 15,
  },

  // --- These styles were in your code but not used, ---
  // --- I'm leaving them in case you need them later ---
  roleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    gap: 10,
  },
  roleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4a148c",
  },
  activeRoleButton: {
    backgroundColor: "#4a148c",
  },
  roleText: {
    color: "#4a148c",
    fontWeight: "600",
  },
  activeRoleText: {
    color: "#fff",
  },
});