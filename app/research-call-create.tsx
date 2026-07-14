import { router, type Href } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import { useAuth } from '@/components/auth-provider';
import { PortalPageHeader } from '@/components/portal-page-header';
import { usePortalData } from '@/components/portal-data-provider';
import { ResearchCallForm } from '@/components/research-call-form';
import { type CreateResearchCallInput } from '@/constants/portal-content';

export default function CreateResearchCallScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const { createResearchCall } = usePortalData();

  const submit = async (input: CreateResearchCallInput) => {
    if (user?.role !== 'research_head' && user?.role !== 'admin') {
      throw new Error('Only the Research Head can create a research call.');
    }

    await createResearchCall(input);
    router.replace('/research-calls?role=research-head' as Href);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <PortalPageHeader eyebrow="RESEARCH OFFICE" fallbackHref="/research-calls?role=research-head" title="Create Research Call" />
      <ResearchCallForm
        mode="create"
        onCancel={() => router.back()}
        onSubmit={submit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safeArea: { flex: 1 } });
