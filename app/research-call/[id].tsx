import { Ionicons } from '@expo/vector-icons';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
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
import { useAuth } from '@/components/auth-provider';
import { PortalPageHeader } from '@/components/portal-page-header';
import { usePortalData } from '@/components/portal-data-provider';
import { type ResearchCallStatus } from '@/constants/portal-content';

function getStatusTone(status: ResearchCallStatus, isDark: boolean) {
  if (status === 'Draft' || status === 'Closed') {
    return {
      background: isDark ? '#302C2D' : '#EEE9EA',
      color: isDark ? '#C8BEC0' : '#65595B',
      icon: status === 'Draft' ? ('document-outline' as const) : ('lock-closed-outline' as const),
    };
  }
  if (status === 'Closing Soon') {
    return { background: isDark ? '#432510' : '#FFF0D8', color: isDark ? '#FFB257' : '#A95800', icon: 'time-outline' as const };
  }
  if (status === 'Upcoming') {
    return { background: isDark ? '#142C61' : '#E5EEFF', color: isDark ? '#79AEFF' : '#2166D1', icon: 'hourglass-outline' as const };
  }
  return { background: isDark ? '#0D362B' : '#DCF5E6', color: isDark ? '#62E6A0' : '#177441', icon: 'radio-button-on-outline' as const };
}

function formatDate(value: string, fallback: string) {
  if (!value) return fallback;
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat('en-PH', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently updated';
  return `Updated ${new Intl.DateTimeFormat('en-PH', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)}`;
}

export default function ResearchCallDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const databaseId = Number(id);
  const { colors, isDark } = useAppTheme();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const { changeResearchCallStatus, isLoading, researchCalls } = usePortalData();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const researchCall = researchCalls.find((call) => call.databaseId === databaseId);
  const isWide = width >= 780;
  const isResearchHead = user?.role === 'research_head' || user?.role === 'admin';
  const fallbackHref = (isResearchHead ? '/research-calls?role=research-head' : '/research-calls?role=faculty') as Href;

  if (isLoading && !researchCall) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <PortalPageHeader eyebrow="RESEARCH OPPORTUNITY" fallbackHref={fallbackHref} title="Research Call" />
        <View style={styles.centered}><ActivityIndicator color={colors.primary} /></View>
      </SafeAreaView>
    );
  }

  if (!researchCall) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <PortalPageHeader eyebrow="RESEARCH OPPORTUNITY" fallbackHref={fallbackHref} title="Research Call" />
        <View style={styles.centered}>
          <Ionicons name="search-outline" size={34} color={colors.primary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Research call not found</Text>
          <Text style={[styles.emptyBody, { color: colors.textMuted }]}>This call may be unavailable or no longer visible to your account.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const tone = getStatusTone(researchCall.status, isDark);
  const nextStatus = researchCall.databaseStatus === 'open' ? 'closed' : 'open';
  const lifecycleLabel = researchCall.databaseStatus === 'draft'
    ? 'Publish call'
    : researchCall.databaseStatus === 'closed'
      ? 'Reopen call'
      : 'Close call';

  const changeStatus = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      await changeResearchCallStatus(researchCall.databaseId, nextStatus);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update the research call.');
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmStatusChange = () => {
    const message = researchCall.databaseStatus === 'draft'
      ? 'Faculty accounts will be able to see this call and will receive a notification.'
      : researchCall.databaseStatus === 'closed'
        ? 'Faculty accounts will be able to access this call again and will receive a notification.'
        : 'Faculty will still see the call, but it will be marked closed.';
    Alert.alert(lifecycleLabel, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: lifecycleLabel, style: nextStatus === 'closed' ? 'destructive' : 'default', onPress: () => void changeStatus() },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <PortalPageHeader eyebrow="RESEARCH OPPORTUNITY" fallbackHref={fallbackHref} title={researchCall.id} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <Animated.View
            entering={FadeInDown.duration(320).reduceMotion(ReduceMotion.System)}
            style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.heroTop}>
              <View style={[styles.statusBadge, { backgroundColor: tone.background }]}>
                <Ionicons name={tone.icon} size={15} color={tone.color} />
                <Text style={[styles.statusText, { color: tone.color }]}>{researchCall.status}</Text>
              </View>
              <Text style={[styles.updatedText, { color: colors.textMuted }]}>{formatUpdatedAt(researchCall.updatedAt)}</Text>
            </View>
            <Text selectable style={[styles.callId, { color: colors.primary }]}>{researchCall.id}</Text>
            <Text selectable style={[styles.title, { color: colors.text }]}>{researchCall.title}</Text>
            <Text selectable style={[styles.sponsor, { color: colors.textMuted }]}>{researchCall.sponsor}</Text>

            {isResearchHead && (
              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  disabled={isUpdating}
                  onPress={() => router.push(`/research-call-edit/${researchCall.databaseId}` as Href)}
                  style={({ pressed }) => [styles.secondaryAction, { borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}>
                  <Ionicons name="create-outline" size={17} color={colors.text} />
                  <Text style={[styles.secondaryActionText, { color: colors.text }]}>Edit details</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={isUpdating}
                  onPress={confirmStatusChange}
                  style={({ pressed }) => [styles.primaryAction, { backgroundColor: colors.primary, opacity: pressed || isUpdating ? 0.7 : 1 }]}>
                  {isUpdating ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name={nextStatus === 'closed' ? 'lock-closed-outline' : 'radio-button-on-outline'} size={17} color="#FFFFFF" />}
                  <Text style={styles.primaryActionText}>{lifecycleLabel}</Text>
                </Pressable>
              </View>
            )}

            {error && (
              <View style={[styles.errorBox, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.primary} />
                <Text selectable style={[styles.errorText, { color: colors.primary }]}>{error}</Text>
              </View>
            )}
          </Animated.View>

          <View style={[styles.columns, isWide && styles.columnsWide]}>
            <View style={styles.mainColumn}>
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.sectionHeading}>
                  <View style={[styles.sectionIcon, { backgroundColor: colors.primarySoft }]}>
                    <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>About this call</Text>
                </View>
                <Text selectable style={[styles.bodyText, { color: colors.textMuted }]}>{researchCall.description}</Text>
              </View>

              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.sectionHeading}>
                  <View style={[styles.sectionIcon, { backgroundColor: colors.primarySoft }]}>
                    <Ionicons name="people-outline" size={20} color={colors.primary} />
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Eligibility</Text>
                </View>
                <Text selectable style={[styles.bodyText, { color: colors.textMuted }]}>{researchCall.eligibility}</Text>
              </View>
            </View>

            <View style={[styles.card, styles.sideCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Call information</Text>
              <View style={styles.infoList}>
                {[
                  ['pricetag-outline', 'Category', researchCall.category],
                  ['wallet-outline', 'Funding or support', researchCall.budget],
                  ['calendar-outline', 'Opening date', formatDate(researchCall.opensAt, 'Available immediately')],
                  ['flag-outline', 'Closing date', formatDate(researchCall.closesAt, 'No deadline')],
                ].map(([icon, label, value]) => (
                  <View key={label} style={[styles.infoRow, { borderColor: colors.border }]}>
                    <View style={[styles.infoIcon, { backgroundColor: colors.surfaceMuted }]}>
                      <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={17} color={colors.primary} />
                    </View>
                    <View style={styles.infoCopy}>
                      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
                      <Text selectable style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
                    </View>
                  </View>
                ))}
              </View>
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
  page: { alignSelf: 'center', maxWidth: 980, paddingHorizontal: 18, paddingTop: 24, width: '100%' },
  hero: { borderCurve: 'continuous', borderRadius: 22, borderWidth: 1, padding: 22 },
  heroTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  statusBadge: { alignItems: 'center', borderRadius: 14, flexDirection: 'row', gap: 6, paddingHorizontal: 10, paddingVertical: 7 },
  statusText: { fontSize: 9, fontWeight: '900' },
  updatedText: { fontSize: 8, fontWeight: '700' },
  callId: { fontSize: 9, fontWeight: '900', letterSpacing: 0.8, marginTop: 19 },
  title: { fontSize: 27, fontWeight: '800', letterSpacing: -0.7, lineHeight: 34, marginTop: 6 },
  sponsor: { fontSize: 11, marginTop: 7 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 22 },
  secondaryAction: { alignItems: 'center', borderRadius: 13, borderWidth: 1, flexDirection: 'row', gap: 7, minHeight: 48, paddingHorizontal: 16 },
  secondaryActionText: { fontSize: 10, fontWeight: '800' },
  primaryAction: { alignItems: 'center', borderRadius: 13, flexDirection: 'row', gap: 7, justifyContent: 'center', minHeight: 48, minWidth: 145, paddingHorizontal: 16 },
  primaryActionText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  errorBox: { alignItems: 'flex-start', borderRadius: 12, flexDirection: 'row', gap: 8, marginTop: 14, padding: 12 },
  errorText: { flex: 1, fontSize: 10, fontWeight: '700', lineHeight: 15 },
  columns: { gap: 13, paddingTop: 13 },
  columnsWide: { alignItems: 'flex-start', flexDirection: 'row' },
  mainColumn: { flex: 1.55, gap: 13, width: '100%' },
  card: { borderCurve: 'continuous', borderRadius: 20, borderWidth: 1, padding: 19 },
  sideCard: { flex: 1, width: '100%' },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  sectionIcon: { alignItems: 'center', borderRadius: 12, height: 40, justifyContent: 'center', width: 40 },
  sectionTitle: { fontSize: 14, fontWeight: '800' },
  bodyText: { fontSize: 11, lineHeight: 19, marginTop: 15 },
  infoList: { paddingTop: 10 },
  infoRow: { alignItems: 'center', borderBottomWidth: 1, flexDirection: 'row', gap: 10, paddingVertical: 11 },
  infoIcon: { alignItems: 'center', borderRadius: 11, height: 38, justifyContent: 'center', width: 38 },
  infoCopy: { flex: 1 },
  infoLabel: { fontSize: 8, fontWeight: '700' },
  infoValue: { fontSize: 10, fontWeight: '700', lineHeight: 15, marginTop: 3 },
  centered: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 28 },
  emptyTitle: { fontSize: 19, fontWeight: '800', marginTop: 13 },
  emptyBody: { fontSize: 10, lineHeight: 16, marginTop: 6, maxWidth: 360, textAlign: 'center' },
});
