import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import type { ProposalStatus, ResearchProposal } from '@/constants/research-proposals';

type ProposalReviewModalProps = {
  proposal: ResearchProposal | null;
  onClose: () => void;
  onDecision: (proposalId: string, status: ProposalStatus, reviewNote?: string) => Promise<void>;
};

function statusStyle(status: ProposalStatus, isDark: boolean) {
  switch (status) {
    case 'Approved':
      return {
        background: isDark ? '#0D362B' : '#DCF5E6',
        color: isDark ? '#62E6A0' : '#177441',
        icon: 'checkmark-circle' as const,
      };
    case 'For Revision':
      return {
        background: isDark ? '#3A2D15' : '#FFF0CF',
        color: isDark ? '#F4C85D' : '#946200',
        icon: 'refresh-circle' as const,
      };
    case 'Rejected':
      return {
        background: isDark ? '#3C1923' : '#FADCE2',
        color: isDark ? '#FF8197' : '#A50F30',
        icon: 'close-circle' as const,
      };
    default:
      return {
        background: isDark ? '#2B204A' : '#E8E4FF',
        color: isDark ? '#B69CFF' : '#5541A4',
        icon: 'time' as const,
      };
  }
}

export function ProposalReviewModal({ proposal, onClose, onDecision }: ProposalReviewModalProps) {
  const { colors, isDark } = useAppTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 760;
  const [comment, setComment] = useState('');
  const [confirmingApproval, setConfirmingApproval] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setComment('');
    setConfirmingApproval(false);
    setIsSaving(false);
  }, [proposal?.id]);

  if (!proposal) {
    return null;
  }

  const badge = statusStyle(proposal.status, isDark);
  const isFinalDecision = proposal.status === 'Approved' || proposal.status === 'Rejected';
  const decide = async (status: ProposalStatus) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onDecision(proposal.id, status, comment.trim() || undefined);
      onClose();
    } catch (error) {
      Alert.alert('Decision not saved', error instanceof Error ? error.message : 'Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible>
      <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.76)' : 'rgba(43,13,19,0.55)' }]}>
        <SafeAreaView
          style={[
            styles.sheet,
            isWide && styles.sheetWide,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <View style={[styles.modalHeader, { borderColor: colors.border }]}>
            <View>
              <Text style={[styles.modalEyebrow, { color: colors.primary }]}>PROPOSAL REVIEW</Text>
              <Text style={[styles.modalId, { color: colors.textMuted }]}>{proposal.id}</Text>
            </View>
            <Pressable
              accessibilityLabel="Close proposal review"
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, { backgroundColor: colors.surfaceMuted, opacity: pressed ? 0.6 : 1 }]}>
              <Ionicons name="close" size={21} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.statusBadge, { backgroundColor: badge.background }]}>
              <Ionicons name={badge.icon} size={15} color={badge.color} />
              <Text style={[styles.statusText, { color: badge.color }]}>{proposal.status}</Text>
            </View>
            <Text style={[styles.proposalTitle, { color: colors.text }]}>{proposal.title}</Text>

            <View style={styles.authorRow}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>{proposal.initials}</Text>
              </View>
              <View>
                <Text style={[styles.authorName, { color: colors.text }]}>{proposal.faculty}</Text>
                <Text style={[styles.department, { color: colors.textMuted }]}>{proposal.department}</Text>
              </View>
            </View>

            <View style={styles.detailGrid}>
              {[
                { label: 'Requested budget', value: proposal.budget, icon: 'wallet-outline' as const },
                { label: 'Project duration', value: proposal.duration, icon: 'calendar-outline' as const },
                { label: 'Research area', value: proposal.category, icon: 'flask-outline' as const },
                { label: 'Submitted', value: proposal.submitted, icon: 'paper-plane-outline' as const },
              ].map((detail) => (
                <View
                  key={detail.label}
                  style={[styles.detailCard, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
                  <Ionicons name={detail.icon} size={18} color={colors.primary} />
                  <View style={styles.detailCopy}>
                    <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{detail.label}</Text>
                    <Text numberOfLines={1} style={[styles.detailValue, { color: colors.text }]}>{detail.value}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={[styles.section, { borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Project abstract</Text>
              <Text style={[styles.abstract, { color: colors.textMuted }]}>{proposal.abstract}</Text>
            </View>

            {isFinalDecision ? (
              <View style={[styles.decisionCard, { backgroundColor: badge.background, borderColor: badge.color }]}>
                <Ionicons name={badge.icon} size={22} color={badge.color} />
                <View style={styles.decisionCopy}>
                  <Text style={[styles.decisionTitle, { color: badge.color }]}>Decision recorded</Text>
                  <Text style={[styles.decisionDate, { color: colors.textMuted }]}>
                    {proposal.decidedAt ?? 'Recorded previously'}
                  </Text>
                  {proposal.reviewNote && (
                    <Text style={[styles.decisionNote, { color: colors.text }]}>{proposal.reviewNote}</Text>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.commentSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Review notes</Text>
                <Text style={[styles.commentHelper, { color: colors.textMuted }]}>
                  Add optional feedback to record with this decision.
                </Text>
                <TextInput
                  multiline
                  onChangeText={setComment}
                  placeholder="Write clear, actionable feedback..."
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.commentInput,
                    {
                      backgroundColor: colors.surfaceMuted,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  textAlignVertical="top"
                  value={comment}
                />
              </View>
            )}
          </ScrollView>

          <View
            style={[
              styles.actions,
              confirmingApproval && styles.confirmationActions,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
            {isFinalDecision ? (
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.doneButton,
                  { backgroundColor: pressed ? colors.primaryPressed : colors.primary },
                ]}>
                <Text style={styles.approveText}>Done</Text>
              </Pressable>
            ) : confirmingApproval ? (
              <>
                <View>
                  <Text style={[styles.confirmationTitle, { color: colors.text }]}>Approve this proposal?</Text>
                  <Text style={[styles.confirmationBody, { color: colors.textMuted }]}>
                    This records a final approval in the proposal queue.
                  </Text>
                </View>
                <View style={styles.confirmationButtons}>
                  <Pressable
                    onPress={() => setConfirmingApproval(false)}
                    style={({ pressed }) => [
                      styles.cancelButton,
                      { borderColor: colors.border, opacity: pressed ? 0.65 : 1 },
                    ]}>
                    <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    disabled={isSaving}
                    onPress={() => void decide('Approved')}
                    style={({ pressed }) => [
                      styles.approveButton,
                      { backgroundColor: pressed ? '#168A54' : '#1FA968' },
                    ]}>
                    <Ionicons name="checkmark-circle" size={19} color="#FFFFFF" />
                    <Text style={styles.approveText}>Confirm approval</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Pressable
                  accessibilityLabel="Reject proposal"
                  disabled={isSaving}
                  onPress={() => void decide('Rejected')}
                  style={({ pressed }) => [styles.iconAction, { borderColor: colors.border, opacity: pressed ? 0.6 : 1 }]}>
                  <Ionicons name="close" size={19} color={colors.primary} />
                </Pressable>
                <Pressable
                  disabled={isSaving}
                  onPress={() => void decide('For Revision')}
                  style={({ pressed }) => [styles.revisionButton, { borderColor: colors.primary, opacity: pressed ? 0.65 : 1 }]}>
                  <Ionicons name="return-down-back" size={18} color={colors.primary} />
                  <Text style={[styles.revisionText, { color: colors.primary }]}>Return for revision</Text>
                </Pressable>
                <Pressable
                  onPress={() => setConfirmingApproval(true)}
                  style={({ pressed }) => [
                    styles.approveButton,
                    { backgroundColor: pressed ? colors.primaryPressed : colors.primary },
                  ]}>
                  <Ionicons name="checkmark" size={19} color="#FFFFFF" />
                  <Text style={styles.approveText}>Approve</Text>
                </Pressable>
              </>
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, maxHeight: '94%', overflow: 'hidden', width: '100%' },
  sheetWide: { alignSelf: 'flex-end', borderBottomLeftRadius: 28, borderTopLeftRadius: 28, borderTopRightRadius: 0, height: '100%', maxHeight: '100%', maxWidth: 610 },
  modalHeader: { alignItems: 'center', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 22, paddingVertical: 17 },
  modalEyebrow: { fontSize: 9, fontWeight: '800', letterSpacing: 1.4 },
  modalId: { fontSize: 10, marginTop: 3 },
  closeButton: { alignItems: 'center', borderRadius: 19, height: 38, justifyContent: 'center', width: 38 },
  modalContent: { padding: 24 },
  statusBadge: { alignItems: 'center', alignSelf: 'flex-start', borderRadius: 15, flexDirection: 'row', gap: 5, paddingHorizontal: 9, paddingVertical: 6 },
  statusText: { fontSize: 9, fontWeight: '800' },
  proposalTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.7, lineHeight: 33, marginTop: 13 },
  authorRow: { alignItems: 'center', flexDirection: 'row', gap: 11, marginTop: 18 },
  avatar: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  avatarText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  authorName: { fontSize: 13, fontWeight: '800' },
  department: { fontSize: 10, marginTop: 2 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 24 },
  detailCard: { alignItems: 'center', borderRadius: 13, borderWidth: 1, flexBasis: 220, flexDirection: 'row', flexGrow: 1, gap: 9, padding: 12 },
  detailCopy: { flex: 1 },
  detailLabel: { fontSize: 8 },
  detailValue: { fontSize: 11, fontWeight: '800', marginTop: 2 },
  section: { borderTopWidth: 1, marginTop: 25, paddingTop: 23 },
  sectionTitle: { fontSize: 14, fontWeight: '800' },
  abstract: { fontSize: 12, lineHeight: 20, marginTop: 9 },
  commentSection: { marginTop: 23 },
  commentHelper: { fontSize: 10, lineHeight: 15, marginTop: 5 },
  commentInput: { borderRadius: 14, borderWidth: 1, fontSize: 12, lineHeight: 19, marginTop: 11, minHeight: 104, padding: 13 },
  decisionCard: { alignItems: 'flex-start', borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 11, marginTop: 23, padding: 15 },
  decisionCopy: { flex: 1 },
  decisionTitle: { fontSize: 13, fontWeight: '800' },
  decisionDate: { fontSize: 9, marginTop: 3 },
  decisionNote: { fontSize: 11, lineHeight: 17, marginTop: 10 },
  actions: { borderTopWidth: 1, flexDirection: 'row', gap: 9, padding: 16 },
  confirmationActions: { alignItems: 'stretch', flexDirection: 'column' },
  confirmationTitle: { fontSize: 14, fontWeight: '800' },
  confirmationBody: { fontSize: 10, lineHeight: 15, marginTop: 3 },
  confirmationButtons: { flexDirection: 'row', gap: 9 },
  cancelButton: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 48 },
  cancelText: { fontSize: 11, fontWeight: '800' },
  iconAction: { alignItems: 'center', borderRadius: 12, borderWidth: 1, height: 48, justifyContent: 'center', width: 48 },
  revisionButton: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flex: 1, flexDirection: 'row', gap: 7, justifyContent: 'center', minHeight: 48, paddingHorizontal: 9 },
  revisionText: { fontSize: 11, fontWeight: '800' },
  approveButton: { alignItems: 'center', borderRadius: 12, flex: 1, flexDirection: 'row', gap: 7, justifyContent: 'center', minHeight: 48, paddingHorizontal: 9 },
  doneButton: { alignItems: 'center', borderRadius: 12, flex: 1, justifyContent: 'center', minHeight: 48 },
  approveText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
});
