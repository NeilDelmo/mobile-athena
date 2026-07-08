import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';

export type AppPalette = {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  border: string;
  white: string;
  shadow: string;
};

const lightPalette: AppPalette = {
  background: '#FFF8F7',
  surface: '#FFFFFF',
  surfaceMuted: '#F9EEEE',
  text: '#2A191A',
  textMuted: '#765F61',
  primary: '#B20D30',
  primaryPressed: '#8E0925',
  primarySoft: '#F8DDE3',
  border: '#EBCFD3',
  white: '#FFFFFF',
  shadow: '#5B0718',
};

const darkPalette: AppPalette = {
  background: '#160D0F',
  surface: '#221416',
  surfaceMuted: '#2C191C',
  text: '#FFF7F7',
  textMuted: '#C9AFB2',
  primary: '#ED3158',
  primaryPressed: '#C91B40',
  primarySoft: '#421722',
  border: '#4B292E',
  white: '#FFFFFF',
  shadow: '#000000',
};

type ThemeMode = 'light' | 'dark';

type AppThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  colors: AppPalette;
  navigationTheme: Theme;
  toggleTheme: () => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemTheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(systemTheme === 'dark' ? 'dark' : 'light');
  const colors = mode === 'dark' ? darkPalette : lightPalette;

  const value = useMemo<AppThemeContextValue>(() => {
    const baseTheme = mode === 'dark' ? DarkTheme : DefaultTheme;

    return {
      mode,
      isDark: mode === 'dark',
      colors,
      navigationTheme: {
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.primary,
        },
      },
      toggleTheme: () => setMode((current) => (current === 'dark' ? 'light' : 'dark')),
    };
  }, [colors, mode]);

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }

  return context;
}
