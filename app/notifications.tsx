import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import { useAuth } from '@/components/auth-provider';
import { usePortalData } from '@/components/portal-data-provider';
import { PortalPageHeader } from '@/components/portal-page-header';
import {
  type PortalNotification,
  type PortalNotificationType,
} from '@/constants/portal-content';

type InboxFilter = 'All' | 'Unread';

function getNotificationTone(type: PortalNotificationType, isDark: boolean) {
  switch (type) {
    case 'decision':
      return {
        background: isDark ? '#0D362B' : '#DCF5E6',
        color: isDark ? '#62E6A0' : '#177441',
        icon: 'checkmark-circle-outline' as const,
      };
    case 'revision':
      return {
        background: isDark ? '#432510' : '#FFF0D8',
        color: isDark ? '#FFB257' : '#A95800',
        icon: 'refresh-circle-outline' as const,
      };
    case 'submission':
      return {
        background: isDark ? '#142C61' : '#E5EEFF',
        color: isDark ? '#79AEFF' : '#2166D1',
        icon: 'document-text-outline' as const,
      };
    case 'deadline':
      return {
        background: isDark ? '#3C1923' : '#FADCE2',
        color: isDark ? '#FF8197' : '#A50F30',
        icon: 'calendar-outline' as const,
      };
    default:
      return {
        background: isDark ? '#2B254A' : '#EEE8FF',
        color: isDark ? '#B7A3FF' : '#6941C6',
        icon: 'megaphone-outline' as const,
      };
  }
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const role = user?.role === 'faculty' ? 'faculty' : 'research-head';
  const { colors, isDark } = useAppTheme();
  const { notifications, markAllNotificationsRead, markNotificationRead } = usePortalData();
  const [filter, setFilter] = useState<InboxFilter>('All');

  const roleNotifications = useMemo(
    () => notifications.filter((notification) => notification.role === role),
    [notifications, role],
  );
  const visibleNotifications =
    filter === 'Unread'
      ? roleNotifications.filter((notification) => !notification.read)
      : roleNotifications;
  const unreadCount = roleNotifications.filter((notification) => !notification.read).length;
  const fallbackHref = (role === 'research-head' ? '/research-head' : '/faculty') as Href;

  const openNotification = (notification: PortalNotification) => {
    void markNotificationRead(notification.id);
    if (notification.href) {
      router.push(notification.href as Href);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <PortalPageHeader eyebrow="ATHENA UPDATES" fallbackHref={fallbackHref} title="Notifications" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <Animated.View
            entering={FadeInDown.duration(320).reduceMotion(ReduceMotion.System)}
            style={styles.headingRow}>
            <View style={styles.headingCopy}>
              <Text selectable style={[styles.pageTitle, { color: colors.text }]}>Notification inbox</Text>
              <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>
                Proposal decisions, required actions, deadlines, and institutional announcements.
              </Text>
            </View>
            <View style={[styles.unreadBadge, { backgroundColor: colors.primarySoft }]}>
              <Text selectable style={[styles.unreadNumber, { color: colors.primary }]}>{unreadCount}</Text>
              <Text style={[styles.unreadLabel, { color: colors.primary }]}>UNREAD</Text>
            </View>
          </Animated.View>

          <View style={styles.toolbar}>
            <View style={styles.filters}>
              {(['All', 'Unread'] as InboxFilter[]).map((item) => {
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
            </View>
            {unreadCount > 0 && (
              <Pressable
                accessibilityRole="button"
                onPress={() => void markAllNotificationsRead(role)}
                style={({ pressed }) => [styles.markAllButton, { opacity: pressed ? 0.58 : 1 }]}>
                <Ionicons name="checkmark-done" size={16} color={colors.primary} />
                <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all read</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.notificationList}>
            {visibleNotifications.map((notification, index) => {
              const tone = getNotificationTone(notification.type, isDark);
              return (
                <Animated.View
                  entering={FadeInDown.delay(index * 45).duration(300).reduceMotion(ReduceMotion.System)}
                  key={notification.id}>
                  <Pressable
                    accessibilityLabel={`${notification.title}. ${notification.message}`}
                    accessibilityRole="button"
                    onPress={() => openNotification(notification)}
                    style={({ pressed }) => [
                      styles.notificationCard,
                      {
                        backgroundColor: notification.read ? colors.surface : colors.primarySoft,
                        borderColor: notification.read ? colors.border : colors.primary,
                        opacity: pressed ? 0.72 : 1,
                      },
                    ]}>
                    <View style={[styles.iconBox, { backgroundColor: tone.background }]}>
                      <Ionicons name={tone.icon} size={21} color={tone.color} />
                    </View>
                    <View style={styles.notificationCopy}>
                      <View style={styles.notificationTitleRow}>
                        <Text selectable style={[styles.notificationTitle, { color: colors.text }]}>{notification.title}</Text>
                        <Text style={[styles.timeLabel, { color: colors.textMuted }]}>{notification.timeLabel}</Text>
                      </View>
                      <Text selectable style={[styles.message, { color: colors.textMuted }]}>{notification.message}</Text>
                      {notification.projectId && (
                        <Text selectable style={[styles.projectId, { color: tone.color }]}>{notification.projectId}</Text>
                      )}
                    </View>
                    {!notification.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                    {notification.href && <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />}
                  </Pressable>
                </Animated.View>
              );
            })}

            {visibleNotifications.length === 0 && (
              <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceMuted }]}>
                  <Ionicons name="notifications-off-outline" size={28} color={colors.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>You are all caught up</Text>
                <Text style={[styles.emptyBody, { color: colors.textMuted }]}>There are no unread notifications right now.</Text>
                <Pressable onPress={() => setFilter('All')}>
                  <Text style={[styles.showAllText, { color: colors.primary }]}>Show all notifications</Text>
                </Pressable>
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
  page: { alignSelf: 'center', maxWidth: 880, paddingHorizontal: 18, paddingTop: 28, width: '100%' },
  headingRow: { alignItems: 'center', flexDirection: 'row', gap: 16, justifyContent: 'space-between' },
  headingCopy: { flex: 1 },
  pageTitle: { fontSize: 27, fontWeight: '800', letterSpacing: -0.7 },
  pageSubtitle: { fontSize: 11, lineHeight: 18, marginTop: 6, maxWidth: 610 },
  unreadBadge: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 15, minWidth: 68, paddingHorizontal: 12, paddingVertical: 9 },
  unreadNumber: { fontSize: 18, fontVariant: ['tabular-nums'], fontWeight: '800' },
  unreadLabel: { fontSize: 7, fontWeight: '900', letterSpacing: 0.8, marginTop: 1 },
  toolbar: { alignItems: 'center', flexDirection: 'row', gap: 12, justifyContent: 'space-between', paddingVertical: 22 },
  filters: { flexDirection: 'row', gap: 8 },
  filterChip: { borderRadius: 18, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9 },
  filterText: { fontSize: 10, fontWeight: '800' },
  markAllButton: { alignItems: 'center', flexDirection: 'row', gap: 5, paddingVertical: 8 },
  markAllText: { fontSize: 10, fontWeight: '800' },
  notificationList: { gap: 10 },
  notificationCard: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 18, borderWidth: 1, flexDirection: 'row', gap: 12, minHeight: 90, padding: 15 },
  iconBox: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 13, height: 46, justifyContent: 'center', width: 46 },
  notificationCopy: { flex: 1 },
  notificationTitleRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  notificationTitle: { flex: 1, fontSize: 13, fontWeight: '800' },
  timeLabel: { fontSize: 8, fontWeight: '700' },
  message: { fontSize: 10, lineHeight: 16, marginTop: 5 },
  projectId: { fontSize: 8, fontWeight: '900', letterSpacing: 0.7, marginTop: 7 },
  unreadDot: { borderRadius: 4, height: 8, width: 8 },
  emptyState: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 20, borderWidth: 1, padding: 38 },
  emptyIcon: { alignItems: 'center', borderRadius: 17, height: 54, justifyContent: 'center', width: 54 },
  emptyTitle: { fontSize: 14, fontWeight: '800', marginTop: 14 },
  emptyBody: { fontSize: 10, marginTop: 6, textAlign: 'center' },
  showAllText: { fontSize: 10, fontWeight: '800', marginTop: 15 },
});
