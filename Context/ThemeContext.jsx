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
} from "react-native"; // ✅ use normal react-native, not react-native-web

// --- 1. CONTEXT CREATION ---
const ThemeContext = createContext({
  isDarkMode: false,
  theme: {},
  toggleTheme: () => {},
});

// --- 2. THEME PROVIDER ---
export const ThemeProvider = ({ children }) => {
  const colorScheme = Appearance.getColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  // ✅ Enhanced theme object with all color variants
  const theme = useMemo(() => ({
    background: isDarkMode ? "#121212" : "#f8f9fa",
    card: isDarkMode ? "#1e1e1e" : "#ffffff",
    text: isDarkMode ? "#ffffff" : "#212529",
    textSecondary: isDarkMode ? "#aaaaaa" : "#6c757d",
    border: isDarkMode ? "#333333" : "#ced4da",
    placeholder: isDarkMode ? "#888888" : "#999999",
    primary: "#3b82f6",
    icon: isDarkMode ? "#dddddd" : "#666666",
  }), [isDarkMode]);

  const value = useMemo(() => ({
    isDarkMode,
    theme,
    toggleTheme,
  }), [isDarkMode, theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
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

// --- 4. DEMO SCREEN (for testing only) ---
const MainScreen = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const styles = getDynamicStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Theme Context Demo</Text>
        <Text style={styles.text}>
          Current mode: {isDarkMode ? "🌙 Dark" : "☀️ Light"}
        </Text>

        <TouchableOpacity style={styles.button} onPress={toggleTheme}>
          <Text style={styles.buttonText}>Toggle Theme</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- 5. DYNAMIC STYLES ---
const getDynamicStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.background,
  },
  card: {
    backgroundColor: theme.card,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.text,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 20,
  },
  button: {
    backgroundColor: theme.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

// --- 6. ROOT APP (for preview/testing) ---
export default function App() {
  return (
    <ThemeProvider>
      <MainScreen />
    </ThemeProvider>
  );
}
