import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import { FacultyDrawer } from '@/components/faculty-drawer';
import { ThemeToggle } from '@/components/theme-toggle';

const notices = [
  {
    eyebrow: 'FACULTY RESEARCH GRANT',
    title: 'Turn your next idea into meaningful impact.',
    body: 'The next proposal cycle is now open for faculty-led projects.',
    icon: 'bulb-outline' as const,
  },
  {
    eyebrow: 'CAMPUS RESEARCH WEEK',
    title: 'Share your work with the Athena community.',
    body: 'Presentation and poster session registrations are now available.',
    icon: 'people-outline' as const,
  },
  {
    eyebrow: 'FACULTY DEVELOPMENT',
    title: 'Fresh workshops for a stronger semester.',
    body: 'Explore practical sessions designed for teaching and research.',
    icon: 'school-outline' as const,
  },
];

function showDemoMessage(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function FacultyDashboard() {
  const { colors, isDark } = useAppTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 780;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeNotice, setActiveNotice] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveNotice((current) => (current + 1) % notices.length);
    }, 5500);

    return () => clearInterval(timer);
  }, []);

  const notice = notices[activeNotice];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <FacultyDrawer onClose={() => setDrawerOpen(false)} visible={drawerOpen} />
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.headerInner}>
          <View style={styles.headerLeft}>
            <Pressable
              accessibilityLabel="Open navigation menu"
              onPress={() => setDrawerOpen(true)}
              style={({ pressed }) => [
                styles.menuButton,
                { backgroundColor: colors.primarySoft, opacity: pressed ? 0.65 : 1 },
              ]}>
              <Ionicons name="menu" size={23} color={colors.primary} />
            </Pressable>
            <View>
              <Text style={[styles.headerEyebrow, { color: colors.textMuted }]}>FACULTY PORTAL</Text>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Dashboard</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <ThemeToggle />
            <View style={[styles.headerAvatar, { backgroundColor: colors.primary }]}> 
              <Text style={styles.headerAvatarText}>FM</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <View style={[styles.welcomeRow, isWide && styles.welcomeRowWide]}>
            <View style={styles.welcomeCopy}>
              <View style={[styles.facultyBadge, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="ribbon-outline" size={14} color={colors.primary} />
                <Text style={[styles.facultyBadgeText, { color: colors.primary }]}>FACULTY WORKSPACE</Text>
              </View>
              <Text style={[styles.greeting, { color: colors.text }]}>Welcome back, Professor.</Text>
              <Text style={[styles.greetingBody, { color: colors.textMuted }]}>Here&apos;s an overview of your project activity.</Text>
            </View>
            <Pressable
              onPress={() => showDemoMessage('Submit a proposal', 'The proposal form will be connected in the next project phase.')}
              style={({ pressed }) => [
                styles.proposalButton,
                {
                  backgroundColor: pressed ? colors.primaryPressed : colors.primary,
                  shadowColor: colors.shadow,
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                },
              ]}>
              <View style={styles.proposalIcon}>
                <Ionicons name="add" size={20} color={colors.primary} />
              </View>
              <Text style={styles.proposalButtonText}>Submit proposal</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={[styles.banner, { backgroundColor: isDark ? '#790D29' : '#B20D30' }]}>
            <View style={styles.bannerRingOne} />
            <View style={styles.bannerRingTwo} />
            <View style={styles.bannerContent}>
              <View style={styles.bannerIcon}>
                <Ionicons name={notice.icon} size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.bannerEyebrow}>{notice.eyebrow}</Text>
              <Text style={styles.bannerTitle}>{notice.title}</Text>
              <Text style={styles.bannerBody}>{notice.body}</Text>
              <Pressable
                onPress={() => showDemoMessage(notice.eyebrow, 'Details for this campus notice will be available here.')}
                style={({ pressed }) => [styles.bannerButton, { opacity: pressed ? 0.75 : 1 }]}>
                <Text style={styles.bannerButtonText}>Learn more</Text>
                <Ionicons name="arrow-forward" size={15} color="#B20D30" />
              </Pressable>
            </View>
            <View style={styles.bannerDots}>
              {notices.map((item, index) => (
                <Pressable
                  accessibilityLabel={`Show ${item.eyebrow}`}
                  key={item.eyebrow}
                  onPress={() => setActiveNotice(index)}
                  style={[
                    styles.bannerDot,
                    index === activeNotice && styles.bannerDotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.statsGrid}>
            {[
              { label: 'Total projects', value: '0', icon: 'folder-open-outline' as const },
              { label: 'Under review', value: '0', icon: 'time-outline' as const },
              { label: 'Approved', value: '0', icon: 'checkmark-circle-outline' as const },
            ].map((stat) => (
              <View
                key={stat.label}
                style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.statIcon, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons name={stat.icon} size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>{stat.label}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.projectsHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>My projects</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>Your submitted proposals and active projects</Text>
            </View>
            <View style={[styles.countBadge, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.countBadgeText, { color: colors.textMuted }]}>0 projects</Text>
            </View>
          </View>

          <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.emptyIconOuter, { backgroundColor: colors.primarySoft }]}>
              <View style={[styles.emptyIconInner, { backgroundColor: colors.surface }]}>
                <Ionicons name="documents-outline" size={31} color={colors.primary} />
              </View>
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No projects yet</Text>
            <Text style={[styles.emptyBody, { color: colors.textMuted }]}>When you submit your first proposal, its progress and details will appear here.</Text>
            <Pressable
              onPress={() => showDemoMessage('Start your first proposal', 'The proposal form will be connected in the next project phase.')}
              style={({ pressed }) => [
                styles.emptyButton,
                { borderColor: colors.border, opacity: pressed ? 0.6 : 1 },
              ]}>
              <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
              <Text style={[styles.emptyButtonText, { color: colors.primary }]}>Create proposal</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { borderBottomWidth: 1 },
  headerInner: { alignItems: 'center', alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between', maxWidth: 1120, paddingHorizontal: 20, paddingVertical: 13, width: '100%' },
  headerLeft: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  menuButton: { alignItems: 'center', borderRadius: 14, height: 44, justifyContent: 'center', width: 44 },
  headerEyebrow: { fontSize: 8, fontWeight: '800', letterSpacing: 1.4 },
  headerTitle: { fontSize: 18, fontWeight: '800', marginTop: 1 },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  headerAvatar: { alignItems: 'center', borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  headerAvatarText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  scrollContent: { paddingBottom: 36 },
  page: { alignSelf: 'center', maxWidth: 1120, paddingHorizontal: 20, paddingTop: 30, width: '100%' },
  welcomeRow: { gap: 22 },
  welcomeRowWide: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' },
  welcomeCopy: { gap: 7 },
  facultyBadge: { alignItems: 'center', alignSelf: 'flex-start', borderRadius: 20, flexDirection: 'row', gap: 6, paddingHorizontal: 10, paddingVertical: 6 },
  facultyBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  greeting: { fontSize: 29, fontWeight: '800', letterSpacing: -0.8, marginTop: 4 },
  greetingBody: { fontSize: 13 },
  proposalButton: { alignItems: 'center', alignSelf: 'flex-start', borderRadius: 15, elevation: 5, flexDirection: 'row', gap: 10, height: 52, paddingHorizontal: 13, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.21, shadowRadius: 14 },
  proposalIcon: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, height: 30, justifyContent: 'center', width: 30 },
  proposalButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  banner: { borderRadius: 25, marginTop: 30, minHeight: 265, overflow: 'hidden', padding: 26, position: 'relative' },
  bannerRingOne: { borderColor: '#FFFFFF', borderRadius: 150, borderWidth: 30, height: 270, opacity: 0.07, position: 'absolute', right: -45, top: -90, width: 270 },
  bannerRingTwo: { borderColor: '#FFFFFF', borderRadius: 90, borderWidth: 18, bottom: -75, height: 170, opacity: 0.06, position: 'absolute', right: 145, width: 170 },
  bannerContent: { maxWidth: 600 },
  bannerIcon: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 14, height: 45, justifyContent: 'center', marginBottom: 17, width: 45 },
  bannerEyebrow: { color: '#FFD9E1', fontSize: 9, fontWeight: '800', letterSpacing: 1.45 },
  bannerTitle: { color: '#FFFFFF', fontSize: 25, fontWeight: '800', letterSpacing: -0.55, lineHeight: 31, marginTop: 7 },
  bannerBody: { color: '#FBDCE2', fontSize: 12, lineHeight: 18, marginTop: 7, maxWidth: 480 },
  bannerButton: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderRadius: 10, flexDirection: 'row', gap: 7, marginTop: 18, paddingHorizontal: 13, paddingVertical: 9 },
  bannerButtonText: { color: '#B20D30', fontSize: 11, fontWeight: '800' },
  bannerDots: { bottom: 22, flexDirection: 'row', gap: 6, position: 'absolute', right: 24 },
  bannerDot: { backgroundColor: 'rgba(255,255,255,0.36)', borderRadius: 3, height: 6, width: 6 },
  bannerDotActive: { backgroundColor: '#FFFFFF', width: 22 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 18 },
  statCard: { alignItems: 'center', borderRadius: 17, borderWidth: 1, flexBasis: 210, flexDirection: 'row', flexGrow: 1, gap: 12, minWidth: 170, padding: 15 },
  statIcon: { alignItems: 'center', borderRadius: 12, height: 42, justifyContent: 'center', width: 42 },
  statValue: { fontSize: 21, fontWeight: '800' },
  statLabel: { fontSize: 10, marginTop: 1 },
  projectsHeader: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between', marginTop: 34 },
  sectionTitle: { fontSize: 20, fontWeight: '800' },
  sectionSubtitle: { fontSize: 11, marginTop: 4 },
  countBadge: { borderRadius: 14, paddingHorizontal: 10, paddingVertical: 7 },
  countBadgeText: { fontSize: 9, fontWeight: '700' },
  emptyState: { alignItems: 'center', borderRadius: 22, borderStyle: 'dashed', borderWidth: 1.5, marginTop: 15, paddingHorizontal: 24, paddingVertical: 46 },
  emptyIconOuter: { alignItems: 'center', borderRadius: 38, height: 76, justifyContent: 'center', width: 76 },
  emptyIconInner: { alignItems: 'center', borderRadius: 27, height: 54, justifyContent: 'center', width: 54 },
  emptyTitle: { fontSize: 17, fontWeight: '800', marginTop: 18 },
  emptyBody: { fontSize: 11, lineHeight: 17, marginTop: 7, maxWidth: 360, textAlign: 'center' },
  emptyButton: { alignItems: 'center', borderRadius: 11, borderWidth: 1, flexDirection: 'row', gap: 7, marginTop: 20, paddingHorizontal: 13, paddingVertical: 10 },
  emptyButtonText: { fontSize: 11, fontWeight: '800' },
});
