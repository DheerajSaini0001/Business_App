import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateAdminScreen({ navigation }) {
    const { theme, isDarkMode } = useTheme();
    const [formData, setFormData] = useState({
        fullName: "",
        adminId: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.fullName || !formData.adminId || !formData.phone || !formData.password || !formData.confirmPassword) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("adminToken");
            if (!token) {
                Alert.alert("Error", "Authentication token not found");
                setLoading(false);
                return;
            }

            const payload = {
                fullName: formData.fullName.trim(),
                adminId: formData.adminId.trim(),
                phone: formData.phone.trim(),
                password: formData.password,
                confirmPassword: formData.confirmPassword
            };

            const response = await fetch("https://saini-record-management-backend.vercel.app/admin/create-admin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Success", "New Admin Created Successfully! 🎉");
                navigation.goBack();
            } else {
                // Customized error message based on common issues
                let errorMessage = data.message || data.error || "Failed to create admin";
                Alert.alert(`Error (${response.status})`, errorMessage);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Network error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.container}>

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color="#0B1C38" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Create Admin</Text>
                    </View>

                    <View style={styles.headerIconContainer}>
                        <View style={styles.iconCircle}>
                            <Text style={styles.logoText}>S</Text>
                        </View>
                        <Text style={styles.subHeader}>Add New Administrator</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>

                        {/* Full Name */}
                        <View style={styles.inputWrapper}>
                            <Ionicons name="person-outline" size={20} color="#0B1C38" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Full Name"
                                placeholderTextColor="#94A3B8"
                                value={formData.fullName}
                                onChangeText={(text) => handleChange("fullName", text)}
                            />
                        </View>

                        {/* Admin ID */}
                        <View style={styles.inputWrapper}>
                            <Ionicons name="id-card-outline" size={20} color="#0B1C38" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Admin ID"
                                placeholderTextColor="#94A3B8"
                                autoCapitalize="none"
                                value={formData.adminId}
                                onChangeText={(text) => handleChange("adminId", text)}
                            />
                        </View>

                        {/* Phone */}
                        <View style={styles.inputWrapper}>
                            <Ionicons name="call-outline" size={20} color="#0B1C38" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Phone Number"
                                placeholderTextColor="#94A3B8"
                                keyboardType="phone-pad"
                                value={formData.phone}
                                onChangeText={(text) => handleChange("phone", text)}
                            />
                        </View>

                        {/* Password */}
                        <View style={styles.inputWrapper}>
                            <Ionicons name="lock-closed-outline" size={20} color="#0B1C38" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry={!showPassword}
                                value={formData.password}
                                onChangeText={(text) => handleChange("password", text)}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.inputWrapper}>
                            <Ionicons name="shield-checkmark-outline" size={20} color="#0B1C38" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm Password"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry={!showConfirmPassword}
                                value={formData.confirmPassword}
                                onChangeText={(text) => handleChange("confirmPassword", text)}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.submitBtn}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#0B1C38" />
                            ) : (
                                <Text style={styles.btnText}>Create Account</Text>
                            )}
                        </TouchableOpacity>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 24,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    backBtn: {
        padding: 8,
        marginRight: 10,
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0B1C38',
    },
    headerIconContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    iconCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#0B1C38',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#0B1C38',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    logoText: {
        fontSize: 36,
        fontWeight: '900',
        color: '#BFA15F',
        marginBottom: 4,
    },
    subHeader: {
        fontSize: 16,
        color: '#64748B',
        fontWeight: '500',
    },
    formContainer: {
        gap: 16,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        height: 56,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#0B1C38',
        fontWeight: '500',
    },
    submitBtn: {
        backgroundColor: '#BFA15F',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#BFA15F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    btnText: {
        color: '#0B1C38',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
