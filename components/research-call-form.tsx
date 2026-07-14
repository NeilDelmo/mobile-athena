import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAppTheme } from '@/components/app-theme';
import { type CreateResearchCallInput } from '@/constants/portal-content';

type FormField = Exclude<keyof CreateResearchCallInput, 'status'>;

type ResearchCallFormProps = {
  initialValue?: CreateResearchCallInput;
  mode: 'create' | 'edit';
  onCancel: () => void;
  onSubmit: (input: CreateResearchCallInput) => Promise<void>;
};

const defaultValue: CreateResearchCallInput = {
  title: '',
  sponsor: 'BatStateU Research Office',
  description: '',
  budget: '',
  category: '',
  eligibility: 'BatStateU faculty researchers.',
  opensAt: '',
  closesAt: '',
  status: 'draft',
};

const fields: {
  key: FormField;
  label: string;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
  multiline?: boolean;
  required?: boolean;
}[] = [
  { key: 'title', label: 'Call title', placeholder: 'e.g. Sustainable Campus Research Grant', icon: 'megaphone-outline', required: true },
  { key: 'sponsor', label: 'Sponsor', placeholder: 'BatStateU Research Office', icon: 'business-outline' },
  { key: 'category', label: 'Research category', placeholder: 'e.g. Sustainability and Innovation', icon: 'pricetag-outline' },
  { key: 'budget', label: 'Funding or support', placeholder: 'e.g. Up to PHP 250,000', icon: 'wallet-outline' },
  { key: 'opensAt', label: 'Opening date', placeholder: 'YYYY-MM-DD', icon: 'calendar-outline' },
  { key: 'closesAt', label: 'Closing date', placeholder: 'YYYY-MM-DD', icon: 'calendar-outline' },
  { key: 'description', label: 'Description', placeholder: 'Describe the purpose, priorities, and expected outputs.', icon: 'document-text-outline', multiline: true, required: true },
  { key: 'eligibility', label: 'Eligibility', placeholder: 'Who may apply?', icon: 'people-outline', multiline: true },
];

export function ResearchCallForm({ initialValue = defaultValue, mode, onCancel, onSubmit }: ResearchCallFormProps) {
  const { colors } = useAppTheme();
  const [form, setForm] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formValid = useMemo(
    () => form.title.trim().length > 0 && form.description.trim().length > 0,
    [form.description, form.title],
  );

  const updateField = (key: FormField, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async () => {
    if (!formValid) {
      setError('Add a title and description before saving.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
        sponsor: form.sponsor.trim(),
        description: form.description.trim(),
        budget: form.budget.trim(),
        category: form.category.trim(),
        eligibility: form.eligibility.trim(),
        opensAt: form.opensAt.trim(),
        closesAt: form.closesAt.trim(),
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save the research call.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitLabel = mode === 'edit'
    ? 'Save changes'
    : form.status === 'open'
      ? 'Publish call'
      : 'Save draft';

  return (
    <KeyboardAvoidingView behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <View style={[styles.intro, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.introIcon, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name={mode === 'edit' ? 'create-outline' : 'add-circle-outline'} size={24} color={colors.primary} />
            </View>
            <View style={styles.introCopy}>
              <Text selectable style={[styles.title, { color: colors.text }]}>
                {mode === 'edit' ? 'Update research call' : 'New funding opportunity'}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                {mode === 'edit'
                  ? 'Edit the call information here. Publishing, closing, and reopening are managed from its detail page.'
                  : 'Save it as a private draft, or publish it and notify faculty accounts immediately.'}
              </Text>
            </View>
          </View>

          <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Call details</Text>
            <View style={styles.fields}>
              {fields.map((field) => (
                <View key={field.key}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {field.label}{field.required ? ' *' : ''}
                  </Text>
                  <View
                    style={[
                      styles.inputWrap,
                      field.multiline && styles.inputWrapMultiline,
                      { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
                    ]}>
                    <Ionicons name={field.icon} size={18} color={colors.textMuted} style={field.multiline ? styles.multilineIcon : undefined} />
                    <TextInput
                      editable={!isSubmitting}
                      multiline={field.multiline}
                      onChangeText={(value) => updateField(field.key, value)}
                      placeholder={field.placeholder}
                      placeholderTextColor={colors.textMuted}
                      style={[styles.input, field.multiline && styles.multilineInput, { color: colors.text }]}
                      value={form[field.key]}
                    />
                  </View>
                </View>
              ))}
            </View>

            {mode === 'create' && (
              <>
                <Text style={[styles.label, { color: colors.text }]}>Visibility</Text>
                <View style={styles.statusRow}>
                  {([
                    ['draft', 'Save as draft', 'document-outline'],
                    ['open', 'Publish now', 'radio-button-on-outline'],
                  ] as const).map(([status, label, icon]) => {
                    const selected = form.status === status;
                    return (
                      <Pressable
                        accessibilityLabel={label}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        key={status}
                        onPress={() => setForm((current) => ({ ...current, status }))}
                        style={({ pressed }) => [
                          styles.statusOption,
                          {
                            backgroundColor: selected ? colors.primarySoft : colors.surfaceMuted,
                            borderColor: selected ? colors.primary : colors.border,
                            opacity: pressed ? 0.7 : 1,
                          },
                        ]}>
                        <Ionicons name={icon} size={18} color={selected ? colors.primary : colors.textMuted} />
                        <Text style={[styles.statusText, { color: selected ? colors.primary : colors.text }]}>{label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            {error && (
              <View style={[styles.errorBox, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.primary} />
                <Text selectable style={[styles.errorText, { color: colors.primary }]}>{error}</Text>
              </View>
            )}

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                disabled={isSubmitting}
                onPress={onCancel}
                style={({ pressed }) => [styles.secondaryButton, { borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}>
                <Text style={[styles.secondaryText, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={isSubmitting}
                onPress={() => void submit()}
                style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary, opacity: pressed || isSubmitting ? 0.72 : 1 }]}>
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name={mode === 'create' && form.status === 'open' ? 'paper-plane-outline' : 'save-outline'} size={18} color="#FFFFFF" />
                    <Text style={styles.primaryText}>{submitLabel}</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { paddingBottom: 42 },
  page: { alignSelf: 'center', maxWidth: 820, paddingHorizontal: 18, paddingTop: 24, width: '100%' },
  intro: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 20, borderWidth: 1, flexDirection: 'row', gap: 14, padding: 18 },
  introIcon: { alignItems: 'center', borderRadius: 15, height: 52, justifyContent: 'center', width: 52 },
  introCopy: { flex: 1 },
  title: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  subtitle: { fontSize: 10, lineHeight: 16, marginTop: 4 },
  formCard: { borderCurve: 'continuous', borderRadius: 21, borderWidth: 1, marginTop: 13, padding: 19 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 17 },
  fields: { gap: 14 },
  label: { fontSize: 10, fontWeight: '800', marginBottom: 7, marginTop: 3 },
  inputWrap: { alignItems: 'center', borderRadius: 13, borderWidth: 1, flexDirection: 'row', gap: 9, minHeight: 51, paddingHorizontal: 13 },
  inputWrapMultiline: { alignItems: 'flex-start', minHeight: 112 },
  multilineIcon: { marginTop: 16 },
  input: { flex: 1, fontSize: 11, minHeight: 49 },
  multilineInput: { minHeight: 108, paddingTop: 15, textAlignVertical: 'top' },
  statusRow: { flexDirection: 'row', gap: 9 },
  statusOption: { alignItems: 'center', borderRadius: 13, borderWidth: 1, flex: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 48, paddingHorizontal: 10 },
  statusText: { fontSize: 10, fontWeight: '800' },
  errorBox: { alignItems: 'flex-start', borderRadius: 12, flexDirection: 'row', gap: 8, marginTop: 15, padding: 12 },
  errorText: { flex: 1, fontSize: 10, fontWeight: '700', lineHeight: 15 },
  actions: { flexDirection: 'row', gap: 9, justifyContent: 'flex-end', marginTop: 20 },
  secondaryButton: { alignItems: 'center', borderRadius: 13, borderWidth: 1, justifyContent: 'center', minHeight: 50, paddingHorizontal: 18 },
  secondaryText: { fontSize: 11, fontWeight: '800' },
  primaryButton: { alignItems: 'center', borderRadius: 13, flex: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', maxWidth: 230, minHeight: 50, paddingHorizontal: 18 },
  primaryText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
});
