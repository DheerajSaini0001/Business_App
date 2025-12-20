import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useCallback
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Appearance
} from "react-native";

// --- 1. CONTEXT CREATION ---
const ThemeContext = createContext({
  isDarkMode: false,
  theme: {},
  toggleTheme: () => { },
});

// --- 2. THEME PROVIDER ---
export const ThemeProvider = ({ children }) => {
  // FORCE LIGHT MODE: Always set isDarkMode to false
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = useCallback(() => {
    // Disable toggling: Do nothing or maybe log a message
    console.log("Dark mode is disabled.");
  }, []);

  // ✅ Enhanced theme object - Forced Light Mode
  const theme = useMemo(() => ({
    background: "#f8f9fa",
    card: "#ffffff",
    text: "#212529",
    subText: "#212529",
    logOut: "#212529",
    logOuttext: "#ffffff",
    textSecondary: "#6c757d",
    border: "#ced4da",
    placeholder: "#999999",
    primary: "#3b82f6",
    icon: "#666666",
  }), []); // Removed dependency on isDarkMode since it's constant

  const value = useMemo(() => ({
    isDarkMode,
    theme,
    toggleTheme,
  }), [isDarkMode, theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.background}
      />
      {children}
    </ThemeContext.Provider>
  );
};

// --- 3. CUSTOM HOOK ---
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// ... (Rest of the file remains strictly for structure's sake, but we don't need the demo screen exports if not used)
// Keeping export default for App to avoid breaking if this file is treated as an entry point for testing
export default function App() {
  return (
    <ThemeProvider>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Theme Context Active (Forced Light Mode)</Text>
      </View>
    </ThemeProvider>
  );
}
