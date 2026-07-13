import { Ionicons } from '@expo/vector-icons';
import { type Href, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import { PortalPageHeader } from '@/components/portal-page-header';
import {
  researchCalls,
  type PortalRole,
  type ResearchCallStatus,
} from '@/constants/portal-content';

type CallFilter = 'All' | ResearchCallStatus;

function getRole(value: string | string[] | undefined): PortalRole {
  return value === 'research-head' ? 'research-head' : 'faculty';
}

function getCallTone(status: ResearchCallStatus, isDark: boolean) {
  if (status === 'Closing Soon') {
    return {
      background: isDark ? '#432510' : '#FFF0D8',
      color: isDark ? '#FFB257' : '#A95800',
      icon: 'time-outline' as const,
    };
  }

  if (status === 'Upcoming') {
    return {
      background: isDark ? '#142C61' : '#E5EEFF',
      color: isDark ? '#79AEFF' : '#2166D1',
      icon: 'hourglass-outline' as const,
    };
  }

  return {
    background: isDark ? '#0D362B' : '#DCF5E6',
    color: isDark ? '#62E6A0' : '#177441',
    icon: 'radio-button-on-outline' as const,
  };
}

export default function ResearchCallsScreen() {
  const params = useLocalSearchParams<{ role?: string | string[] }>();
  const role = getRole(params.role);
  const { colors, isDark } = useAppTheme();
  const [filter, setFilter] = useState<CallFilter>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const fallbackHref = (role === 'research-head' ? '/research-head' : '/faculty') as Href;
  const filters: CallFilter[] = ['All', 'Open', 'Closing Soon', 'Upcoming'];
  const visibleCalls = useMemo(
    () => (filter === 'All' ? researchCalls : researchCalls.filter((call) => call.status === filter)),
    [filter],
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <PortalPageHeader eyebrow="RESEARCH OPPORTUNITIES" fallbackHref={fallbackHref} title="Research Calls" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <Animated.View
            entering={FadeInDown.duration(320).reduceMotion(ReduceMotion.System)}
            style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.heroIcon, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="megaphone-outline" size={27} color={colors.primary} />
            </View>
            <View style={styles.heroCopy}>
              <Text selectable style={[styles.pageTitle, { color: colors.text }]}>Funding and research opportunities</Text>
              <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>
                Browse active institutional calls on mobile. Proposal preparation and submission remain in the web portal.
              </Text>
            </View>
          </Animated.View>

          <ScrollView
            contentContainerStyle={styles.filterRow}
            horizontal
            showsHorizontalScrollIndicator={false}>
            {filters.map((item) => {
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

          <View style={styles.resultsRow}>
            <Text style={[styles.resultsText, { color: colors.textMuted }]}>{visibleCalls.length} opportunities</Text>
            <Text style={[styles.resultsText, { color: colors.textMuted }]}>Updated July 13, 2026</Text>
          </View>

          <View style={styles.callList}>
            {visibleCalls.map((call, index) => {
              const tone = getCallTone(call.status, isDark);
              const expanded = expandedId === call.id;
              return (
                <Animated.View
                  entering={FadeInDown.delay(index * 50).duration(310).reduceMotion(ReduceMotion.System)}
                  key={call.id}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded }}
                    onPress={() => setExpandedId(expanded ? null : call.id)}
                    style={({ pressed }) => [
                      styles.callCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: expanded ? colors.primary : colors.border,
                        opacity: pressed ? 0.76 : 1,
                      },
                    ]}>
                    <View style={styles.callTopRow}>
                      <View style={[styles.callIcon, { backgroundColor: tone.background }]}>
                        <Ionicons name={tone.icon} size={21} color={tone.color} />
                      </View>
                      <View style={styles.callHeading}>
                        <Text selectable style={[styles.callId, { color: colors.primary }]}>{call.id}</Text>
                        <Text selectable style={[styles.callTitle, { color: colors.text }]}>{call.title}</Text>
                        <Text style={[styles.sponsor, { color: colors.textMuted }]}>{call.sponsor}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: tone.background }]}>
                        <Text style={[styles.statusText, { color: tone.color }]}>{call.status}</Text>
                      </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.callMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                        <View>
                          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>DEADLINE</Text>
                          <Text selectable style={[styles.metaValue, { color: colors.text }]}>{call.deadline}</Text>
                        </View>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="wallet-outline" size={16} color={colors.primary} />
                        <View>
                          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>SUPPORT</Text>
                          <Text selectable style={[styles.metaValue, { color: colors.text }]}>{call.budget}</Text>
                        </View>
                      </View>
                      <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
                    </View>

                    {expanded && (
                      <View style={[styles.expandedContent, { borderColor: colors.border }]}>
                        <Text style={[styles.detailLabel, { color: colors.primary }]}>{call.category.toUpperCase()}</Text>
                        <Text selectable style={[styles.description, { color: colors.text }]}>{call.description}</Text>
                        <Text style={[styles.detailHeading, { color: colors.text }]}>Eligibility</Text>
                        <Text selectable style={[styles.eligibility, { color: colors.textMuted }]}>{call.eligibility}</Text>
                        <View style={[styles.webNote, { backgroundColor: colors.surfaceMuted }]}>
                          <Ionicons name="desktop-outline" size={17} color={colors.primary} />
                          <Text style={[styles.webNoteText, { color: colors.textMuted }]}>Use the ATHENA web portal to prepare and submit an application.</Text>
                        </View>
                      </View>
                    )}
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
  page: { alignSelf: 'center', maxWidth: 920, paddingHorizontal: 18, paddingTop: 26, width: '100%' },
  hero: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 21, borderWidth: 1, flexDirection: 'row', gap: 15, padding: 20 },
  heroIcon: { alignItems: 'center', borderRadius: 16, height: 56, justifyContent: 'center', width: 56 },
  heroCopy: { flex: 1 },
  pageTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 10, lineHeight: 17, marginTop: 5, maxWidth: 650 },
  filterRow: { gap: 8, paddingVertical: 21 },
  filterChip: { borderRadius: 18, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 9 },
  filterText: { fontSize: 10, fontWeight: '800' },
  resultsRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  resultsText: { fontSize: 9, fontWeight: '700' },
  callList: { gap: 12, paddingTop: 12 },
  callCard: { borderCurve: 'continuous', borderRadius: 20, borderWidth: 1, padding: 17 },
  callTopRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 12 },
  callIcon: { alignItems: 'center', borderRadius: 13, height: 46, justifyContent: 'center', width: 46 },
  callHeading: { flex: 1 },
  callId: { fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },
  callTitle: { fontSize: 14, fontWeight: '800', lineHeight: 20, marginTop: 3 },
  sponsor: { fontSize: 9, marginTop: 3 },
  statusBadge: { borderRadius: 13, paddingHorizontal: 9, paddingVertical: 7 },
  statusText: { fontSize: 8, fontWeight: '900' },
  divider: { height: 1, marginVertical: 15 },
  callMeta: { alignItems: 'center', flexDirection: 'row', gap: 20 },
  metaItem: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 8 },
  metaLabel: { fontSize: 7, fontWeight: '900', letterSpacing: 0.7 },
  metaValue: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  expandedContent: { borderTopWidth: 1, marginTop: 16, paddingTop: 16 },
  detailLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  description: { fontSize: 11, lineHeight: 18, marginTop: 8 },
  detailHeading: { fontSize: 11, fontWeight: '800', marginTop: 15 },
  eligibility: { fontSize: 10, lineHeight: 16, marginTop: 5 },
  webNote: { alignItems: 'center', borderRadius: 13, flexDirection: 'row', gap: 9, marginTop: 16, padding: 12 },
  webNoteText: { flex: 1, fontSize: 9, lineHeight: 14 },
});
