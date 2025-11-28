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

export default function CreateAdminScreen({ navigation }) {
    const { theme, isDarkMode } = useTheme();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.fullName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
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
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                role: "admin"
            };
            const response = await fetch("https://saini-record-management.onrender.com/admin/create-admin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Success", "New Admin Created Successfully!");
                navigation.goBack();
            } else {
                Alert.alert("Error", data.message || data.error || "Failed to create admin");
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
                    <Text style={[styles.title, { color: theme.text }]}>Create New Admin</Text>
                </View>

                <View style={[styles.formCard, { backgroundColor: theme.card }]}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                            placeholder="Enter full name"
                            placeholderTextColor={theme.subText}
                            value={formData.fullName}
                            onChangeText={(text) => handleChange("fullName", text)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Email</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                            placeholder="Enter email address"
                            placeholderTextColor={theme.subText}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={formData.email}
                            onChangeText={(text) => handleChange("email", text)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Phone Number</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                            placeholder="Enter phone number"
                            placeholderTextColor={theme.subText}
                            keyboardType="phone-pad"
                            value={formData.phone}
                            onChangeText={(text) => handleChange("phone", text)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Password</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                            placeholder="Enter password"
                            placeholderTextColor={theme.subText}
                            secureTextEntry
                            value={formData.password}
                            onChangeText={(text) => handleChange("password", text)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Confirm Password</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                            placeholder="Confirm password"
                            placeholderTextColor={theme.subText}
                            secureTextEntry
                            value={formData.confirmPassword}
                            onChangeText={(text) => handleChange("confirmPassword", text)}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.btnText}>Create Admin</Text>
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
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10,
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
