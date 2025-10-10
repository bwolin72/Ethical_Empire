import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

/**
 * 🌗 ThemeProvider — Dynamic Light/Dark Theme Manager
 * - Syncs with localStorage and system preference
 * - Toggles `.dark` / `.light` classes on <body>
 * - Updates <meta name="theme-color"> using CSS variable (--color-bg)
 */
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) return storedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const body = document.body;

    // Remove existing classes before applying new one
    body.classList.remove('dark', 'light');
    body.classList.add(isDarkMode ? 'dark' : 'light');

    // Save preference
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

    // Dynamically update browser's theme color to match CSS var(--color-bg)
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      const bgColor = getComputedStyle(body)
        .getPropertyValue('--color-bg')
        .trim();
      if (bgColor) {
        metaTheme.setAttribute('content', bgColor);
      }
    }
  }, [isDarkMode]);

  // Theme toggle handler
  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for consuming the theme context
export const useTheme = () => useContext(ThemeContext);
