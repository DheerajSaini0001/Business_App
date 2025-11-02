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
  Appearance // To detect system theme
} from "react-native-web"; // <-- FIX: Changed to react-native-web for preview

// --- 1. THEME DEFINITIONS ---
// Yahaan aap apne app ke sabhi colors define kar sakte hain

const lightColors = {
  background: '#FFFFFF',
  text: '#121212',
  primary: '#3b82f6', // Blue
  card: '#F5F5F5',
  border: '#E0E0E0',
};

const darkColors = {
  background: '#121212',
  text: '#FFFFFF',
  primary: '#3b82f6', // Same Blue
  card: '#1E1E1E',
  border: '#272727',
};

// --- 2. CONTEXT SETUP ---

// Context object create karein
// Default value mein ek toggle function bhi de sakte hain
const ThemeContext = createContext({
  isDarkMode: false,
  theme: lightColors,
  toggleTheme: () => {}, // Default empty function
});

/**
 * Yeh Provider component hai jo aapke poore app ko wrap karega.
 * Yeh theme state (light/dark) ko manage karta hai.
 */
export const ThemeProvider = ({ children }) => {
  // System ki default theme check karein (e.g., phone settings)
  const colorScheme = Appearance.getColorScheme(); 
  
  // State to hold the current theme mode
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  // Theme toggle karne ke liye function
  // useCallback use karein taaki function re-create na ho
  const toggleTheme = useCallback(() => {
    setIsDarkMode(prevMode => !prevMode);
  }, []);

  // Current theme object select karein (light ya dark)
  const theme = isDarkMode ? darkColors : lightColors;

  // Context ki value ko memoize karein taaki unnecessary re-renders na hon
  const value = useMemo(() => ({
    isDarkMode,
    theme,
    toggleTheme,
  }), [isDarkMode, theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {/* Status bar ko bhi theme ke hisaab se update karein */}
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Yeh custom hook hai.
 * Kisi bhi component mein is hook ko call karke aap
 * `theme`, `isDarkMode`, aur `toggleTheme` access kar sakte hain.
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};


// --- 3. EXAMPLE SCREEN ---
// Ek component jo theme ko use karta hai

const MainScreen = () => {
  // Custom hook se theme data access karein
  const { theme, isDarkMode, toggleTheme } = useTheme();

  // Styles ko theme object par based karein
  // Yeh function component ke andar re-run hoga jab 'theme' change hoga
  const styles = getDynamicStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Theme Context Demo</Text>
        <Text style={styles.text}>
          Current mode: {isDarkMode ? 'Dark' : 'Light'}
        </Text>
        
        <TouchableOpacity style={styles.button} onPress={toggleTheme}>
          <Text style={styles.buttonText}>Toggle Theme</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Yeh function dynamic styles create karta hai theme ke basis par
const getDynamicStyles = (theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background, // Themed background
    },
    card: {
      backgroundColor: theme.card, // Themed card
      padding: 24,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border, // Themed border
      // Shadows
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text, // Themed text
      marginBottom: 16,
    },
    text: {
      fontSize: 16,
      color: theme.text, // Themed text
      marginBottom: 24,
    },
    button: {
      backgroundColor: theme.primary, // Themed button
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    buttonText: {
      color: '#FFFFFF', // Button text white rakha hai
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
};


// --- 4. APP COMPONENT ---
// Root component jo provider ko setup karta hai

export default function App() {
  return (
    // Step 1: Poore app ko ThemeProvider se wrap karein
    <ThemeProvider>
      {/* Step 2: Ab iske andar ke sabhi components 'useTheme' hook use kar sakte hain */}
      <MainScreen />
    </ThemeProvider>
  );
}


