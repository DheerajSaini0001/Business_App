import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Dimensions,
    Keyboard,
    TouchableWithoutFeedback,
    Animated,
    Easing
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Eye, EyeOff, Lock, User, ArrowRight } from 'lucide-react-native';
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get('window');

// --- Brand Colors ---
const COLORS = {
    NAVY: '#0B1C38',
    GOLD: '#BFA15F',
    WHITE: '#FFFFFF',
    GRAY_LIGHT: '#F8F9FA',
    GRAY_TEXT: '#6c757d'
};

export default function LoginScreen({ navigation }) {
    const { theme } = useTheme();

    const [formData, setFormData] = useState({ idInput: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 6, useNativeDriver: true })
        ]).start();
    }, []);

    const handleChange = (key, value) => {
        setFormData({ ...formData, [key]: value });
    };

    const handleSubmit = async () => {
        Keyboard.dismiss();
        const { idInput, password } = formData;
        if (!idInput || !password) {
            Alert.alert("Missing Information", "Please enter both your User ID and Password.");
            return;
        }

        setLoading(true);
        try {
            // 1. User Login
            let response = await fetch("https://saini-record-management-backend.vercel.app/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userid: idInput.trim(), password: password.trim() }),
            });

            let data = await response.json();

            if (response.ok) {
                await AsyncStorage.setItem("userToken", data.token);
                await AsyncStorage.setItem("userId", data.id);
                navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
                return;
            }

            // 2. Admin Login
            response = await fetch("https://saini-record-management-backend.vercel.app/admin/admin-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminId: idInput.trim(), password: password.trim() }),
            });

            data = await response.json();

            if (response.ok) {
                await AsyncStorage.setItem("adminToken", data.token);
                if (data.admin?._id) await AsyncStorage.setItem("adminId", data.admin._id);
                if (data.admin?.role) await AsyncStorage.setItem("adminRole", data.admin.role);
                if (data.admin?.fullName) await AsyncStorage.setItem("adminName", data.admin.fullName);
                navigation.reset({ index: 0, routes: [{ name: "adminDashboard" }] });
                return;
            }

            Alert.alert("Login Failed", "Invalid credentials.");
        } catch (e) {
            Alert.alert("Connection Error", "Please check your internet connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, backgroundColor: COLORS.WHITE }}>
                <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1, justifyContent: 'center', padding: 24 }}
                >

                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                        {/* --- Logo / Header Section --- */}
                        <View style={styles.header}>
                            <View style={styles.iconCircle}>
                                <Text style={styles.logoText}>S</Text>
                            </View>
                            <Text style={styles.titleNavy}>Saini Record</Text>
                            <Text style={styles.titleGold}>Management</Text>
                        </View>

                        {/* --- Login Form --- */}
                        <View style={styles.inputGroup}>

                            {/* User ID */}
                            <View style={styles.inputWrapper}>
                                <User color={COLORS.NAVY} size={20} style={{ marginRight: 12 }} />
                                <TextInput
                                    placeholder="User ID"
                                    placeholderTextColor="#94A3B8"
                                    style={styles.inputText}
                                    value={formData.idInput}
                                    onChangeText={(t) => handleChange('idInput', t)}
                                    autoCapitalize="none"
                                />
                            </View>

                            {/* Password */}
                            <View style={[styles.inputWrapper, { marginTop: 16 }]}>
                                <Lock color={COLORS.NAVY} size={20} style={{ marginRight: 12 }} />
                                <TextInput
                                    placeholder="Password"
                                    placeholderTextColor="#94A3B8"
                                    style={styles.inputText}
                                    value={formData.password}
                                    onChangeText={(t) => handleChange('password', t)}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    {showPassword ?
                                        <Eye color={COLORS.NAVY} size={20} /> :
                                        <EyeOff color={COLORS.NAVY} size={20} />
                                    }
                                </TouchableOpacity>
                            </View>

                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={styles.loginBtn}
                            onPress={handleSubmit}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color={COLORS.NAVY} />
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={styles.btnText}>Sign In</Text>
                                    <ArrowRight color={COLORS.NAVY} size={20} style={{ marginLeft: 8 }} />
                                </View>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.NAVY,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: COLORS.NAVY,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    logoText: {
        fontSize: 48,
        fontWeight: '900',
        color: COLORS.GOLD,
        marginBottom: 4,
    },
    titleNavy: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.NAVY,
        marginBottom: -5,
    },
    titleGold: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.GOLD,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.GRAY_TEXT,
        marginTop: 5,
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.GRAY_LIGHT,
        borderRadius: 12,
        height: 60,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    inputText: {
        flex: 1,
        height: '100%',
        color: COLORS.NAVY,
        fontSize: 16,
        fontWeight: '500',
    },
    loginBtn: {
        backgroundColor: COLORS.GOLD,
        borderRadius: 12,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.GOLD,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    btnText: {
        color: COLORS.NAVY,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
