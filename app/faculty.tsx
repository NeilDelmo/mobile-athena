import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import { useDemoProjects } from '@/components/demo-projects-provider';
import { FacultyDrawer, type FacultyNavAction } from '@/components/faculty-drawer';
import { FacultyProjectCard } from '@/components/faculty-project-card';
import { ThemeToggle } from '@/components/theme-toggle';
import { type ResearchProposal } from '@/constants/research-proposals';

const FACULTY_NAME = 'Quey Jinnet Baldos';

const notices = [
  {
    eyebrow: 'INSTITUTIONAL NOTICE',
    title: 'Research Ethics Review',
    body: 'Review the newly updated BatStateU institutional research ethics guidelines.',
  },
  {
    eyebrow: 'RESEARCH CALL',
    title: 'Faculty Research Grant',
    body: 'The next proposal cycle is now open for faculty-led research projects.',
  },
  {
    eyebrow: 'CAMPUS UPDATE',
    title: 'Research Week 2026',
    body: 'Presentation and poster-session registrations are now available.',
  },
];

function showComingSoon(title: string, message: string) {
  Alert.alert(title, message);
}

export default function FacultyDashboard() {
  const { colors, isDark } = useAppTheme();
  const { projects } = useDemoProjects();
  const { width } = useWindowDimensions();
  const isWide = width >= 780;
  const showAskAthena = width >= 520;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeNotice, setActiveNotice] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveNotice((current) => (current + 1) % notices.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const notice = notices[activeNotice];
  const stats = useMemo(
    () => [
      {
        label: 'Active proposals',
        value: projects.filter((project) => ['Pending Review', 'For Revision'].includes(project.status)).length,
        icon: 'document-text-outline' as const,
        iconBackground: isDark ? '#3C1822' : '#FDE5E7',
        iconColor: colors.primary,
      },
      {
        label: 'Approved studies',
        value: projects.filter((project) => project.status === 'Approved').length,
        icon: 'checkmark-circle-outline' as const,
        iconBackground: isDark ? '#0A3024' : '#DCF6E8',
        iconColor: isDark ? '#35DB87' : '#13854A',
      },
      {
        label: 'Under evaluation',
        value: projects.filter((project) => project.status === 'Pending Review').length,
        icon: 'time-outline' as const,
        iconBackground: isDark ? '#432510' : '#FFF0D8',
        iconColor: isDark ? '#FF9C35' : '#B85C00',
      },
      {
        label: 'Action required',
        value: projects.filter((project) => project.status === 'For Revision').length,
        icon: 'alert-circle-outline' as const,
        iconBackground: isDark ? '#142C61' : '#E5EEFF',
        iconColor: isDark ? '#63A2FF' : '#2166D1',
      },
    ],
    [colors.primary, isDark, projects],
  );

  const openProject = (project: ResearchProposal) => {
    router.push(`/faculty-project/${encodeURIComponent(project.id)}` as Href);
  };

  const handleDrawerAction = (action: FacultyNavAction) => {
    if (action === 'dashboard') {
      return;
    }

    if (action === 'projects') {
      router.push('/faculty-projects' as Href);
      return;
    }

    showComingSoon('Research calls', 'Open institutional and external research calls will appear here.');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <FacultyDrawer
        activeAction="dashboard"
        onClose={() => setDrawerOpen(false)}
        onSelect={handleDrawerAction}
        visible={drawerOpen}
      />

      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.headerInner}>
          <View style={styles.headerLeft}>
            <Pressable
              accessibilityLabel="Open faculty navigation"
              accessibilityRole="button"
              onPress={() => setDrawerOpen(true)}
              style={({ pressed }) => [
                styles.menuButton,
                { backgroundColor: colors.primarySoft, opacity: pressed ? 0.66 : 1 },
              ]}>
              <Ionicons name="menu" size={23} color={colors.primary} />
            </Pressable>
            <View>
              <Text style={[styles.headerEyebrow, { color: colors.primary }]}>ATHENA PORTAL</Text>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Faculty Workspace</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {showAskAthena && (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  showComingSoon('Ask Athena', 'The research assistant will be connected in a later phase.')
                }
                style={({ pressed }) => [
                  styles.askButton,
                  {
                    backgroundColor: pressed ? colors.primaryPressed : colors.primary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}>
                <Ionicons name="sparkles" size={15} color="#FFFFFF" />
                <Text style={styles.askButtonText}>Ask Athena</Text>
              </Pressable>
            )}
            <ThemeToggle />
            <Pressable
              accessibilityLabel="Notifications"
              accessibilityRole="button"
              onPress={() => showComingSoon('Notifications', 'You have no new notifications.')}
              style={({ pressed }) => [
                styles.notificationButton,
                { backgroundColor: colors.surfaceMuted, opacity: pressed ? 0.65 : 1 },
              ]}>
              <Ionicons name="notifications-outline" size={20} color={colors.textMuted} />
            </Pressable>
            <View style={[styles.headerAvatar, { backgroundColor: isDark ? '#A743C2' : '#8F32A8' }]}>
              <Text style={styles.headerAvatarText}>Q</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <View style={[styles.welcomeRow, isWide && styles.welcomeRowWide]}>
            <View style={styles.welcomeCopy}>
              <Text selectable style={[styles.greeting, { color: colors.text }]}>Faculty Research Workspace</Text>
              <Text style={[styles.greetingBody, { color: colors.textMuted }]}>
                Welcome back,{' '}
                <Text selectable style={{ color: colors.primary, fontWeight: '800' }}>
                  {FACULTY_NAME.toUpperCase()}
                </Text>
                . Manage and track your institutional research submissions.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/faculty-projects' as Href)}
              style={({ pressed }) => [
                styles.proposalButton,
                {
                  backgroundColor: pressed ? colors.primaryPressed : colors.primary,
                  opacity: pressed ? 0.86 : 1,
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                },
              ]}>
              <Ionicons name="folder-open-outline" size={18} color="#FFFFFF" />
              <Text style={styles.proposalButtonText}>My Projects</Text>
            </Pressable>
          </View>

          <Animated.View
            entering={FadeInDown.duration(380).reduceMotion(ReduceMotion.System)}
            style={[
              styles.banner,
              { backgroundColor: isDark ? '#131D30' : '#6F2635', borderColor: colors.border },
            ]}>
            <View style={[styles.bannerGlow, { backgroundColor: colors.primary }]} />
            <View style={styles.bannerPaperBack} />
            <View style={styles.bannerPaperFront} />
            <View style={styles.bannerPen} />
            <View style={styles.bannerShade} />
            <View style={styles.bannerContent}>
              <View style={[styles.noticeBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.noticeBadgeText}>{notice.eyebrow}</Text>
              </View>
              <Text style={styles.bannerTitle}>{notice.title}</Text>
              <Text style={styles.bannerBody}>{notice.body}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  showComingSoon(notice.title, 'Full notice details will be available here.')
                }
                style={({ pressed }) => [styles.bannerLink, { opacity: pressed ? 0.62 : 1 }]}>
                <Text style={styles.bannerLinkText}>View notice</Text>
                <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
              </Pressable>
            </View>
            <View style={styles.bannerDots}>
              {notices.map((item, index) => (
                <Pressable
                  accessibilityLabel={`Show ${item.title}`}
                  accessibilityState={{ selected: activeNotice === index }}
                  key={item.title}
                  onPress={() => setActiveNotice(index)}
                  style={[
                    styles.bannerDot,
                    index === activeNotice && [styles.bannerDotActive, { backgroundColor: colors.primary }],
                  ]}
                />
              ))}
            </View>
          </Animated.View>

          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <Animated.View
                entering={FadeInDown.delay(70 + index * 45)
                  .duration(330)
                  .reduceMotion(ReduceMotion.System)}
                key={stat.label}
                style={[
                  styles.statCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}>
                <View style={styles.statCopy}>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>{stat.label.toUpperCase()}</Text>
                  <Text selectable style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                </View>
                <View style={[styles.statIcon, { backgroundColor: stat.iconBackground }]}>
                  <Ionicons name={stat.icon} size={22} color={stat.iconColor} />
                </View>
              </Animated.View>
            ))}
          </View>

          <Animated.View
            entering={FadeInDown.delay(230).duration(360).reduceMotion(ReduceMotion.System)}
            style={[
              styles.manuscriptCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
            <View style={[styles.manuscriptHeader, { borderColor: colors.border }]}>
              <View style={styles.manuscriptHeaderRow}>
                <View style={styles.manuscriptHeaderCopy}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>My Projects</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                    Monitor approval progress, feedback, and required actions.
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push('/faculty-projects' as Href)}
                  style={({ pressed }) => [styles.viewAllButton, { opacity: pressed ? 0.58 : 1 }]}>
                  <Text style={[styles.viewAllText, { color: colors.primary }]}>View all</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                </Pressable>
              </View>
            </View>
            <View style={styles.projectGrid}>
              {projects.slice(0, 3).map((project) => (
                <FacultyProjectCard compact key={project.id} onPress={openProject} project={project} />
              ))}
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { borderBottomWidth: 1 },
  headerInner: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    maxWidth: 1160,
    minHeight: 68,
    paddingHorizontal: 18,
    paddingVertical: 10,
    width: '100%',
  },
  headerLeft: { alignItems: 'center', flexDirection: 'row', gap: 11 },
  menuButton: { alignItems: 'center', borderRadius: 13, height: 42, justifyContent: 'center', width: 42 },
  headerEyebrow: { fontSize: 8, fontWeight: '900', letterSpacing: 1.25 },
  headerTitle: { fontSize: 16, fontWeight: '800', marginTop: 2 },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  askButton: {
    alignItems: 'center',
    borderRadius: 13,
    flexDirection: 'row',
    gap: 7,
    minHeight: 42,
    paddingHorizontal: 14,
  },
  askButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  notificationButton: { alignItems: 'center', borderRadius: 21, height: 42, justifyContent: 'center', width: 42 },
  headerAvatar: { alignItems: 'center', borderRadius: 21, height: 42, justifyContent: 'center', width: 42 },
  headerAvatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  scrollContent: { paddingBottom: 42 },
  page: { alignSelf: 'center', maxWidth: 1160, paddingHorizontal: 18, paddingTop: 26, width: '100%' },
  welcomeRow: { gap: 19 },
  welcomeRowWide: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  welcomeCopy: { flex: 1 },
  greeting: { fontSize: 27, fontWeight: '800', letterSpacing: -0.65 },
  greetingBody: { fontSize: 11, lineHeight: 18, marginTop: 5, maxWidth: 720 },
  proposalButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    minHeight: 46,
    paddingHorizontal: 16,
  },
  proposalButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  banner: {
    borderCurve: 'continuous',
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'flex-end',
    marginTop: 25,
    minHeight: 250,
    overflow: 'hidden',
    padding: 28,
    position: 'relative',
  },
  bannerGlow: { borderRadius: 170, height: 280, opacity: 0.2, position: 'absolute', right: -105, top: -100, width: 280 },
  bannerPaperBack: { backgroundColor: '#F5EDE6', borderRadius: 8, height: 170, opacity: 0.13, position: 'absolute', right: 80, top: 28, transform: [{ rotate: '-8deg' }], width: 215 },
  bannerPaperFront: { backgroundColor: '#FFFFFF', borderRadius: 8, height: 170, opacity: 0.17, position: 'absolute', right: 25, top: 45, transform: [{ rotate: '5deg' }], width: 215 },
  bannerPen: { backgroundColor: '#6E87B2', borderRadius: 6, height: 230, opacity: 0.45, position: 'absolute', right: 198, top: -10, transform: [{ rotate: '35deg' }], width: 16 },
  bannerShade: { backgroundColor: 'rgba(5,10,20,0.46)', bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  bannerContent: { maxWidth: 620 },
  noticeBadge: { alignSelf: 'flex-start', borderRadius: 5, paddingHorizontal: 8, paddingVertical: 5 },
  noticeBadgeText: { color: '#FFFFFF', fontSize: 8, fontWeight: '900', letterSpacing: 0.75 },
  bannerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginTop: 11 },
  bannerBody: { color: '#E8EDF7', fontSize: 11, lineHeight: 17, marginTop: 5, maxWidth: 530 },
  bannerLink: { alignItems: 'center', flexDirection: 'row', gap: 5, marginTop: 13 },
  bannerLinkText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  bannerDots: { bottom: 18, flexDirection: 'row', gap: 7, position: 'absolute', right: 20 },
  bannerDot: { backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 4, height: 6, width: 6 },
  bannerDotActive: { width: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11, marginTop: 20 },
  statCard: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 18,
    borderWidth: 1,
    flexBasis: 220,
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'space-between',
    minHeight: 108,
    minWidth: 158,
    padding: 17,
  },
  statCopy: { gap: 7 },
  statLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.7 },
  statValue: { fontSize: 29, fontVariant: ['tabular-nums'], fontWeight: '800' },
  statIcon: { alignItems: 'center', borderRadius: 13, height: 48, justifyContent: 'center', width: 48 },
  manuscriptCard: { borderCurve: 'continuous', borderRadius: 20, borderWidth: 1, marginTop: 24, overflow: 'hidden' },
  manuscriptHeader: { borderBottomWidth: 1, paddingHorizontal: 22, paddingVertical: 20 },
  manuscriptHeaderRow: { alignItems: 'center', flexDirection: 'row', gap: 14, justifyContent: 'space-between' },
  manuscriptHeaderCopy: { flex: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '800' },
  sectionSubtitle: { fontSize: 10, marginTop: 5 },
  viewAllButton: { alignItems: 'center', flexDirection: 'row', gap: 5, paddingVertical: 7 },
  viewAllText: { fontSize: 10, fontWeight: '800' },
  projectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16 },
  emptyState: { alignItems: 'center', minHeight: 275, paddingHorizontal: 24, paddingVertical: 43 },
  emptyIcon: { alignItems: 'center', borderRadius: 17, borderWidth: 1, height: 54, justifyContent: 'center', width: 54 },
  emptyTitle: { fontSize: 13, fontWeight: '800', marginTop: 17 },
  emptyBody: { fontSize: 10, lineHeight: 16, marginTop: 7, maxWidth: 330, textAlign: 'center' },
  emptyButton: { alignItems: 'center', borderRadius: 11, borderWidth: 1, flexDirection: 'row', gap: 7, marginTop: 19, paddingHorizontal: 13, paddingVertical: 10 },
  emptyButtonText: { fontSize: 10, fontWeight: '800' },
});
