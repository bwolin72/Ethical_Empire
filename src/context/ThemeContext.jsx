import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

/**
 * 🌗 ThemeProvider — Handles light/dark mode switching
 * Syncs with localStorage + system preferences
 * Applies class to <body> for global variable updates
 */
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check stored user preference
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) return storedTheme === 'dark';

    // Fallback: use system-level preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const body = document.body;

    // Reset theme classes for clean toggling
    body.classList.remove('dark', 'light');
    body.classList.add(isDarkMode ? 'dark' : 'light');

    // Persist theme choice
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

    // Optional: dynamically adjust meta theme color (for mobile browser bars)
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute(
        'content',
        isDarkMode ? '#1f2937' : '#f9f9f9' // matches your brand neutral dark/light
      );
    }
  }, [isDarkMode]);

  // Toggle dark/light mode
  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  // Context value shared with components
  const value = { isDarkMode, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for easy access
export const useTheme = () => useContext(ThemeContext);
