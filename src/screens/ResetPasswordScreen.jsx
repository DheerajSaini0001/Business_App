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

export default function ResetPasswordScreen({ route, navigation }) {
    const { phone, otp } = route.params;
    const { theme } = useTheme();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!password || !confirmPassword) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("https://saini-record-management.onrender.com/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier: phone, otp, newPassword: password })
            });
            const data = await response.json();

            if (response.ok) {
                Alert.alert("Success", "Password reset successfully!");
                navigation.reset({
                    index: 0,
                    routes: [{ name: "adminLogin" }],
                });
            } else {
                Alert.alert("Error", data.message || "Failed to reset password");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Network error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.text }]}>Reset Password</Text>
                </View>
                <View style={[styles.formCard, { backgroundColor: theme.card }]}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>New Password</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                            placeholder="Enter new password"
                            placeholderTextColor={theme.subText}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Confirm Password</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                            placeholder="Confirm new password"
                            placeholderTextColor={theme.subText}
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                        onPress={handleReset}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Reset Password</Text>}
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
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16 },
    submitBtn: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
