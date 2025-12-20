import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
    Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// --- Colors extracted from Reference ---
const COLORS = {
    NAVY: '#0B1C38', // Deep Navy Blue
    GOLD: '#BFA15F', // Matte Gold
    WHITE: '#FFFFFF',
};

export default function SplashScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const textSlide = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 6,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(textSlide, {
                toValue: 0,
                duration: 800,
                easing: Easing.out(Easing.exp),
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar hidden={true} />

            {/* Clean White Background as per reference */}
            <View style={StyleSheet.absoluteFillObject}>
                <LinearGradient
                    colors={['#FFFFFF', '#FAF9F6']} // Very subtle off-white gradient
                    style={StyleSheet.absoluteFill}
                />
            </View>

            <View style={styles.content}>

                {/* Logo Icon - Matching the Navy Theme */}
                <Animated.View style={[
                    styles.logoContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}>
                    <View style={styles.iconCircle}>
                        <Text style={styles.logoText}>S</Text>
                    </View>
                </Animated.View>

                {/* Text Content - Matches Request Exactly */}
                <Animated.View style={{
                    alignItems: 'center',
                    opacity: fadeAnim,
                    transform: [{ translateY: textSlide }]
                }}>
                    {/* Line 1: Navy Blue */}
                    <Text style={styles.titleNavy}>Saini Record</Text>

                    {/* Line 2: Gold */}
                    <Text style={styles.titleGold}>Management</Text>

                </Animated.View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, // Ensure it takes full height
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        marginBottom: 30,
        shadowColor: COLORS.NAVY,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.NAVY,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 60,
        fontWeight: '900',
        color: COLORS.GOLD,
        marginBottom: 5, // Visual adjustment
    },
    titleNavy: {
        fontSize: 34,
        fontWeight: 'bold', // Thick font
        color: COLORS.NAVY,
        textAlign: 'center',
        letterSpacing: 0.5,
        marginBottom: -5, // Tight styling
    },
    titleGold: {
        fontSize: 34,
        fontWeight: 'bold',
        color: COLORS.GOLD,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
});
