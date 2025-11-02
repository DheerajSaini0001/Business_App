import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MotiView, MotiText } from "moti";
import { useTheme } from "../Context/ThemeContext";

const API_BASE_URL = "https://saini-record-management.onrender.com";

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [tip, setTip] = useState("");

  // ✅ Random motivational tips
  const tips = [
    "Back up your records regularly to stay secure!",
    "Keep your data organized — your future self will thank you.",
    "Security first! Avoid sharing your credentials.",
    "Did you know? Our app encrypts every piece of your data.",
    "Take a moment to review your stored info weekly.",
  ];

  // ✅ Time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // ✅ Random tip rotation
  useEffect(() => {
    setTip(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

  // ✅ Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data?.user) setUser(data.user);
      } catch (err) {
        console.error("User fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

 


  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.text, marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Animated App Title */}
      <MotiText
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 800 }}
        style={[styles.heading, { color: theme.text }]}
      >
        🏠 Saini Record Manager
      </MotiText>

    
        <>
          {/* Animated Greeting */}
          <MotiText
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400, duration: 800 }}
            style={[styles.welcomeText, { color: theme.textSecondary }]}
          >
            {greeting}, <Text style={{ fontWeight: "bold" }}>{user.fullName}</Text> 👋
          </MotiText>

          {/* Tip of the Day */}
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 700, duration: 800 }}
            style={[
              styles.tipCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.tipTitle, { color: theme.text }]}>💡 Tip of the Day</Text>
            <Text style={[styles.tipText, { color: theme.textSecondary }]}>{tip}</Text>
          </MotiView>

          {/* User Info */}
          <MotiView
            from={{ opacity: 0, translateX: -30 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: 900, duration: 700 }}
            style={[
              styles.infoCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              👤 Your Account Info
            </Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              📧 Email: {user.email || "Not available"}
            </Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              🗓️ Joined:{" "}
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "N/A"}
            </Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              🏷️ Role: {user.role || "User"}
            </Text>
          </MotiView>

          {/* Status Section */}
          <MotiView
            from={{ opacity: 0, translateX: 30 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: 1100, duration: 700 }}
            style={[
              styles.infoCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              📈 Account Status
            </Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              ✅ Active and secure
            </Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              🔐 All records encrypted end-to-end
            </Text>
          
          </MotiView>

      

          {/* Footer */}
          <Text style={[styles.footerText, { color: theme.textSecondary,justifyContent:'flex-end',alignItems:'flex-end',
      color: theme.textSecondary,
      position: "absolute",
      bottom: 20,
      left: 0,
      right: 0,
      textAlign: "center", }]}>
            © {new Date().getFullYear()} Saini Record Manager{"\n"}Developed by Dheeraj Saini 💻
          </Text>
        </>
       
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    marginVertical: 20,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 18,
    marginBottom: 12,
    textAlign: "center",
  },
  subText: {
    fontSize: 16,
    marginVertical: 20,
    textAlign: "center",
    lineHeight: 22,
  },
  infoCard: {
    width: "95%",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
  },
  tipCard: {
    width: "95%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginVertical: 10,
    elevation: 3,
  },
  tipTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 5,
  },
  tipText: {
    fontSize: 15,
    lineHeight: 20,
  },
  loginButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: "center",
    marginVertical: 10,
  },
  loginText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  logoutButton: {
    width: "80%",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 30,
  },
  logoutText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  footerText: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 40,
    opacity: 0.7,
  },
});
