import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen({ navigation }) {
    const { theme, isDarkMode } = useTheme();
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async () => {
        if (!phone.trim()) {
            Alert.alert("Error", "Please enter your phone number");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("https://saini-record-management.onrender.com/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ identifier: phone.trim() })
            });

            const data = await response.json();

            if (response.status === 404) {
                Alert.alert("Error", "Account not found or not authorized.");
            } else if (response.ok) {
                Alert.alert("Success", `OTP sent! Your OTP is: ${data.otp}`);
                navigation.navigate("verifyOtp", { phone: phone.trim(), receivedOtp: data.otp });
            } else {
                Alert.alert("Error", data.message || "Failed to send OTP");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Network error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.text }]}>Forgot Password</Text>
                </View>

                <View style={[styles.formCard, { backgroundColor: theme.card }]}>
                    <Text style={[styles.description, { color: theme.subText }]}>
                        Enter your registered phone number to receive an OTP for password reset.
                    </Text>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Phone Number</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                            placeholder="Enter phone number"
                            placeholderTextColor={theme.subText}
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                        onPress={handleSendOtp}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.btnText}>Send OTP</Text>
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
        padding: 20,
        justifyContent: "center",
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    backBtn: {
        marginRight: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    formCard: {
        padding: 20,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    description: {
        fontSize: 14,
        marginBottom: 20,
        lineHeight: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
    },
    submitBtn: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
