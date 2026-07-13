import { Ionicons } from '@expo/vector-icons';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import { useDemoProjects } from '@/components/demo-projects-provider';
import { PortalPageHeader } from '@/components/portal-page-header';
import { type PortalRole } from '@/constants/portal-content';
import { type ProjectTimelineItem, type ResearchProposal } from '@/constants/research-proposals';

type ActivityFilter = 'All' | 'Decisions' | 'Submissions';

type ActivityItem = ProjectTimelineItem & {
  projectId: string;
  projectTitle: string;
  sortValue: number;
};

function getRole(value: string | string[] | undefined): PortalRole {
  return value === 'research-head' ? 'research-head' : 'faculty';
}

function getSortValue(date: string, project: ResearchProposal) {
  if (['Recorded today', 'In progress', 'Action required'].includes(date)) {
    return new Date('2026-07-13T23:59:00+08:00').getTime();
  }

  const parsed = Date.parse(date);
  return Number.isNaN(parsed) ? Date.parse(project.lastUpdated) : parsed;
}

function matchesFilter(item: ActivityItem, filter: ActivityFilter) {
  if (filter === 'Submissions') {
    return item.title.toLowerCase().includes('submitted');
  }

  if (filter === 'Decisions') {
    const title = item.title.toLowerCase();
    return ['approved', 'rejected', 'revision', 'evaluation completed'].some((keyword) => title.includes(keyword));
  }

  return true;
}

export default function ActivityScreen() {
  const params = useLocalSearchParams<{ role?: string | string[] }>();
  const role = getRole(params.role);
  const { colors } = useAppTheme();
  const { projects } = useDemoProjects();
  const [filter, setFilter] = useState<ActivityFilter>('All');
  const fallbackHref = (role === 'research-head' ? '/research-head' : '/faculty') as Href;

  const activity = useMemo(
    () =>
      projects
        .flatMap((project) =>
          project.timeline
            .filter((item) => item.state !== 'upcoming')
            .map((item) => ({
              ...item,
              projectId: project.id,
              projectTitle: project.title,
              sortValue: getSortValue(item.date, project),
            })),
        )
        .filter((item) => matchesFilter(item, filter))
        .sort((a, b) => b.sortValue - a.sortValue),
    [filter, projects],
  );

  const openProject = (projectId: string) => {
    if (role === 'faculty') {
      router.push(`/faculty-project/${encodeURIComponent(projectId)}` as Href);
      return;
    }

    router.push('/research-head' as Href);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <PortalPageHeader eyebrow="PROJECT HISTORY" fallbackHref={fallbackHref} title="Activity Timeline" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <Animated.View
            entering={FadeInDown.duration(320).reduceMotion(ReduceMotion.System)}
            style={styles.pageHeading}>
            <View style={styles.headingCopy}>
              <Text selectable style={[styles.pageTitle, { color: colors.text }]}>Research activity</Text>
              <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>
                A consolidated history of proposal submissions, evaluations, revision requests, and decisions.
              </Text>
            </View>
            <View style={[styles.totalBadge, { backgroundColor: colors.primarySoft }]}>
              <Text selectable style={[styles.totalNumber, { color: colors.primary }]}>{activity.length}</Text>
              <Text style={[styles.totalLabel, { color: colors.primary }]}>EVENTS</Text>
            </View>
          </Animated.View>

          <ScrollView
            contentContainerStyle={styles.filterRow}
            horizontal
            showsHorizontalScrollIndicator={false}>
            {(['All', 'Decisions', 'Submissions'] as ActivityFilter[]).map((item) => {
              const selected = filter === item;
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
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}>
                  <Text style={[styles.filterText, { color: selected ? '#FFFFFF' : colors.text }]}>{item}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={[styles.timelineCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {activity.map((item, index) => {
              const isCurrent = item.state === 'current';
              const dotColor = isCurrent ? colors.primary : colors.textMuted;
              return (
                <Animated.View
                  entering={FadeInDown.delay(index * 35).duration(280).reduceMotion(ReduceMotion.System)}
                  key={`${item.projectId}-${item.id}`}
                  style={styles.timelineItem}>
                  <View style={styles.timelineRail}>
                    <View style={[styles.timelineDot, { backgroundColor: dotColor, borderColor: colors.surface }]} />
                    {index < activity.length - 1 && <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />}
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => openProject(item.projectId)}
                    style={({ pressed }) => [styles.activityContent, { opacity: pressed ? 0.65 : 1 }]}>
                    <View style={styles.activityTopRow}>
                      <View style={styles.activityHeading}>
                        <Text selectable style={[styles.activityTitle, { color: colors.text }]}>{item.title}</Text>
                        <Text selectable style={[styles.projectTitle, { color: colors.primary }]}>{item.projectTitle}</Text>
                      </View>
                      <Text style={[styles.date, { color: isCurrent ? colors.primary : colors.textMuted }]}>{item.date}</Text>
                    </View>
                    <Text selectable style={[styles.description, { color: colors.textMuted }]}>{item.description}</Text>
                    <View style={styles.projectLink}>
                      <Text selectable style={[styles.projectId, { color: colors.textMuted }]}>{item.projectId}</Text>
                      <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 42 },
  page: { alignSelf: 'center', maxWidth: 900, paddingHorizontal: 18, paddingTop: 28, width: '100%' },
  pageHeading: { alignItems: 'center', flexDirection: 'row', gap: 16, justifyContent: 'space-between' },
  headingCopy: { flex: 1 },
  pageTitle: { fontSize: 27, fontWeight: '800', letterSpacing: -0.7 },
  pageSubtitle: { fontSize: 11, lineHeight: 18, marginTop: 6, maxWidth: 620 },
  totalBadge: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 15, minWidth: 68, paddingHorizontal: 12, paddingVertical: 9 },
  totalNumber: { fontSize: 18, fontVariant: ['tabular-nums'], fontWeight: '800' },
  totalLabel: { fontSize: 7, fontWeight: '900', letterSpacing: 0.8, marginTop: 1 },
  filterRow: { gap: 8, paddingVertical: 22 },
  filterChip: { borderRadius: 18, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9 },
  filterText: { fontSize: 10, fontWeight: '800' },
  timelineCard: { borderCurve: 'continuous', borderRadius: 21, borderWidth: 1, padding: 18 },
  timelineItem: { flexDirection: 'row', gap: 12, minHeight: 116 },
  timelineRail: { alignItems: 'center', width: 18 },
  timelineDot: { borderRadius: 7, borderWidth: 3, height: 14, width: 14 },
  timelineLine: { flex: 1, marginVertical: 4, width: 2 },
  activityContent: { flex: 1, paddingBottom: 22 },
  activityTopRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  activityHeading: { flex: 1 },
  activityTitle: { fontSize: 13, fontWeight: '800' },
  projectTitle: { fontSize: 10, fontWeight: '700', lineHeight: 15, marginTop: 4 },
  date: { fontSize: 8, fontWeight: '800' },
  description: { fontSize: 10, lineHeight: 16, marginTop: 8 },
  projectLink: { alignItems: 'center', flexDirection: 'row', gap: 3, marginTop: 9 },
  projectId: { fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },
});
