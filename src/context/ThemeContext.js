import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';

const DARK = {
  background: '#121219',
  surface: '#1C1C2B',
  surfaceLight: '#2A2A3D',
  card: '#1C1C2B',
  cardBorder: '#2A2A3D',
  text: '#FFFFFF',
  textSecondary: '#A0A0B2',
  textMuted: '#6B6B80',
  border: '#2A2A3D',
};

const LIGHT = {
  background: '#F5F5FA',
  surface: '#FFFFFF',
  surfaceLight: '#EEEEF4',
  card: '#FFFFFF',
  cardBorder: '#E0E0EA',
  text: '#1A1A2E',
  textSecondary: '#5A5A6E',
  textMuted: '#8A8A9A',
  border: '#E0E0EA',
};

const ACCENT_PRESETS = {
  Purple: '#7C5CFC',
  Teal: '#4ECDC4',
  Orange: '#FF8A65',
  Pink: '#FF6B9D',
  Blue: '#4A90D9',
  Green: '#66BB6A',
  Red: '#EF5350',
  Yellow: '#FFD54F',
  Indigo: '#5C6BC0',
  Cyan: '#26C6DA',
};

const HEADING_PRESETS = [
  '#FFFFFF', '#7C5CFC', '#4ECDC4', '#FF8A65', '#FF6B9D',
  '#4A90D9', '#66BB6A', '#FFD54F', '#EF5350', '#26C6DA',
  '#F5F5FA', '#1A1A2E',
];

const BUTTON_PRESETS = [
  '#7C5CFC', '#4ECDC4', '#FF8A65', '#FF6B9D', '#4A90D9',
  '#66BB6A', '#EF5350', '#FFD54F', '#5C6BC0', '#26C6DA',
];

const CARD_BG_DARK = ['#1C1C2B', '#1A1A2E', '#0F0F1A', '#1E1E30', '#22222E', '#15152A', '#1B2838', '#1C2333', '#2A1A2E', '#1A2A1E'];
const CARD_BG_LIGHT = ['#FFFFFF', '#F5F5FA', '#EEF0F8', '#F0F4FF', '#FFF8F0', '#F0FFF4', '#FFF0F5', '#F8F8FF', '#FFFAF0', '#F5FFFA'];

const storage = {
  getItem: async (key) => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    try { const S = require('expo-secure-store'); return S.getItemAsync(key); } catch { return null; }
  },
  setItem: async (key, value) => {
    if (Platform.OS === 'web') { localStorage.setItem(key, value); return; }
    try { const S = require('expo-secure-store'); return S.setItemAsync(key, value); } catch {}
  },
};

const ThemeContext = createContext({});

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const [accent, setAccent] = useState('Purple');
  const [headingColor, setHeadingColor] = useState('#FFFFFF');
  const [sectionTitleColor, setSectionTitleColor] = useState('#FFFFFF');
  const [buttonColor, setButtonColor] = useState('#7C5CFC');
  const [cardBg, setCardBg] = useState(null);

  useEffect(() => { loadTheme(); }, []);

  const loadTheme = async () => {
    try {
      const saved = await storage.getItem('app_theme_v3');
      if (saved) {
        const t = JSON.parse(saved);
        if (t.isDark !== undefined) setIsDark(t.isDark);
        if (t.accent) setAccent(t.accent);
        if (t.headingColor) setHeadingColor(t.headingColor);
        if (t.sectionTitleColor) setSectionTitleColor(t.sectionTitleColor);
        if (t.buttonColor) setButtonColor(t.buttonColor);
        if (t.cardBg) setCardBg(t.cardBg);
      }
    } catch {}
  };

  const save = async (updates) => {
    const current = { isDark, accent, headingColor, sectionTitleColor, buttonColor, cardBg, ...updates };
    await storage.setItem('app_theme_v3', JSON.stringify(current));
  };

  const toggleDarkMode = () => {
    const newVal = !isDark;
    setIsDark(newVal);
    if (!newVal) {
      setHeadingColor('#1A1A2E');
      setSectionTitleColor('#1A1A2E');
      setCardBg(null);
    } else {
      setHeadingColor('#FFFFFF');
      setSectionTitleColor('#FFFFFF');
      setCardBg(null);
    }
    save({ isDark: newVal, headingColor: newVal ? '#FFFFFF' : '#1A1A2E', sectionTitleColor: newVal ? '#FFFFFF' : '#1A1A2E', cardBg: null });
  };

  const setAccentColor = (name) => {
    setAccent(name);
    setButtonColor(ACCENT_PRESETS[name]);
    save({ accent: name, buttonColor: ACCENT_PRESETS[name] });
  };

  const updateHeadingColor = (c) => { setHeadingColor(c); save({ headingColor: c }); };
  const updateSectionTitleColor = (c) => { setSectionTitleColor(c); save({ sectionTitleColor: c }); };
  const updateButtonColor = (c) => { setButtonColor(c); save({ buttonColor: c }); };
  const updateCardBg = (c) => { setCardBg(c); save({ cardBg: c }); };

  const base = isDark ? DARK : LIGHT;

  const theme = {
    ...base,
    primary: ACCENT_PRESETS[accent] || '#7C5CFC',
    headingColor,
    sectionTitleColor,
    buttonColor,
    cardBg: cardBg || base.surface,
    isDark,
    accentName: accent,
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    streak: '#FFD700',
    easy: '#00E676',
    medium: '#FFD600',
    hard: '#FF5252',
  };

  return (
    <ThemeContext.Provider value={{
      theme, isDark, accent, headingColor, sectionTitleColor, buttonColor, cardBg,
      toggleDarkMode, setAccentColor, updateHeadingColor, updateSectionTitleColor, updateButtonColor, updateCardBg,
      ACCENT_PRESETS, HEADING_PRESETS, BUTTON_PRESETS,
      CARD_BG_OPTIONS: isDark ? CARD_BG_DARK : CARD_BG_LIGHT,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
