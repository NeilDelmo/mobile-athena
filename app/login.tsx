import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import { getAuthDestination, useAuth } from '@/components/auth-provider';
import { BrandMark } from '@/components/brand-mark';
import { ThemeToggle } from '@/components/theme-toggle';

const INSTITUTIONAL_DOMAIN = '@g.batstate-u.edu.ph';

export default function LoginScreen() {
  const { colors, isDark } = useAppTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith(INSTITUTIONAL_DOMAIN)) {
      setError(`Use your ${INSTITUTIONAL_DOMAIN} institutional email address.`);
      return;
    }
    if (!password) {
      setError('Enter your password.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const user = await login(normalizedEmail, password);
      router.replace(getAuthDestination(user) as Href);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.redPanel, { backgroundColor: isDark ? '#800D2A' : '#B20D30' }]}>
        <View style={styles.panelCircleOne} />
        <View style={styles.panelCircleTwo} />
      </View>
      <KeyboardAvoidingView behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.page}>
            <View style={styles.topBar}>
              <Pressable
                accessibilityLabel="Go back"
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.iconButton,
                  { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.65 : 1 },
                ]}>
                <Ionicons name="arrow-back" size={20} color={colors.text} />
              </Pressable>
              <ThemeToggle />
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
              <View style={styles.brandArea}>
                <BrandMark compact inverted />
                <Text style={styles.brandWord}>ATHENA</Text>
              </View>

              <View style={styles.cardBody}>
                <View style={[styles.welcomeIcon, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons name="shield-checkmark" size={23} color={colors.primary} />
                </View>
                <Text style={[styles.title, { color: colors.text }]}>Sign in to ATHENA</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  Access is limited to registered BatStateU research accounts using the {INSTITUTIONAL_DOMAIN} domain.
                </Text>

                <View style={styles.form}>
                  <View>
                    <Text style={[styles.label, { color: colors.text }]}>Institutional email</Text>
                    <View style={[styles.inputWrap, { backgroundColor: colors.surfaceMuted, borderColor: error && !email.endsWith(INSTITUTIONAL_DOMAIN) ? colors.primary : colors.border }]}>
                      <Ionicons name="mail-outline" size={19} color={colors.textMuted} />
                      <TextInput
                        autoCapitalize="none"
                        autoComplete="email"
                        editable={!isSubmitting}
                        keyboardType="email-address"
                        onChangeText={setEmail}
                        onSubmitEditing={handleLogin}
                        placeholder={`name${INSTITUTIONAL_DOMAIN}`}
                        placeholderTextColor={colors.textMuted}
                        style={[styles.input, { color: colors.text }]}
                        value={email}
                      />
                    </View>
                  </View>

                  <View>
                    <Text style={[styles.label, { color: colors.text }]}>Password</Text>
                    <View style={[styles.inputWrap, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
                      <Ionicons name="lock-closed-outline" size={19} color={colors.textMuted} />
                      <TextInput
                        autoCapitalize="none"
                        editable={!isSubmitting}
                        onChangeText={setPassword}
                        onSubmitEditing={handleLogin}
                        placeholder="Enter your password"
                        placeholderTextColor={colors.textMuted}
                        secureTextEntry={!showPassword}
                        style={[styles.input, { color: colors.text }]}
                        value={password}
                      />
                      <Pressable accessibilityLabel={showPassword ? 'Hide password' : 'Show password'} onPress={() => setShowPassword((current) => !current)}>
                        <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={19} color={colors.textMuted} />
                      </Pressable>
                    </View>
                  </View>

                  {error && (
                    <View style={[styles.errorBox, { backgroundColor: colors.primarySoft }]}>
                      <Ionicons name="alert-circle-outline" size={17} color={colors.primary} />
                      <Text style={[styles.errorText, { color: colors.primary }]}>{error}</Text>
                    </View>
                  )}

                  <Pressable
                    accessibilityRole="button"
                    disabled={isSubmitting}
                    onPress={handleLogin}
                    style={({ pressed }) => [
                      styles.signInButton,
                      { backgroundColor: pressed ? colors.primaryPressed : colors.primary, opacity: isSubmitting ? 0.7 : 1 },
                    ]}>
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={styles.signInText}>Sign in</Text>
                        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                      </>
                    )}
                  </Pressable>
                </View>

                <View style={[styles.demoNote, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
                  <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
                  <Text selectable style={[styles.demoText, { color: colors.textMuted }]}>
                    Demo accounts: quey.baldos{INSTITUTIONAL_DOMAIN} or mary.baldos{INSTITUTIONAL_DOMAIN}{'\n'}
                    Password: AthenaDemo2026!
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, overflow: 'hidden' },
  redPanel: { height: '38%', left: 0, overflow: 'hidden', position: 'absolute', right: 0, top: 0 },
  panelCircleOne: { borderColor: '#FFFFFF', borderRadius: 160, borderWidth: 38, height: 280, opacity: 0.07, position: 'absolute', right: -80, top: -120, width: 280 },
  panelCircleTwo: { borderColor: '#FFFFFF', borderRadius: 90, borderWidth: 22, bottom: -80, height: 180, left: -75, opacity: 0.06, position: 'absolute', width: 180 },
  scrollContent: { flexGrow: 1 },
  page: { alignItems: 'center', flex: 1, paddingBottom: 28, paddingHorizontal: 22, paddingTop: 8 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', maxWidth: 540, width: '100%' },
  iconButton: { alignItems: 'center', borderRadius: 22, borderWidth: 1, height: 44, justifyContent: 'center', width: 44 },
  card: { borderRadius: 28, borderWidth: 1, elevation: 10, marginTop: 26, maxWidth: 470, overflow: 'hidden', shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.2, shadowRadius: 30, width: '100%' },
  brandArea: { alignItems: 'center', backgroundColor: '#B20D30', flexDirection: 'row', gap: 12, justifyContent: 'center', paddingVertical: 21 },
  brandWord: { color: '#FFFFFF', fontSize: 21, fontWeight: '800', letterSpacing: 4 },
  cardBody: { alignItems: 'center', paddingHorizontal: 27, paddingVertical: 27 },
  welcomeIcon: { alignItems: 'center', borderRadius: 24, height: 48, justifyContent: 'center', marginBottom: 15, width: 48 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { fontSize: 12, lineHeight: 19, marginTop: 8, maxWidth: 350, textAlign: 'center' },
  form: { gap: 15, marginTop: 24, width: '100%' },
  label: { fontSize: 10, fontWeight: '800', marginBottom: 7 },
  inputWrap: { alignItems: 'center', borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 10, minHeight: 54, paddingHorizontal: 14 },
  input: { flex: 1, fontSize: 13, minHeight: 50 },
  errorBox: { alignItems: 'flex-start', borderRadius: 12, flexDirection: 'row', gap: 8, padding: 11 },
  errorText: { flex: 1, fontSize: 10, fontWeight: '700', lineHeight: 15 },
  signInButton: { alignItems: 'center', borderRadius: 15, flexDirection: 'row', gap: 9, height: 56, justifyContent: 'center' },
  signInText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  demoNote: { alignItems: 'flex-start', borderRadius: 13, borderWidth: 1, flexDirection: 'row', gap: 9, marginTop: 20, padding: 12, width: '100%' },
  demoText: { flex: 1, fontSize: 9, lineHeight: 15 },
});
