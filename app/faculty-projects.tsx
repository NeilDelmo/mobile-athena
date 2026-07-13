import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import { useDemoProjects } from '@/components/demo-projects-provider';
import { FacultyDrawer, type FacultyNavAction } from '@/components/faculty-drawer';
import { FacultyProjectCard } from '@/components/faculty-project-card';
import { ThemeToggle } from '@/components/theme-toggle';
import { type ResearchProposal } from '@/constants/research-proposals';

type ProjectFilter = 'All' | 'Active' | 'Action Required' | 'Approved';

export default function FacultyProjectsScreen() {
  const { colors, isDark } = useAppTheme();
  const { notifications, projects } = useDemoProjects();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filter, setFilter] = useState<ProjectFilter>('All');
  const unreadCount = notifications.filter(
    (notification) => notification.role === 'faculty' && !notification.read,
  ).length;

  const filteredProjects = useMemo(() => {
    if (filter === 'Active') {
      return projects.filter((project) => project.status === 'Pending Review');
    }

    if (filter === 'Action Required') {
      return projects.filter((project) => project.status === 'For Revision');
    }

    if (filter === 'Approved') {
      return projects.filter((project) => project.status === 'Approved');
    }

    return projects;
  }, [filter, projects]);

  const openProject = (project: ResearchProposal) => {
    router.push(`/faculty-project/${encodeURIComponent(project.id)}` as Href);
  };

  const handleDrawerAction = (action: FacultyNavAction) => {
    if (action === 'dashboard') {
      router.replace('/faculty' as Href);
      return;
    }

    if (action === 'projects') {
      return;
    }

    const routes: Record<Exclude<FacultyNavAction, 'dashboard' | 'projects'>, string> = {
      activity: '/activity?role=faculty',
      calls: '/research-calls?role=faculty',
      notifications: '/notifications?role=faculty',
      profile: '/profile?role=faculty',
    };
    router.push(routes[action] as Href);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <FacultyDrawer
        activeAction="projects"
        onClose={() => setDrawerOpen(false)}
        onSelect={handleDrawerAction}
        visible={drawerOpen}
      />

      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.headerInner}>
          <View style={styles.headerLeft}>
            <Pressable
              accessibilityLabel="Open faculty navigation"
              onPress={() => setDrawerOpen(true)}
              style={({ pressed }) => [
                styles.menuButton,
                { backgroundColor: colors.primarySoft, opacity: pressed ? 0.66 : 1 },
              ]}>
              <Ionicons name="menu" size={23} color={colors.primary} />
            </Pressable>
            <View>
              <Text style={[styles.headerEyebrow, { color: colors.primary }]}>FACULTY PORTAL</Text>
              <Text style={[styles.headerTitle, { color: colors.text }]}>My Projects</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityLabel="Notifications"
              accessibilityRole="button"
              onPress={() => router.push('/notifications?role=faculty' as Href)}
              style={({ pressed }) => [
                styles.notificationButton,
                { backgroundColor: colors.surfaceMuted, opacity: pressed ? 0.65 : 1 },
              ]}>
              <Ionicons name="notifications-outline" size={20} color={colors.textMuted} />
              {unreadCount > 0 && <View style={[styles.notificationDot, { backgroundColor: colors.primary }]} />}
            </Pressable>
            <ThemeToggle />
            <Pressable
              accessibilityLabel="Open profile and settings"
              accessibilityRole="button"
              onPress={() => router.push('/profile?role=faculty' as Href)}
              style={({ pressed }) => [
                styles.headerAvatar,
                { backgroundColor: isDark ? '#A743C2' : '#8F32A8', opacity: pressed ? 0.72 : 1 },
              ]}>
              <Text style={styles.headerAvatarText}>Q</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <Animated.View
            entering={FadeInDown.duration(320).reduceMotion(ReduceMotion.System)}
            style={styles.pageHeading}>
            <View style={styles.headingCopy}>
              <Text selectable style={[styles.title, { color: colors.text }]}>Research monitoring</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Track every proposal from submission through the Research Head decision.
              </Text>
            </View>
            <View style={[styles.totalBadge, { backgroundColor: colors.primarySoft }]}>
              <Text selectable style={[styles.totalNumber, { color: colors.primary }]}>{projects.length}</Text>
              <Text style={[styles.totalLabel, { color: colors.primary }]}>PROJECTS</Text>
            </View>
          </Animated.View>

          <ScrollView
            contentContainerStyle={styles.filterRow}
            horizontal
            showsHorizontalScrollIndicator={false}>
            {(['All', 'Active', 'Action Required', 'Approved'] as ProjectFilter[]).map((item) => {
              const selected = item === filter;
              return (
                <Pressable
                  accessibilityState={{ selected }}
                  key={item}
                  onPress={() => setFilter(item)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    {
                      backgroundColor: selected ? colors.primary : colors.surface,
                      borderColor: selected ? colors.primary : colors.border,
                      opacity: pressed ? 0.66 : 1,
                    },
                  ]}>
                  <Text style={[styles.filterText, { color: selected ? '#FFFFFF' : colors.textMuted }]}>{item}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.resultsRow}>
            <Text style={[styles.resultsText, { color: colors.textMuted }]}>{filteredProjects.length} results</Text>
            <View style={styles.demoLabel}>
              <Ionicons name="flask-outline" size={13} color={colors.textMuted} />
              <Text style={[styles.resultsText, { color: colors.textMuted }]}>Local demo data</Text>
            </View>
          </View>

          <View style={styles.projectList}>
            {filteredProjects.map((project, index) => (
              <Animated.View
                entering={FadeInDown.delay(index * 55).duration(320).reduceMotion(ReduceMotion.System)}
                key={project.id}>
                <FacultyProjectCard onPress={openProject} project={project} />
              </Animated.View>
            ))}
            {filteredProjects.length === 0 && (
              <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="folder-open-outline" size={31} color={colors.primary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No projects in this view</Text>
                <Text style={[styles.emptyBody, { color: colors.textMuted }]}>Choose another status filter to view the demo projects.</Text>
                <Pressable onPress={() => setFilter('All')}>
                  <Text style={[styles.resetText, { color: colors.primary }]}>Show all projects</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { borderBottomWidth: 1 },
  headerInner: { alignItems: 'center', alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between', maxWidth: 960, minHeight: 68, paddingHorizontal: 18, paddingVertical: 10, width: '100%' },
  headerLeft: { alignItems: 'center', flexDirection: 'row', gap: 11 },
  menuButton: { alignItems: 'center', borderRadius: 13, height: 42, justifyContent: 'center', width: 42 },
  headerEyebrow: { fontSize: 8, fontWeight: '900', letterSpacing: 1.25 },
  headerTitle: { fontSize: 16, fontWeight: '800', marginTop: 2 },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  notificationButton: { alignItems: 'center', borderRadius: 21, height: 42, justifyContent: 'center', position: 'relative', width: 42 },
  notificationDot: { borderColor: '#FFFFFF', borderRadius: 5, borderWidth: 2, height: 10, position: 'absolute', right: 3, top: 3, width: 10 },
  headerAvatar: { alignItems: 'center', borderRadius: 21, height: 42, justifyContent: 'center', width: 42 },
  headerAvatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  scrollContent: { paddingBottom: 42 },
  page: { alignSelf: 'center', maxWidth: 960, paddingHorizontal: 18, paddingTop: 28, width: '100%' },
  pageHeading: { alignItems: 'center', flexDirection: 'row', gap: 16, justifyContent: 'space-between' },
  headingCopy: { flex: 1 },
  title: { fontSize: 27, fontWeight: '800', letterSpacing: -0.7 },
  subtitle: { fontSize: 11, lineHeight: 18, marginTop: 6, maxWidth: 580 },
  totalBadge: { alignItems: 'center', borderRadius: 15, flexDirection: 'row', gap: 6, paddingHorizontal: 12, paddingVertical: 10 },
  totalNumber: { fontSize: 17, fontVariant: ['tabular-nums'], fontWeight: '800' },
  totalLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  filterRow: { gap: 8, paddingVertical: 22 },
  filterChip: { borderRadius: 18, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 9 },
  filterText: { fontSize: 10, fontWeight: '700' },
  resultsRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  resultsText: { fontSize: 9, fontWeight: '600' },
  demoLabel: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  projectList: { gap: 12, paddingTop: 12 },
  emptyState: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 20, borderWidth: 1, padding: 38 },
  emptyTitle: { fontSize: 14, fontWeight: '800', marginTop: 12 },
  emptyBody: { fontSize: 10, lineHeight: 16, marginTop: 5, textAlign: 'center' },
  resetText: { fontSize: 10, fontWeight: '800', marginTop: 15 },
});
