import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import { BrandMark } from '@/components/brand-mark';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LoginScreen() {
  const { colors, isDark } = useAppTheme();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleGoogleSignIn = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      router.replace('/faculty' as Href);
    }, 650);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.redPanel, { backgroundColor: isDark ? '#800D2A' : '#B20D30' }]}>
        <View style={styles.panelCircleOne} />
        <View style={styles.panelCircleTwo} />
      </View>
      <ScrollView bounces={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.page}>
          <View style={styles.topBar}>
            <Pressable
              accessibilityLabel="Go back"
              hitSlop={8}
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.iconButton,
                { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.65 : 1 },
              ]}>
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            </Pressable>
            <ThemeToggle />
          </View>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
            ]}>
            <View style={styles.brandArea}>
              <BrandMark compact inverted />
              <Text style={styles.brandWord}>ATHENA</Text>
            </View>

            <View style={styles.cardBody}>
              <View style={[styles.welcomeIcon, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="sparkles" size={23} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Sign in with your university Google account to continue to Athena.
              </Text>

              <Pressable
                accessibilityRole="button"
                disabled={isConnecting}
                onPress={handleGoogleSignIn}
                style={({ pressed }) => [
                  styles.googleButton,
                  {
                    backgroundColor: isDark ? '#FFFFFF' : colors.surface,
                    borderColor: isDark ? '#FFFFFF' : colors.border,
                    opacity: pressed || isConnecting ? 0.72 : 1,
                    transform: [{ scale: pressed ? 0.99 : 1 }],
                  },
                ]}>
                {isConnecting ? (
                  <ActivityIndicator color="#B20D30" />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={22} color="#4285F4" />
                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                    <Ionicons name="arrow-forward" size={18} color="#6F5D60" />
                  </>
                )}
              </Pressable>

              <View style={[styles.securityNote, { backgroundColor: colors.surfaceMuted }]}>
                <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
                <Text style={[styles.securityText, { color: colors.textMuted }]}>
                  Protected by your university&apos;s secure Google Workspace account.
                </Text>
              </View>

              <Text style={[styles.terms, { color: colors.textMuted }]}>
                By continuing, you agree to the university&apos;s{' '}
                <Text style={{ color: colors.primary, fontWeight: '700' }}>acceptable use policy</Text>.
              </Text>
            </View>
          </View>

          <View style={styles.supportRow}>
            <Ionicons name="help-circle-outline" size={16} color={colors.textMuted} />
            <Text style={[styles.supportText, { color: colors.textMuted }]}>Having trouble? Contact Campus IT Support</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, overflow: 'hidden' },
  redPanel: { height: '38%', left: 0, overflow: 'hidden', position: 'absolute', right: 0, top: 0 },
  panelCircleOne: { borderColor: '#FFFFFF', borderRadius: 160, borderWidth: 38, height: 280, opacity: 0.07, position: 'absolute', right: -80, top: -120, width: 280 },
  panelCircleTwo: { borderColor: '#FFFFFF', borderRadius: 90, borderWidth: 22, bottom: -80, height: 180, left: -75, opacity: 0.06, position: 'absolute', width: 180 },
  scrollContent: { flexGrow: 1 },
  page: { alignItems: 'center', flex: 1, paddingBottom: 24, paddingHorizontal: 22, paddingTop: 8 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', maxWidth: 540, width: '100%' },
  iconButton: { alignItems: 'center', borderRadius: 22, borderWidth: 1, height: 44, justifyContent: 'center', width: 44 },
  card: { borderRadius: 28, borderWidth: 1, elevation: 10, marginTop: 42, maxWidth: 470, overflow: 'hidden', shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.2, shadowRadius: 30, width: '100%' },
  brandArea: { alignItems: 'center', backgroundColor: '#B20D30', flexDirection: 'row', gap: 12, justifyContent: 'center', paddingVertical: 23 },
  brandWord: { color: '#FFFFFF', fontSize: 21, fontWeight: '800', letterSpacing: 4 },
  cardBody: { alignItems: 'center', paddingHorizontal: 28, paddingVertical: 32 },
  welcomeIcon: { alignItems: 'center', borderRadius: 24, height: 48, justifyContent: 'center', marginBottom: 18, width: 48 },
  title: { fontSize: 31, fontWeight: '800', letterSpacing: -0.9 },
  subtitle: { fontSize: 14, lineHeight: 22, marginTop: 10, maxWidth: 330, textAlign: 'center' },
  googleButton: { alignItems: 'center', borderRadius: 15, borderWidth: 1.5, flexDirection: 'row', gap: 12, height: 58, justifyContent: 'space-between', marginTop: 29, paddingHorizontal: 18, width: '100%' },
  googleButtonText: { color: '#2C2022', flex: 1, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  securityNote: { alignItems: 'center', borderRadius: 13, flexDirection: 'row', gap: 10, marginTop: 18, paddingHorizontal: 14, paddingVertical: 12, width: '100%' },
  securityText: { flex: 1, fontSize: 11, lineHeight: 16 },
  terms: { fontSize: 10, lineHeight: 16, marginTop: 21, maxWidth: 330, textAlign: 'center' },
  supportRow: { alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: 24 },
  supportText: { fontSize: 11 },
});
