import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { router, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import { AppThemeProvider, useAppTheme } from '@/components/app-theme';
import { AthenaAssistant } from '@/components/athena-assistant';
import { AuthProvider, getAuthDestination, useAuth } from '@/components/auth-provider';
import { PortalDataProvider } from '@/components/portal-data-provider';

function AppNavigator() {
  const { isDark, navigationTheme } = useAppTheme();
  const { isRestoring, user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (isRestoring) return;

    const isPublicRoute = pathname === '/' || pathname === '/login';
    if (!user && !isPublicRoute) {
      router.replace('/login');
    } else if (user && pathname === '/login') {
      router.replace(getAuthDestination(user));
    }
  }, [isRestoring, pathname, user]);

  if (isRestoring) {
    return <View style={{ flex: 1, backgroundColor: navigationTheme.colors.background }} />;
  }

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
        <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="research-calls" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="research-call-create" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="research-call/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="research-call-edit/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="activity" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="profile" options={{ animation: 'slide_from_right' }} />
      </Stack>
      <AthenaAssistant />
      <StatusBar style={isDark ? 'light' : 'dark'} animated />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <PortalDataProvider>
          <AppNavigator />
        </PortalDataProvider>
      </AuthProvider>
    </AppThemeProvider>
  );
}
