import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme options
export type ThemeMode = 'light' | 'dark' | 'system';

// Language options (French only for now, but extensible)
export type Language = 'fr';

interface Preferences {
  notificationsEnabled: boolean;
  themeMode: ThemeMode;
  language: Language;
}

interface PreferencesContextType {
  preferences: Preferences;
  isLoading: boolean;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setLanguage: (lang: Language) => Promise<void>;
  resetPreferences: () => Promise<void>;
}

const defaultPreferences: Preferences = {
  notificationsEnabled: true,
  themeMode: 'light',
  language: 'fr',
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const STORAGE_KEY = '@conscience_soufie_preferences';

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedPreferences = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsedPreferences });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async (newPreferences: Preferences) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  };

  const setNotificationsEnabled = async (enabled: boolean) => {
    const newPrefs = { ...preferences, notificationsEnabled: enabled };
    await savePreferences(newPrefs);
  };

  const setThemeMode = async (mode: ThemeMode) => {
    const newPrefs = { ...preferences, themeMode: mode };
    await savePreferences(newPrefs);
  };

  const setLanguage = async (lang: Language) => {
    const newPrefs = { ...preferences, language: lang };
    await savePreferences(newPrefs);
  };

  const resetPreferences = async () => {
    await savePreferences(defaultPreferences);
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        isLoading,
        setNotificationsEnabled,
        setThemeMode,
        setLanguage,
        resetPreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}

export default PreferencesContext;
