import { Ionicons } from '@expo/vector-icons';
import { type Href } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import { useAuth } from '@/components/auth-provider';
import { PortalPageHeader } from '@/components/portal-page-header';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { colors, isDark, toggleTheme } = useAppTheme();
  const [decisionUpdates, setDecisionUpdates] = useState(true);
  const [deadlineReminders, setDeadlineReminders] = useState(true);
  const isResearchHead = user?.role !== 'faculty';
  const fallbackHref = (isResearchHead ? '/research-head' : '/faculty') as Href;
  const profile = {
    initials: `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase(),
    name: user ? `${user.firstName} ${user.lastName}` : 'ATHENA User',
    email: user?.email || '',
    role: user?.role.replaceAll('_', ' ') || '',
    department: user?.department || 'Not assigned',
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <PortalPageHeader eyebrow="ACCOUNT" fallbackHref={fallbackHref} title="Profile & Settings" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <Animated.View
            entering={FadeInDown.duration(320).reduceMotion(ReduceMotion.System)}
            style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{profile.initials}</Text>
            </View>
            <View style={styles.profileCopy}>
              <Text selectable style={[styles.name, { color: colors.text }]}>{profile.name}</Text>
              <Text selectable style={[styles.email, { color: colors.textMuted }]}>{profile.email}</Text>
              <View style={[styles.roleBadge, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="shield-checkmark-outline" size={13} color={colors.primary} />
                <Text style={[styles.roleText, { color: colors.primary }]}>{profile.role.toUpperCase()}</Text>
              </View>
            </View>
          </Animated.View>

          <View style={styles.columns}>
            <Animated.View
              entering={FadeInDown.delay(70).duration(320).reduceMotion(ReduceMotion.System)}
              style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Account information</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>Your institutional identity and assigned access.</Text>
              <View style={styles.detailList}>
                {[
                  ['person-outline', 'Name', profile.name],
                  ['mail-outline', 'Email', profile.email],
                  ['briefcase-outline', 'System role', profile.role],
                  ['business-outline', 'Department', profile.department],
                ].map(([icon, label, value]) => (
                  <View key={label} style={[styles.detailRow, { borderColor: colors.border }]}>
                    <View style={[styles.detailIcon, { backgroundColor: colors.surfaceMuted }]}>
                      <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={17} color={colors.primary} />
                    </View>
                    <View style={styles.detailCopy}>
                      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{label}</Text>
                      <Text selectable style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>

            <View style={styles.settingsColumn}>
              <Animated.View
                entering={FadeInDown.delay(110).duration(320).reduceMotion(ReduceMotion.System)}
                style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>Choose the theme used throughout ATHENA.</Text>
                <View style={[styles.settingRow, { borderColor: colors.border }]}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.primarySoft }]}>
                    <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={colors.primary} />
                  </View>
                  <View style={styles.settingCopy}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>{isDark ? 'Dark theme' : 'Light theme'}</Text>
                    <Text style={[styles.settingBody, { color: colors.textMuted }]}>Switch between light and dark mode.</Text>
                  </View>
                  <Switch
                    accessibilityLabel="Use dark theme"
                    onValueChange={toggleTheme}
                    thumbColor="#FFFFFF"
                    trackColor={{ false: colors.border, true: colors.primary }}
                    value={isDark}
                  />
                </View>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(150).duration(320).reduceMotion(ReduceMotion.System)}
                style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification preferences</Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>Control which updates appear in your ATHENA inbox.</Text>
                {[
                  {
                    label: isResearchHead ? 'Proposal queue updates' : 'Decision and revision updates',
                    body: isResearchHead ? 'New submissions that require screening.' : 'Changes made by the Research Head.',
                    value: decisionUpdates,
                    onChange: setDecisionUpdates,
                    icon: 'notifications-outline' as const,
                  },
                  {
                    label: 'Research call reminders',
                    body: 'Upcoming opportunity and deadline reminders.',
                    value: deadlineReminders,
                    onChange: setDeadlineReminders,
                    icon: 'calendar-outline' as const,
                  },
                ].map((setting) => (
                  <View key={setting.label} style={[styles.settingRow, { borderColor: colors.border }]}>
                    <View style={[styles.settingIcon, { backgroundColor: colors.surfaceMuted }]}>
                      <Ionicons name={setting.icon} size={18} color={colors.primary} />
                    </View>
                    <View style={styles.settingCopy}>
                      <Text style={[styles.settingTitle, { color: colors.text }]}>{setting.label}</Text>
                      <Text style={[styles.settingBody, { color: colors.textMuted }]}>{setting.body}</Text>
                    </View>
                    <Switch
                      onValueChange={setting.onChange}
                      thumbColor="#FFFFFF"
                      trackColor={{ false: colors.border, true: colors.primary }}
                      value={setting.value}
                    />
                  </View>
                ))}
              </Animated.View>
            </View>
          </View>

          <View style={[styles.systemNote, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
            <Ionicons name="server-outline" size={20} color={colors.primary} />
            <View style={styles.systemNoteCopy}>
              <Text style={[styles.systemNoteTitle, { color: colors.text }]}>Database-backed account</Text>
              <Text style={[styles.systemNoteBody, { color: colors.textMuted }]}>
                Your institutional identity and assigned role were loaded from the ATHENA MySQL database.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 42 },
  page: { alignSelf: 'center', maxWidth: 980, paddingHorizontal: 18, paddingTop: 26, width: '100%' },
  profileCard: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 22, borderWidth: 1, flexDirection: 'row', gap: 16, padding: 21 },
  avatar: { alignItems: 'center', borderRadius: 32, height: 64, justifyContent: 'center', width: 64 },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  profileCopy: { flex: 1 },
  name: { fontSize: 21, fontWeight: '800', letterSpacing: -0.4 },
  email: { fontSize: 10, marginTop: 4 },
  roleBadge: { alignItems: 'center', alignSelf: 'flex-start', borderRadius: 13, flexDirection: 'row', gap: 5, marginTop: 10, paddingHorizontal: 9, paddingVertical: 6 },
  roleText: { fontSize: 7, fontWeight: '900', letterSpacing: 0.7 },
  columns: { alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', gap: 13, paddingTop: 13 },
  settingsColumn: { flex: 1, gap: 13, minWidth: 285 },
  settingsCard: { borderCurve: 'continuous', borderRadius: 20, borderWidth: 1, flex: 1, minWidth: 285, padding: 18 },
  sectionTitle: { fontSize: 14, fontWeight: '800' },
  sectionSubtitle: { fontSize: 9, lineHeight: 15, marginTop: 4 },
  detailList: { paddingTop: 11 },
  detailRow: { alignItems: 'center', borderBottomWidth: 1, flexDirection: 'row', gap: 10, paddingVertical: 11 },
  detailIcon: { alignItems: 'center', borderRadius: 11, height: 38, justifyContent: 'center', width: 38 },
  detailCopy: { flex: 1 },
  detailLabel: { fontSize: 8, fontWeight: '700' },
  detailValue: { fontSize: 10, fontWeight: '700', lineHeight: 15, marginTop: 3 },
  settingRow: { alignItems: 'center', borderBottomWidth: 1, flexDirection: 'row', gap: 10, paddingVertical: 13 },
  settingIcon: { alignItems: 'center', borderRadius: 11, height: 39, justifyContent: 'center', width: 39 },
  settingCopy: { flex: 1 },
  settingTitle: { fontSize: 10, fontWeight: '800' },
  settingBody: { fontSize: 8, lineHeight: 13, marginTop: 3 },
  systemNote: { alignItems: 'flex-start', borderCurve: 'continuous', borderRadius: 17, borderWidth: 1, flexDirection: 'row', gap: 11, marginTop: 13, padding: 16 },
  systemNoteCopy: { flex: 1 },
  systemNoteTitle: { fontSize: 11, fontWeight: '800' },
  systemNoteBody: { fontSize: 9, lineHeight: 15, marginTop: 4 },
});
