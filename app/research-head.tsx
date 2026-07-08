import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme, type AppPalette } from '@/components/app-theme';
import { ProposalReviewModal } from '@/components/proposal-review-modal';
import { ResearchHeadDrawer, type ResearchHeadView } from '@/components/research-head-drawer';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  initialResearchProposals,
  type ProposalStatus,
  type ResearchProposal,
} from '@/constants/research-proposals';

type ProposalFilter = 'All' | ProposalStatus;

function getStatusStyle(status: ProposalStatus, colors: AppPalette) {
  switch (status) {
    case 'Approved':
      return { background: '#DCF5E6', color: '#177441', icon: 'checkmark-circle' as const };
    case 'For Revision':
      return { background: '#FFF0CF', color: '#946200', icon: 'refresh-circle' as const };
    case 'Rejected':
      return { background: '#FADCE2', color: '#A50F30', icon: 'close-circle' as const };
    default:
      return { background: colors.primarySoft, color: colors.primary, icon: 'time' as const };
  }
}

type ProposalCardProps = {
  proposal: ResearchProposal;
  onOpen: (proposal: ResearchProposal) => void;
};

function ProposalCard({ proposal, onOpen }: ProposalCardProps) {
  const { colors } = useAppTheme();
  const badge = getStatusStyle(proposal.status, colors);

  return (
    <Pressable
      onPress={() => onOpen(proposal)}
      style={({ pressed }) => [
        styles.proposalCard,
        {
          backgroundColor: colors.surface,
          borderColor: pressed ? colors.primary : colors.border,
          transform: [{ scale: pressed ? 0.995 : 1 }],
        },
      ]}>
      <View style={styles.proposalTopRow}>
        <View style={[styles.proposalTypeIcon, { backgroundColor: colors.primarySoft }]}>
          <Ionicons name="document-text-outline" size={21} color={colors.primary} />
        </View>
        <View style={styles.proposalHeading}>
          <Text style={[styles.proposalId, { color: colors.textMuted }]}>{proposal.id}</Text>
          <Text numberOfLines={2} style={[styles.proposalTitle, { color: colors.text }]}>{proposal.title}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: badge.background }]}>
          <Ionicons name={badge.icon} size={13} color={badge.color} />
          <Text style={[styles.statusText, { color: badge.color }]}>{proposal.status}</Text>
        </View>
      </View>

      <View style={[styles.proposalDivider, { backgroundColor: colors.border }]} />
      <View style={styles.proposalMetaRow}>
        <View style={styles.researcherRow}>
          <View style={[styles.researcherAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.researcherInitials}>{proposal.initials}</Text>
          </View>
          <View style={styles.researcherCopy}>
            <Text numberOfLines={1} style={[styles.researcherName, { color: colors.text }]}>{proposal.faculty}</Text>
            <Text numberOfLines={1} style={[styles.researcherDepartment, { color: colors.textMuted }]}>{proposal.department}</Text>
          </View>
        </View>
        <View style={styles.proposalInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="wallet-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.infoText, { color: colors.textMuted }]}>{proposal.budget}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.infoText, { color: colors.textMuted }]}>{proposal.submitted}</Text>
          </View>
        </View>
        <View style={[styles.reviewButton, { backgroundColor: colors.primarySoft }]}>
          <Text style={[styles.reviewButtonText, { color: colors.primary }]}>Review</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}

export default function ResearchHeadScreen() {
  const { colors, isDark } = useAppTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 820;
  const isCompact = width < 420;
  const [activeView, setActiveView] = useState<ResearchHeadView>('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<ResearchProposal | null>(null);
  const [proposals, setProposals] = useState(initialResearchProposals);
  const [filter, setFilter] = useState<ProposalFilter>('All');
  const [query, setQuery] = useState('');

  const pendingProposals = proposals.filter((proposal) => proposal.status === 'Pending Review');
  const revisionCount = proposals.filter((proposal) => proposal.status === 'For Revision').length;
  const approvedCount = proposals.filter((proposal) => proposal.status === 'Approved').length;

  const filteredProposals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return proposals.filter((proposal) => {
      const matchesFilter = filter === 'All' || proposal.status === filter;
      const matchesQuery =
        !normalizedQuery ||
        proposal.title.toLowerCase().includes(normalizedQuery) ||
        proposal.faculty.toLowerCase().includes(normalizedQuery) ||
        proposal.id.toLowerCase().includes(normalizedQuery) ||
        proposal.department.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [filter, proposals, query]);

  const handleDecision = (proposalId: string, status: ProposalStatus) => {
    setProposals((current) =>
      current.map((proposal) => (proposal.id === proposalId ? { ...proposal, status } : proposal)),
    );
  };

  const openInbox = () => {
    setActiveView('proposals');
    setFilter('Pending Review');
  };

  const headerTitle = activeView === 'dashboard' ? 'Dashboard' : 'Proposal inbox';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ResearchHeadDrawer
        activeView={activeView}
        onChangeView={setActiveView}
        onClose={() => setDrawerOpen(false)}
        visible={drawerOpen}
      />
      <ProposalReviewModal
        onClose={() => setSelectedProposal(null)}
        onDecision={handleDecision}
        proposal={selectedProposal}
      />

      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.headerInner}>
          <View style={styles.headerLeft}>
            <Pressable
              accessibilityLabel="Open navigation menu"
              onPress={() => setDrawerOpen(true)}
              style={({ pressed }) => [styles.menuButton, { backgroundColor: colors.primarySoft, opacity: pressed ? 0.65 : 1 }]}>
              <Ionicons name="menu" size={23} color={colors.primary} />
            </Pressable>
            <View>
              <Text style={[styles.headerEyebrow, { color: colors.textMuted }]}>RESEARCH OFFICE</Text>
              <Text style={[styles.headerTitle, { color: colors.text }]}>{headerTitle}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            {!isCompact && (
              <Pressable style={[styles.notificationButton, { backgroundColor: colors.surfaceMuted }]}>
                <Ionicons name="notifications-outline" size={19} color={colors.text} />
                {pendingProposals.length > 0 && <View style={[styles.notificationDot, { backgroundColor: colors.primary }]} />}
              </Pressable>
            )}
            <ThemeToggle />
            <View style={[styles.headerAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.headerAvatarText}>RH</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          {activeView === 'dashboard' ? (
            <>
              <View style={[styles.welcomeRow, isWide && styles.welcomeRowWide]}>
                <View>
                  <View style={[styles.roleBadge, { backgroundColor: colors.primarySoft }]}>
                    <Ionicons name="shield-checkmark-outline" size={14} color={colors.primary} />
                    <Text style={[styles.roleBadgeText, { color: colors.primary }]}>RESEARCH MANAGEMENT</Text>
                  </View>
                  <Text style={[styles.greeting, { color: colors.text }]}>Good day, Research Head.</Text>
                  <Text style={[styles.greetingBody, { color: colors.textMuted }]}>Monitor submissions and keep every proposal moving forward.</Text>
                </View>
                <Pressable
                  onPress={openInbox}
                  style={({ pressed }) => [styles.viewInboxButton, { borderColor: colors.border, opacity: pressed ? 0.62 : 1 }]}>
                  <Ionicons name="file-tray-full-outline" size={18} color={colors.primary} />
                  <Text style={[styles.viewInboxText, { color: colors.primary }]}>Open proposal inbox</Text>
                </Pressable>
              </View>

              <View style={styles.statsGrid}>
                {[
                  { label: 'Awaiting review', value: pendingProposals.length, icon: 'time-outline' as const, accent: true },
                  { label: 'For revision', value: revisionCount, icon: 'refresh-outline' as const },
                  { label: 'Approved', value: approvedCount, icon: 'checkmark-circle-outline' as const },
                  { label: 'All proposals', value: proposals.length, icon: 'documents-outline' as const },
                ].map((stat) => (
                  <View
                    key={stat.label}
                    style={[
                      styles.statCard,
                      {
                        backgroundColor: stat.accent ? colors.primary : colors.surface,
                        borderColor: stat.accent ? colors.primary : colors.border,
                      },
                    ]}>
                    <View style={[styles.statIcon, { backgroundColor: stat.accent ? 'rgba(255,255,255,0.16)' : colors.primarySoft }]}>
                      <Ionicons name={stat.icon} size={21} color={stat.accent ? '#FFFFFF' : colors.primary} />
                    </View>
                    <Text style={[styles.statValue, { color: stat.accent ? '#FFFFFF' : colors.text }]}>{stat.value}</Text>
                    <Text style={[styles.statLabel, { color: stat.accent ? '#FADCE3' : colors.textMuted }]}>{stat.label}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.attentionBanner, isWide && styles.attentionBannerWide, { backgroundColor: isDark ? '#780C28' : '#A80D2E' }]}>
                <View style={styles.bannerCircle} />
                <View style={styles.bannerIcon}>
                  <Ionicons name="sparkles" size={25} color="#FFFFFF" />
                </View>
                <View style={styles.bannerCopy}>
                  <Text style={styles.bannerEyebrow}>ACTION NEEDED</Text>
                  <Text style={styles.bannerTitle}>{pendingProposals.length} new proposals are ready for review</Text>
                  <Text style={styles.bannerBody}>Review submissions early to keep the current research cycle on schedule.</Text>
                </View>
                <Pressable onPress={openInbox} style={({ pressed }) => [styles.bannerButton, { opacity: pressed ? 0.74 : 1 }]}>
                  <Text style={styles.bannerButtonText}>Review now</Text>
                  <Ionicons name="arrow-forward" size={15} color="#A80D2E" />
                </Pressable>
              </View>

              <View style={styles.sectionHeader}>
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Needs your attention</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>Recently submitted faculty proposals</Text>
                </View>
                <Pressable onPress={openInbox}>
                  <Text style={[styles.seeAllText, { color: colors.primary }]}>See all</Text>
                </Pressable>
              </View>
              <View style={styles.proposalList}>
                {pendingProposals.slice(0, 2).map((proposal) => (
                  <ProposalCard key={proposal.id} onOpen={setSelectedProposal} proposal={proposal} />
                ))}
                {pendingProposals.length === 0 && (
                  <View style={[styles.dashboardEmpty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="checkmark-done-circle-outline" size={30} color={colors.primary} />
                    <Text style={[styles.dashboardEmptyTitle, { color: colors.text }]}>Review queue cleared</Text>
                    <Text style={[styles.dashboardEmptyBody, { color: colors.textMuted }]}>There are no pending proposals right now.</Text>
                  </View>
                )}
              </View>
            </>
          ) : (
            <>
              <View style={[styles.inboxHeading, isWide && styles.inboxHeadingWide]}>
                <View>
                  <Text style={[styles.inboxTitle, { color: colors.text }]}>Faculty proposal inbox</Text>
                  <Text style={[styles.inboxSubtitle, { color: colors.textMuted }]}>Review and manage all research submissions in one place.</Text>
                </View>
                <View style={[styles.totalBadge, { backgroundColor: colors.primarySoft }]}>
                  <Text style={[styles.totalBadgeNumber, { color: colors.primary }]}>{proposals.length}</Text>
                  <Text style={[styles.totalBadgeLabel, { color: colors.primary }]}>TOTAL</Text>
                </View>
              </View>

              <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="search" size={20} color={colors.textMuted} />
                <TextInput
                  onChangeText={setQuery}
                  placeholder="Search by title, faculty, ID, or department"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.searchInput, { color: colors.text }]}
                  value={query}
                />
                {query.length > 0 && (
                  <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')}>
                    <Ionicons name="close-circle" size={19} color={colors.textMuted} />
                  </Pressable>
                )}
              </View>

              <ScrollView
                contentContainerStyle={styles.filterRow}
                horizontal
                showsHorizontalScrollIndicator={false}>
                {(['All', 'Pending Review', 'For Revision', 'Approved', 'Rejected'] as ProposalFilter[]).map((item) => {
                  const selected = filter === item;
                  return (
                    <Pressable
                      key={item}
                      onPress={() => setFilter(item)}
                      style={({ pressed }) => [
                        styles.filterChip,
                        {
                          backgroundColor: selected ? colors.primary : colors.surface,
                          borderColor: selected ? colors.primary : colors.border,
                          opacity: pressed ? 0.68 : 1,
                        },
                      ]}>
                      <Text style={[styles.filterChipText, { color: selected ? '#FFFFFF' : colors.textMuted }]}>{item}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={styles.resultsHeader}>
                <Text style={[styles.resultsText, { color: colors.textMuted }]}>{filteredProposals.length} results</Text>
                <View style={styles.sortLabel}>
                  <Ionicons name="swap-vertical-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.resultsText, { color: colors.textMuted }]}>Newest first</Text>
                </View>
              </View>

              <View style={styles.proposalList}>
                {filteredProposals.map((proposal) => (
                  <ProposalCard key={proposal.id} onOpen={setSelectedProposal} proposal={proposal} />
                ))}
                {filteredProposals.length === 0 && (
                  <View style={[styles.inboxEmpty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[styles.inboxEmptyIcon, { backgroundColor: colors.primarySoft }]}>
                      <Ionicons name="search-outline" size={29} color={colors.primary} />
                    </View>
                    <Text style={[styles.inboxEmptyTitle, { color: colors.text }]}>No proposals found</Text>
                    <Text style={[styles.inboxEmptyBody, { color: colors.textMuted }]}>Try changing the search term or selected status.</Text>
                    <Pressable
                      onPress={() => { setFilter('All'); setQuery(''); }}
                      style={({ pressed }) => [styles.resetButton, { borderColor: colors.border, opacity: pressed ? 0.6 : 1 }]}>
                      <Text style={[styles.resetButtonText, { color: colors.primary }]}>Reset filters</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { borderBottomWidth: 1 },
  headerInner: { alignItems: 'center', alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between', maxWidth: 1160, paddingHorizontal: 20, paddingVertical: 13, width: '100%' },
  headerLeft: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  menuButton: { alignItems: 'center', borderRadius: 14, height: 44, justifyContent: 'center', width: 44 },
  headerEyebrow: { fontSize: 8, fontWeight: '800', letterSpacing: 1.4 },
  headerTitle: { fontSize: 18, fontWeight: '800', marginTop: 1 },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  notificationButton: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', position: 'relative', width: 40 },
  notificationDot: { borderColor: '#FFFFFF', borderRadius: 5, borderWidth: 2, height: 9, position: 'absolute', right: 8, top: 7, width: 9 },
  headerAvatar: { alignItems: 'center', borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  headerAvatarText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  scrollContent: { paddingBottom: 42 },
  page: { alignSelf: 'center', maxWidth: 1160, paddingHorizontal: 20, paddingTop: 30, width: '100%' },
  welcomeRow: { gap: 20 },
  welcomeRowWide: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' },
  roleBadge: { alignItems: 'center', alignSelf: 'flex-start', borderRadius: 20, flexDirection: 'row', gap: 6, paddingHorizontal: 10, paddingVertical: 6 },
  roleBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.05 },
  greeting: { fontSize: 29, fontWeight: '800', letterSpacing: -0.8, marginTop: 11 },
  greetingBody: { fontSize: 13, lineHeight: 19, marginTop: 5 },
  viewInboxButton: { alignItems: 'center', alignSelf: 'flex-start', borderRadius: 13, borderWidth: 1, flexDirection: 'row', gap: 8, minHeight: 44, paddingHorizontal: 14 },
  viewInboxText: { fontSize: 11, fontWeight: '800' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11, marginTop: 27 },
  statCard: { borderRadius: 18, borderWidth: 1, flexBasis: 180, flexGrow: 1, minHeight: 142, padding: 16 },
  statIcon: { alignItems: 'center', borderRadius: 12, height: 42, justifyContent: 'center', width: 42 },
  statValue: { fontSize: 28, fontWeight: '800', marginTop: 12 },
  statLabel: { fontSize: 10, marginTop: 2 },
  attentionBanner: { alignItems: 'flex-start', borderRadius: 22, gap: 16, marginTop: 20, minHeight: 130, overflow: 'hidden', padding: 22, position: 'relative' },
  attentionBannerWide: { alignItems: 'center', flexDirection: 'row' },
  bannerCircle: { borderColor: '#FFFFFF', borderRadius: 100, borderWidth: 21, height: 190, opacity: 0.07, position: 'absolute', right: 70, top: -85, width: 190 },
  bannerIcon: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, height: 52, justifyContent: 'center', width: 52 },
  bannerCopy: { flex: 1 },
  bannerEyebrow: { color: '#FFD9E1', fontSize: 8, fontWeight: '800', letterSpacing: 1.3 },
  bannerTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', marginTop: 5 },
  bannerBody: { color: '#F8CED7', fontSize: 10, lineHeight: 15, marginTop: 4 },
  bannerButton: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 11, flexDirection: 'row', gap: 7, paddingHorizontal: 13, paddingVertical: 10 },
  bannerButtonText: { color: '#A80D2E', fontSize: 10, fontWeight: '800' },
  sectionHeader: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between', marginTop: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '800' },
  sectionSubtitle: { fontSize: 10, marginTop: 4 },
  seeAllText: { fontSize: 11, fontWeight: '800' },
  proposalList: { gap: 11, marginTop: 14 },
  proposalCard: { borderRadius: 18, borderWidth: 1, padding: 17 },
  proposalTopRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 11 },
  proposalTypeIcon: { alignItems: 'center', borderRadius: 12, height: 42, justifyContent: 'center', width: 42 },
  proposalHeading: { flex: 1 },
  proposalId: { fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },
  proposalTitle: { fontSize: 14, fontWeight: '800', lineHeight: 19, marginTop: 3 },
  statusBadge: { alignItems: 'center', borderRadius: 13, flexDirection: 'row', gap: 4, paddingHorizontal: 8, paddingVertical: 6 },
  statusText: { fontSize: 8, fontWeight: '800' },
  proposalDivider: { height: 1, marginVertical: 15 },
  proposalMetaRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  researcherRow: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 9, minWidth: 180 },
  researcherAvatar: { alignItems: 'center', borderRadius: 17, height: 34, justifyContent: 'center', width: 34 },
  researcherInitials: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  researcherCopy: { flex: 1 },
  researcherName: { fontSize: 10, fontWeight: '800' },
  researcherDepartment: { fontSize: 8, marginTop: 2 },
  proposalInfo: { flexDirection: 'row', gap: 15 },
  infoItem: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  infoText: { fontSize: 9 },
  reviewButton: { alignItems: 'center', borderRadius: 10, flexDirection: 'row', gap: 3, paddingHorizontal: 9, paddingVertical: 8 },
  reviewButtonText: { fontSize: 9, fontWeight: '800' },
  dashboardEmpty: { alignItems: 'center', borderRadius: 18, borderWidth: 1, padding: 28 },
  dashboardEmptyTitle: { fontSize: 14, fontWeight: '800', marginTop: 9 },
  dashboardEmptyBody: { fontSize: 10, marginTop: 4 },
  inboxHeading: { gap: 16 },
  inboxHeadingWide: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  inboxTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.7 },
  inboxSubtitle: { fontSize: 12, lineHeight: 18, marginTop: 5 },
  totalBadge: { alignItems: 'center', alignSelf: 'flex-start', borderRadius: 14, flexDirection: 'row', gap: 6, paddingHorizontal: 12, paddingVertical: 9 },
  totalBadgeNumber: { fontSize: 17, fontWeight: '800' },
  totalBadgeLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  searchBox: { alignItems: 'center', borderRadius: 15, borderWidth: 1, flexDirection: 'row', gap: 10, marginTop: 25, minHeight: 52, paddingHorizontal: 15 },
  searchInput: { flex: 1, fontSize: 12, minHeight: 50 },
  filterRow: { gap: 8, paddingVertical: 14 },
  filterChip: { borderRadius: 18, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 8 },
  filterChipText: { fontSize: 10, fontWeight: '700' },
  resultsHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  resultsText: { fontSize: 9, fontWeight: '600' },
  sortLabel: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  inboxEmpty: { alignItems: 'center', borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, padding: 40 },
  inboxEmptyIcon: { alignItems: 'center', borderRadius: 28, height: 56, justifyContent: 'center', width: 56 },
  inboxEmptyTitle: { fontSize: 15, fontWeight: '800', marginTop: 14 },
  inboxEmptyBody: { fontSize: 10, marginTop: 5, textAlign: 'center' },
  resetButton: { borderRadius: 10, borderWidth: 1, marginTop: 16, paddingHorizontal: 13, paddingVertical: 9 },
  resetButtonText: { fontSize: 10, fontWeight: '800' },
});
