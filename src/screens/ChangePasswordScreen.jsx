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
    ScrollView,
    StatusBar
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Lock, CheckCircle, ArrowLeft } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const BASE_URL = "https://saini-record-management-backend.vercel.app";

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

export default function ChangePasswordScreen() {
    const navigation = useNavigation();
    const route = useRoute();

    // Expect userType to be passed ('admin' or 'user')
    const userType = route.params?.userType || 'user';

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert("Missing Information", "Please fill in all fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Password Mismatch", "Passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Weak Password", "Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);
        try {
            const tokenKey = userType === 'admin' ? 'adminToken' : 'userToken';
            const token = await AsyncStorage.getItem(tokenKey);

            if (!token) {
                Alert.alert("Authentication Error", "Session expired. Please log in again.");
                navigation.goBack();
                return;
            }

            const response = await fetch(`${BASE_URL}/auth/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    newPassword,
                    confirmPassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Success", "Password updated successfully!", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert("Error", data.error || data.message || "Failed to change password.");
            }
        } catch (error) {
            console.error(error);
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
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color={COLORS.NAVY} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Change Password</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">

                {/* Branding / Icon */}
                <View style={styles.brandingContainer}>
                    <View style={styles.iconCircle}>
                        <Lock size={32} color={COLORS.GOLD} />
                    </View>
                    <Text style={styles.subtitle}>
                        Secure your account with a strong password.
                    </Text>
                </View>

                {/* New Password */}
                <View style={styles.inputGroup}>
                    <View style={styles.inputWrapper}>
                        <Lock size={20} color={COLORS.NAVY} style={styles.inputIcon} />
                        <TextInput
                            placeholder="New Password"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                            style={styles.input}
                            placeholderTextColor={COLORS.TEXT_SUB}
                        />
                    </View>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                    <View style={styles.inputWrapper}>
                        <CheckCircle size={20} color={COLORS.NAVY} style={styles.inputIcon} />
                        <TextInput
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            style={styles.input}
                            placeholderTextColor={COLORS.TEXT_SUB}
                        />
                    </View>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.NAVY} />
                    ) : (
                        <Text style={styles.buttonText}>Update Password</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.WHITE,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
        paddingBottom: 20,
    },
    backButton: {
        padding: 8,
        marginRight: 10,
        backgroundColor: COLORS.GRAY_LIGHT,
        borderRadius: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.NAVY,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 10,
    },
    brandingContainer: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 10,
    },
    iconCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: COLORS.NAVY,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: COLORS.NAVY,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    subtitle: {
        textAlign: 'center',
        fontSize: 16,
        color: COLORS.TEXT_SUB,
        maxWidth: '80%',
        lineHeight: 22,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.GRAY_BORDER,
        backgroundColor: COLORS.GRAY_LIGHT,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: COLORS.NAVY,
        fontWeight: '500',
    },
    button: {
        backgroundColor: COLORS.GOLD,
        height: 56,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 32,
        shadowColor: COLORS.GOLD,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: COLORS.NAVY,
        fontWeight: "bold",
        fontSize: 18,
    },
});
