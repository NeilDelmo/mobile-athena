import { Ionicons } from '@expo/vector-icons';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import { usePortalData } from '@/components/portal-data-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { getFacultyStatusLabel, type ProposalStatus } from '@/constants/research-proposals';

function getStatusTone(status: ProposalStatus, isDark: boolean) {
  if (status === 'Approved') {
    return { background: isDark ? '#0D362B' : '#DCF5E6', color: isDark ? '#62E6A0' : '#177441', icon: 'checkmark-circle' as const };
  }

  if (status === 'For Revision') {
    return { background: isDark ? '#432510' : '#FFF0D8', color: isDark ? '#FFB257' : '#A95800', icon: 'alert-circle' as const };
  }

  if (status === 'Rejected') {
    return { background: isDark ? '#421C25' : '#FBE3E7', color: isDark ? '#FF8597' : '#A82236', icon: 'close-circle' as const };
  }

  return { background: isDark ? '#142C61' : '#E5EEFF', color: isDark ? '#79AEFF' : '#2166D1', icon: 'time' as const };
}

export default function FacultyProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { projects } = usePortalData();
  const { colors, isDark } = useAppTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 820;
  const project = projects.find((item) => item.id === id);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/faculty-projects' as Href);
    }
  };

  if (!project) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.notFound}>
          <Ionicons name="search-outline" size={34} color={colors.primary} />
          <Text selectable style={[styles.notFoundTitle, { color: colors.text }]}>Project not found</Text>
          <Text style={[styles.notFoundBody, { color: colors.textMuted }]}>This project may no longer be available.</Text>
          <Pressable onPress={() => router.replace('/faculty-projects' as Href)}>
            <Text style={[styles.notFoundLink, { color: colors.primary }]}>Return to My Projects</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const tone = getStatusTone(project.status, isDark);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.headerInner}>
          <View style={styles.headerLeft}>
            <Pressable
              accessibilityLabel="Go back"
              onPress={goBack}
              style={({ pressed }) => [styles.backButton, { backgroundColor: colors.surfaceMuted, opacity: pressed ? 0.62 : 1 }]}>
              <Ionicons name="arrow-back" size={21} color={colors.text} />
            </Pressable>
            <View style={styles.headerCopy}>
              <Text style={[styles.headerEyebrow, { color: colors.primary }]}>PROJECT MONITORING</Text>
              <Text numberOfLines={1} style={[styles.headerTitle, { color: colors.text }]}>{project.id}</Text>
            </View>
          </View>
          <ThemeToggle />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <Animated.View
            entering={FadeInDown.duration(340).reduceMotion(ReduceMotion.System)}
            style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.heroTopRow}>
              <View style={[styles.statusBadge, { backgroundColor: tone.background }]}>
                <Ionicons name={tone.icon} size={14} color={tone.color} />
                <Text style={[styles.statusText, { color: tone.color }]}>{getFacultyStatusLabel(project.status)}</Text>
              </View>
              <View style={[styles.demoBadge, { backgroundColor: colors.surfaceMuted }]}>
                <Ionicons name="server-outline" size={13} color={colors.textMuted} />
                <Text style={[styles.demoText, { color: colors.textMuted }]}>DATABASE</Text>
              </View>
            </View>
            <Text selectable style={[styles.projectId, { color: colors.primary }]}>{project.id}</Text>
            <Text selectable style={[styles.projectTitle, { color: colors.text }]}>{project.title}</Text>
            <Text style={[styles.category, { color: colors.textMuted }]}>{project.category}</Text>

            <View style={styles.progressHeading}>
              <Text style={[styles.progressLabel, { color: colors.textMuted }]}>Approval progress</Text>
              <Text selectable style={[styles.progressValue, { color: colors.text }]}>{project.progress}%</Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.surfaceMuted }]}>
              <View style={[styles.progressFill, { backgroundColor: tone.color, width: `${project.progress}%` }]} />
            </View>
          </Animated.View>

          <View style={[styles.contentColumns, isWide && styles.contentColumnsWide]}>
            <View style={styles.mainColumn}>
              <Animated.View
                entering={FadeInDown.delay(70).duration(330).reduceMotion(ReduceMotion.System)}
                style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.sectionHeading}>
                  <View style={[styles.sectionIcon, { backgroundColor: tone.background }]}>
                    <Ionicons name="navigate-circle-outline" size={20} color={tone.color} />
                  </View>
                  <View style={styles.sectionHeadingCopy}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Next action</Text>
                    <Text style={[styles.sectionEyebrow, { color: tone.color }]}>{getFacultyStatusLabel(project.status).toUpperCase()}</Text>
                  </View>
                </View>
                <Text selectable style={[styles.actionText, { color: colors.text }]}>{project.nextAction}</Text>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(120).duration(330).reduceMotion(ReduceMotion.System)}
                style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.sectionHeading}>
                  <View style={[styles.sectionIcon, { backgroundColor: colors.primarySoft }]}>
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.sectionHeadingCopy}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Latest feedback</Text>
                    <Text style={[styles.sectionEyebrow, { color: colors.textMuted }]}>UPDATED {project.lastUpdated.toUpperCase()}</Text>
                  </View>
                </View>
                <Text selectable style={[styles.feedbackText, { color: colors.textMuted }]}>{project.latestFeedback}</Text>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(170).duration(330).reduceMotion(ReduceMotion.System)}
                style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Approval timeline</Text>
                <View style={styles.timeline}>
                  {project.timeline.map((item, index) => {
                    const itemColor = item.state === 'upcoming' ? colors.textMuted : item.state === 'current' ? tone.color : colors.primary;
                    return (
                      <View key={item.id} style={styles.timelineItem}>
                        <View style={styles.timelineRail}>
                          <View style={[styles.timelineDot, { backgroundColor: itemColor, borderColor: colors.surface }]} />
                          {index < project.timeline.length - 1 && (
                            <View style={[styles.timelineLine, { backgroundColor: item.state === 'complete' ? colors.primary : colors.border }]} />
                          )}
                        </View>
                        <View style={styles.timelineCopy}>
                          <View style={styles.timelineTitleRow}>
                            <Text selectable style={[styles.timelineTitle, { color: colors.text }]}>{item.title}</Text>
                            <Text style={[styles.timelineDate, { color: itemColor }]}>{item.date}</Text>
                          </View>
                          <Text style={[styles.timelineDescription, { color: colors.textMuted }]}>{item.description}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </Animated.View>
            </View>

            <View style={styles.sideColumn}>
              <Animated.View
                entering={FadeInDown.delay(90).duration(330).reduceMotion(ReduceMotion.System)}
                style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Proposal overview</Text>
                <View style={styles.detailList}>
                  {[
                    ['calendar-outline', 'Submitted', project.submittedDate],
                    ['time-outline', 'Duration', project.duration],
                    ['wallet-outline', 'Requested budget', project.budget],
                    ['business-outline', 'Department', project.department],
                  ].map(([icon, label, value]) => (
                    <View key={label} style={styles.detailRow}>
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

              <Animated.View
                entering={FadeInDown.delay(145).duration(330).reduceMotion(ReduceMotion.System)}
                style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Research summary</Text>
                <Text selectable style={[styles.abstractText, { color: colors.textMuted }]}>{project.abstract}</Text>
              </Animated.View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { borderBottomWidth: 1 },
  headerInner: { alignItems: 'center', alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between', maxWidth: 1040, minHeight: 68, paddingHorizontal: 18, paddingVertical: 10, width: '100%' },
  headerLeft: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 11 },
  backButton: { alignItems: 'center', borderRadius: 13, height: 42, justifyContent: 'center', width: 42 },
  headerCopy: { flex: 1 },
  headerEyebrow: { fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  headerTitle: { fontSize: 16, fontWeight: '800', marginTop: 2 },
  scrollContent: { paddingBottom: 42 },
  page: { alignSelf: 'center', maxWidth: 1040, paddingHorizontal: 18, paddingTop: 26, width: '100%' },
  heroCard: { borderCurve: 'continuous', borderRadius: 22, borderWidth: 1, padding: 22 },
  heroTopRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  statusBadge: { alignItems: 'center', borderRadius: 14, flexDirection: 'row', gap: 6, paddingHorizontal: 10, paddingVertical: 7 },
  statusText: { fontSize: 9, fontWeight: '800' },
  demoBadge: { alignItems: 'center', borderRadius: 12, flexDirection: 'row', gap: 5, paddingHorizontal: 8, paddingVertical: 6 },
  demoText: { fontSize: 7, fontWeight: '900', letterSpacing: 0.7 },
  projectId: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8, marginTop: 20 },
  projectTitle: { fontSize: 27, fontWeight: '800', letterSpacing: -0.7, lineHeight: 34, marginTop: 6 },
  category: { fontSize: 11, marginTop: 7 },
  progressHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 23 },
  progressLabel: { fontSize: 10, fontWeight: '700' },
  progressValue: { fontSize: 12, fontVariant: ['tabular-nums'], fontWeight: '800' },
  progressTrack: { borderRadius: 5, height: 9, marginTop: 8, overflow: 'hidden' },
  progressFill: { borderRadius: 5, height: 9 },
  contentColumns: { gap: 13, paddingTop: 13 },
  contentColumnsWide: { alignItems: 'flex-start', flexDirection: 'row' },
  mainColumn: { flex: 1.6, gap: 13, width: '100%' },
  sideColumn: { flex: 1, gap: 13, width: '100%' },
  infoCard: { borderCurve: 'continuous', borderRadius: 19, borderWidth: 1, padding: 18 },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', gap: 11 },
  sectionIcon: { alignItems: 'center', borderRadius: 12, height: 42, justifyContent: 'center', width: 42 },
  sectionHeadingCopy: { flex: 1 },
  sectionTitle: { fontSize: 14, fontWeight: '800' },
  sectionEyebrow: { fontSize: 7, fontWeight: '900', letterSpacing: 0.75, marginTop: 3 },
  actionText: { fontSize: 11, lineHeight: 18, marginTop: 15 },
  feedbackText: { fontSize: 11, lineHeight: 18, marginTop: 15 },
  timeline: { gap: 0, paddingTop: 18 },
  timelineItem: { flexDirection: 'row', gap: 12, minHeight: 76 },
  timelineRail: { alignItems: 'center', width: 18 },
  timelineDot: { borderRadius: 7, borderWidth: 3, height: 14, width: 14 },
  timelineLine: { flex: 1, marginVertical: 3, width: 2 },
  timelineCopy: { flex: 1, paddingBottom: 18 },
  timelineTitleRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  timelineTitle: { flex: 1, fontSize: 11, fontWeight: '800' },
  timelineDate: { fontSize: 8, fontWeight: '700' },
  timelineDescription: { fontSize: 9, lineHeight: 14, marginTop: 5 },
  detailList: { gap: 15, paddingTop: 17 },
  detailRow: { alignItems: 'center', flexDirection: 'row', gap: 11 },
  detailIcon: { alignItems: 'center', borderRadius: 11, height: 38, justifyContent: 'center', width: 38 },
  detailCopy: { flex: 1 },
  detailLabel: { fontSize: 8, fontWeight: '700' },
  detailValue: { fontSize: 10, fontWeight: '700', lineHeight: 15, marginTop: 3 },
  abstractText: { fontSize: 10, lineHeight: 17, paddingTop: 13 },
  notFound: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 28 },
  notFoundTitle: { fontSize: 20, fontWeight: '800', marginTop: 14 },
  notFoundBody: { fontSize: 11, marginTop: 7, textAlign: 'center' },
  notFoundLink: { fontSize: 11, fontWeight: '800', marginTop: 18 },
});
