import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import { useAuth } from '@/components/auth-provider';
import { PortalPageHeader } from '@/components/portal-page-header';
import { usePortalData } from '@/components/portal-data-provider';
import { type ResearchCallStatus } from '@/constants/portal-content';

type CallFilter = 'All' | ResearchCallStatus;

function getCallTone(status: ResearchCallStatus, isDark: boolean) {
  if (status === 'Draft' || status === 'Closed') {
    return {
      background: isDark ? '#302C2D' : '#EEE9EA',
      color: isDark ? '#C8BEC0' : '#65595B',
      icon: status === 'Draft' ? ('document-outline' as const) : ('lock-closed-outline' as const),
    };
  }
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
  const { user } = useAuth();
  const { researchCalls } = usePortalData();
  const role = user?.role === 'faculty' ? 'faculty' : 'research-head';
  const { colors, isDark } = useAppTheme();
  const [filter, setFilter] = useState<CallFilter>('All');
  const fallbackHref = (role === 'research-head' ? '/research-head' : '/faculty') as Href;
  const filters: CallFilter[] = role === 'research-head'
    ? ['All', 'Draft', 'Open', 'Closing Soon', 'Upcoming', 'Closed']
    : ['All', 'Open', 'Closing Soon', 'Upcoming', 'Closed'];
  const visibleCalls = useMemo(
    () => (filter === 'All' ? researchCalls : researchCalls.filter((call) => call.status === filter)),
    [filter, researchCalls],
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
                Browse institutional opportunities loaded from ATHENA. The Research Head can manage calls here.
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
            <View>
              <Text style={[styles.resultsText, { color: colors.textMuted }]}>{visibleCalls.length} opportunities</Text>
              <Text style={[styles.resultsText, { color: colors.textMuted }]}>Synced with the database</Text>
            </View>
            {role === 'research-head' && (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/research-call-create' as Href)}
                style={({ pressed }) => [styles.createButton, { backgroundColor: colors.primary, opacity: pressed ? 0.72 : 1 }]}>
                <Ionicons name="add" size={17} color="#FFFFFF" />
                <Text style={styles.createButtonText}>Create research call</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.callList}>
            {visibleCalls.map((call, index) => {
              const tone = getCallTone(call.status, isDark);
              return (
                <Animated.View
                  entering={FadeInDown.delay(index * 50).duration(310).reduceMotion(ReduceMotion.System)}
                  key={call.id}>
                  <Pressable
                    accessibilityLabel={`View ${call.id}: ${call.title}`}
                    accessibilityRole="button"
                    onPress={() => router.push(`/research-call/${call.databaseId}` as Href)}
                    style={({ pressed }) => [
                      styles.callCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
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
                      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
            {visibleCalls.length === 0 && (
              <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="megaphone-outline" size={28} color={colors.primary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No research calls in this view</Text>
                <Text style={[styles.emptyBody, { color: colors.textMuted }]}>Try another status filter or create a new call.</Text>
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
  createButton: { alignItems: 'center', borderRadius: 14, flexDirection: 'row', gap: 7, paddingHorizontal: 13, paddingVertical: 10 },
  createButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
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
  emptyState: { alignItems: 'center', borderRadius: 18, borderWidth: 1, padding: 30 },
  emptyTitle: { fontSize: 13, fontWeight: '800', marginTop: 10 },
  emptyBody: { fontSize: 9, marginTop: 5, textAlign: 'center' },
});
