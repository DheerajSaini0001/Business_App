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
import { User, Phone, Lock, CheckCircle, ArrowLeft } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

// --- Brand Colors ---
const COLORS = {
  NAVY: '#0B1C38',
  GOLD: '#BFA15F',
  WHITE: '#FFFFFF',
  GRAY_LIGHT: '#F8FAFC',
  GRAY_BORDER: '#E2E8F0',
  TEXT_MAIN: '#1E293B',
  TEXT_SUB: '#64748B'
};

export default function UserSignup({ navigation }) {
  const [formData, setFormData] = useState({
    userid: "",
    fullName: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user",
    terms: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (
      !formData.userid ||
      !formData.fullName ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    if (!formData.terms) {
      Alert.alert("Terms Required", "Please accept the terms and conditions.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const adminId = await AsyncStorage.getItem("adminId");
      const adminToken = await AsyncStorage.getItem("adminToken");

      if (!adminId) {
        Alert.alert("Authentication Error", "Admin ID not found. Please login again.");
        setLoading(false);
        return;
      }

      const payload = { ...formData, adminId };

      const response = await fetch(
        "https://water-record-management-system-back.vercel.app/users/UserSignup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(adminToken ? { "Authorization": `Bearer ${adminToken}` } : {})
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "New User Added Successfully!");
        setFormData({
          userid: "",
          fullName: "",
          phone: "",
          password: "",
          confirmPassword: "",
          role: "user",
          terms: false,
        });
        navigation.goBack();
      } else {
        Alert.alert("Registration Failed", data.error || "Please check your inputs and try again.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Network Error", "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: COLORS.WHITE }}
    >
      <ScrollView contentContainerStyle={styles.container}>

        {/* --- Header --- */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color={COLORS.NAVY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New User</Text>
        </View>

        <View style={styles.brandingContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={styles.subHeader}>Create User Account</Text>
        </View>

        {/* --- Form --- */}
        <View style={styles.formContainer}>

          {/* User ID */}
          <View style={styles.inputGroup}>
            <View style={styles.iconContainer}>
              <User color={COLORS.NAVY} size={20} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="User ID"
              placeholderTextColor={COLORS.TEXT_SUB}
              value={formData.userid}
              onChangeText={(text) => handleChange("userid", text)}
              autoCapitalize="none"
            />
          </View>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <View style={styles.iconContainer}>
              <User color={COLORS.NAVY} size={20} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={COLORS.TEXT_SUB}
              value={formData.fullName}
              onChangeText={(text) => handleChange("fullName", text)}
            />
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <View style={styles.iconContainer}>
              <Phone color={COLORS.NAVY} size={20} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Phone Number (Optional)"
              placeholderTextColor={COLORS.TEXT_SUB}
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(text) => handleChange("phone", text)}
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <View style={styles.iconContainer}>
              <Lock color={COLORS.NAVY} size={20} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.TEXT_SUB}
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => handleChange("password", text)}
            />
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <View style={styles.iconContainer}>
              <CheckCircle color={COLORS.NAVY} size={20} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={COLORS.TEXT_SUB}
              secureTextEntry
              value={formData.confirmPassword}
              onChangeText={(text) => handleChange("confirmPassword", text)}
            />
          </View>

          {/* Terms Switch */}
          <View style={styles.termsRow}>
            <Switch
              trackColor={{ false: "#CBD5E1", true: COLORS.NAVY }}
              thumbColor={COLORS.WHITE}
              ios_backgroundColor="#CBD5E1"
              onValueChange={(val) => handleChange("terms", val)}
              value={formData.terms}
            />
            <Text style={styles.termsText}>I agree to the Terms & Conditions</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.NAVY} />
            ) : (
              <Text style={styles.btnText}>Create User</Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: COLORS.WHITE,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  backBtn: {
    padding: 8,
    marginRight: 12,
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.NAVY,
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.NAVY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.NAVY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.GOLD,
  },
  subHeader: {
    fontSize: 16,
    color: COLORS.TEXT_SUB,
    fontWeight: '500',
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.GRAY_BORDER,
    height: 56,
    paddingHorizontal: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: COLORS.NAVY,
    fontWeight: '500',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  termsText: {
    fontSize: 14,
    color: COLORS.TEXT_MAIN,
  },
  submitBtn: {
    backgroundColor: COLORS.GOLD,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: COLORS.GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: {
    color: COLORS.NAVY,
    fontSize: 18,
    fontWeight: 'bold',
  },
});