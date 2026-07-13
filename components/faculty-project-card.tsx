import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/components/app-theme';
import {
  getFacultyStatusLabel,
  type ProposalStatus,
  type ResearchProposal,
} from '@/constants/research-proposals';

type FacultyProjectCardProps = {
  compact?: boolean;
  onPress: (project: ResearchProposal) => void;
  project: ResearchProposal;
};

function useStatusTone(status: ProposalStatus) {
  const { isDark } = useAppTheme();

  if (status === 'Approved') {
    return {
      background: isDark ? '#0D362B' : '#DCF5E6',
      color: isDark ? '#62E6A0' : '#177441',
      icon: 'checkmark-circle' as const,
    };
  }

  if (status === 'For Revision') {
    return {
      background: isDark ? '#432510' : '#FFF0D8',
      color: isDark ? '#FFB257' : '#A95800',
      icon: 'alert-circle' as const,
    };
  }

  if (status === 'Rejected') {
    return {
      background: isDark ? '#421C25' : '#FBE3E7',
      color: isDark ? '#FF8597' : '#A82236',
      icon: 'close-circle' as const,
    };
  }

  return {
    background: isDark ? '#142C61' : '#E5EEFF',
    color: isDark ? '#79AEFF' : '#2166D1',
    icon: 'time' as const,
  };
}

export function FacultyProjectCard({ compact = false, onPress, project }: FacultyProjectCardProps) {
  const { colors } = useAppTheme();
  const tone = useStatusTone(project.status);

  return (
    <Pressable
      accessibilityHint="Opens project monitoring details"
      accessibilityRole="button"
      onPress={() => onPress(project)}
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.72 : 1,
          transform: [{ scale: pressed ? 0.992 : 1 }],
        },
      ]}>
      <View style={styles.topRow}>
        <View style={[styles.projectIcon, { backgroundColor: colors.primarySoft }]}>
          <Ionicons name="document-text-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.heading}>
          <Text selectable style={[styles.projectId, { color: colors.textMuted }]}>{project.id}</Text>
          <Text selectable numberOfLines={compact ? 2 : 3} style={[styles.title, { color: colors.text }]}>
            {project.title}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>

      <View style={styles.metaRow}>
        <View style={[styles.statusBadge, { backgroundColor: tone.background }]}>
          <Ionicons name={tone.icon} size={13} color={tone.color} />
          <Text style={[styles.statusText, { color: tone.color }]}>{getFacultyStatusLabel(project.status)}</Text>
        </View>
        <Text style={[styles.updatedText, { color: colors.textMuted }]}>Updated {project.lastUpdated}</Text>
      </View>

      <View style={styles.progressHeader}>
        <Text style={[styles.progressLabel, { color: colors.textMuted }]}>Approval progress</Text>
        <Text selectable style={[styles.progressValue, { color: colors.text }]}>{project.progress}%</Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.surfaceMuted }]}>
        <View style={[styles.progressFill, { backgroundColor: tone.color, width: `${project.progress}%` }]} />
      </View>

      {!compact && (
        <View style={[styles.feedback, { backgroundColor: colors.surfaceMuted }]}>
          <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.primary} />
          <Text numberOfLines={2} style={[styles.feedbackText, { color: colors.textMuted }]}>
            {project.latestFeedback}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderCurve: 'continuous', borderRadius: 19, borderWidth: 1, padding: 17 },
  cardCompact: { flexBasis: 300, flexGrow: 1, minWidth: 250 },
  topRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 11 },
  projectIcon: { alignItems: 'center', borderRadius: 12, height: 42, justifyContent: 'center', width: 42 },
  heading: { flex: 1 },
  projectId: { fontSize: 8, fontWeight: '800', letterSpacing: 0.65 },
  title: { fontSize: 14, fontWeight: '800', lineHeight: 19, marginTop: 4 },
  metaRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 9, justifyContent: 'space-between', marginTop: 15 },
  statusBadge: { alignItems: 'center', borderRadius: 13, flexDirection: 'row', gap: 5, paddingHorizontal: 9, paddingVertical: 6 },
  statusText: { fontSize: 8, fontWeight: '800' },
  updatedText: { fontSize: 8 },
  progressHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  progressLabel: { fontSize: 9, fontWeight: '600' },
  progressValue: { fontSize: 10, fontVariant: ['tabular-nums'], fontWeight: '800' },
  progressTrack: { borderRadius: 4, height: 7, marginTop: 7, overflow: 'hidden' },
  progressFill: { borderRadius: 4, height: 7 },
  feedback: { alignItems: 'center', borderRadius: 12, flexDirection: 'row', gap: 9, marginTop: 15, padding: 11 },
  feedbackText: { flex: 1, fontSize: 9, lineHeight: 14 },
});
