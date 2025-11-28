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

export default function VerifyOtpScreen({ route, navigation }) {
    const { phone, receivedOtp } = route.params;
    const { theme } = useTheme();
    const [otp, setOtp] = useState(receivedOtp ? String(receivedOtp) : "");
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        if (!otp.trim()) {
            Alert.alert("Error", "Please enter the OTP");
            return;
        }

        // NOTE: Since the backend code provided only has forgotPassword and resetPassword, 
        // and resetPassword handles OTP verification, we skip a separate verify-otp call here 
        // and pass the OTP to the next screen for the final reset request.

        // setLoading(true);
        // try {
        //     const response = await fetch("https://saini-record-management.onrender.com/auth/verify-otp", {
        //         method: "POST",
        //         headers: { "Content-Type": "application/json" },
        //         body: JSON.stringify({ identifier: phone, otp: otp.trim() })
        //     });
        //     const data = await response.json();

        //     if (response.ok) {
        //         Alert.alert("Success", "OTP Verified!");
        //         navigation.navigate("resetPassword", { phone, otp: otp.trim() });
        //     } else {
        //         Alert.alert("Error", data.message || "Invalid OTP");
        //     }
        // } catch (error) {
        //     console.error(error);
        //     Alert.alert("Error", "Network error occurred");
        // } finally {
        //     setLoading(false);
        // }

        // Direct navigation for now based on backend structure
        navigation.navigate("resetPassword", { phone, otp: otp.trim() });
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.text }]}>Verify OTP</Text>
                </View>
                <View style={[styles.formCard, { backgroundColor: theme.card }]}>
                    <Text style={[styles.description, { color: theme.subText }]}>
                        Enter the OTP sent to {phone}
                    </Text>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>OTP</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                            placeholder="Enter OTP"
                            placeholderTextColor={theme.subText}
                            keyboardType="number-pad"
                            value={otp}
                            onChangeText={setOtp}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                        onPress={handleVerify}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, justifyContent: "center" },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
    backBtn: { marginRight: 15 },
    title: { fontSize: 24, fontWeight: 'bold' },
    formCard: { padding: 20, borderRadius: 16, elevation: 3 },
    description: { fontSize: 14, marginBottom: 20 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16 },
    submitBtn: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
