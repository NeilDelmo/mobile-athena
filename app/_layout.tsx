import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AppThemeProvider, useAppTheme } from '@/components/app-theme';
import { DemoProjectsProvider } from '@/components/demo-projects-provider';

function AppNavigator() {
  const { isDark, navigationTheme } = useAppTheme();

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: navigationTheme.colors.background },
          animation: 'fade_from_bottom',
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="faculty" options={{ animation: 'fade' }} />
        <Stack.Screen name="faculty-projects" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="faculty-project/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="research-head" options={{ animation: 'fade' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} animated />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <DemoProjectsProvider>
        <AppNavigator />
      </DemoProjectsProvider>
    </AppThemeProvider>
  );
}
