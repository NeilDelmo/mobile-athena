import { Ionicons } from '@expo/vector-icons';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import { useAuth } from '@/components/auth-provider';
import { PortalPageHeader } from '@/components/portal-page-header';
import { usePortalData } from '@/components/portal-data-provider';
import { ResearchCallForm } from '@/components/research-call-form';
import { type CreateResearchCallInput, type ResearchCallContentInput } from '@/constants/portal-content';

export default function EditResearchCallScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const databaseId = Number(id);
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const { isLoading, researchCalls, updateResearchCall } = usePortalData();
  const researchCall = researchCalls.find((call) => call.databaseId === databaseId);
  const fallbackHref = `/research-call/${databaseId}` as Href;

  if (isLoading && !researchCall) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <PortalPageHeader eyebrow="RESEARCH OFFICE" fallbackHref={fallbackHref} title="Edit Research Call" />
        <View style={styles.centered}><ActivityIndicator color={colors.primary} /></View>
      </SafeAreaView>
    );
  }

  if (!researchCall) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <PortalPageHeader eyebrow="RESEARCH OFFICE" fallbackHref="/research-calls?role=research-head" title="Edit Research Call" />
        <View style={styles.centered}>
          <Ionicons name="search-outline" size={32} color={colors.primary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Research call not found</Text>
          <Text style={[styles.emptyBody, { color: colors.textMuted }]}>The call may have been removed or is unavailable.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const initialValue: CreateResearchCallInput = {
    title: researchCall.title,
    sponsor: researchCall.sponsor,
    description: researchCall.description,
    budget: researchCall.budget === 'See call details' ? '' : researchCall.budget,
    category: researchCall.category,
    eligibility: researchCall.eligibility,
    opensAt: researchCall.opensAt,
    closesAt: researchCall.closesAt,
    status: researchCall.databaseStatus === 'open' ? 'open' : 'draft',
  };

  const submit = async (input: CreateResearchCallInput) => {
    if (user?.role !== 'research_head' && user?.role !== 'admin') {
      throw new Error('Only the Research Head can edit a research call.');
    }

    const content: ResearchCallContentInput = {
      title: input.title,
      sponsor: input.sponsor,
      description: input.description,
      budget: input.budget,
      category: input.category,
      eligibility: input.eligibility,
      opensAt: input.opensAt,
      closesAt: input.closesAt,
    };
    await updateResearchCall(databaseId, content);
    router.replace(`/research-call/${databaseId}` as Href);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <PortalPageHeader eyebrow="RESEARCH OFFICE" fallbackHref={fallbackHref} title="Edit Research Call" />
      <ResearchCallForm
        initialValue={initialValue}
        mode="edit"
        onCancel={() => router.back()}
        onSubmit={submit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  centered: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 28 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginTop: 12 },
  emptyBody: { fontSize: 10, marginTop: 6, textAlign: 'center' },
});
