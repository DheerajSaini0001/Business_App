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
  StatusBar
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Eye, EyeOff, UserCircle } from 'lucide-react-native';
import { useTheme } from "../context/ThemeContext"; // ✅ import context
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminLoginScreen from "./AdminLoginScreen";

function MyTabBar({ state, descriptors, navigation }) {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();

  return (
    <View style={{ flexDirection: 'row' }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <PlatformPressable
            href={buildHref(route.name, route.params)}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{ flex: 1 }}
          >
            <Text style={{ color: isFocused ? colors.primary : colors.text }}>
              {label}
            </Text>
          </PlatformPressable>
        );
      })}
    </View>
  );
}


export default function UserLoginScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme(); // ✅ get theme values

  const [formData, setFormData] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isphoneFocused, setIsPhoneFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    const trimmedPassword = formData.password.trim();
    const phone = formData.phone.trim();

    if (!trimmedPassword) {
      Alert.alert("Missing Fields", "Please fill all fields!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://saini-record-management.onrender.com/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone, password: trimmedPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success 🎉", "Login successful!");
        await AsyncStorage.setItem("userToken", data.token);
        await AsyncStorage.setItem("userId", data.id);

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
      style={[styles.container, { backgroundColor: theme.background }]} // ✅ dynamic background
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <UserCircle color={theme.primary} size={64} />
        </View>

        <Text style={[styles.title, { color: theme.text }]}>
          Welcome Back!
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Sign in to continue
        </Text>

        {/* phone */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Phone Number</Text>
          <TextInput
            placeholder="Enter your Phone Number"
            value={formData.phone}
            onChangeText={(text) => handleChange("phone", text)}
            keyboardType="phone-pad"
            autoCapitalize="none"
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: isphoneFocused ? theme.primary : theme.border
              }
            ]}
            onFocus={() => setIsPhoneFocused(true)}
            onBlur={() => setIsPhoneFocused(false)}
            placeholderTextColor={theme.placeholder}
          />
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
          <View
            style={[
              styles.passwordInputContainer,
              {
                backgroundColor: theme.card,
                borderColor: isPasswordFocused ? theme.primary : theme.border
              }
            ]}
          >
            <TextInput
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(text) => handleChange("password", text)}
              secureTextEntry={!showPassword}
              style={[styles.passwordInput, { color: theme.text }]}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              placeholderTextColor={theme.placeholder}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.passwordVisibilityToggle}
            >
              {showPassword ? (
                <Eye color={theme.icon} size={20} />
              ) : (
                <EyeOff color={theme.icon} size={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }, loading && { opacity: 0.7 }]}
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
    paddingBottom: 48,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    elevation: 2,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    elevation: 2,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  passwordVisibilityToggle: {
    padding: 12,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    elevation: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
