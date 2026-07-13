import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import { BrandMark } from '@/components/brand-mark';

export type FacultyNavAction = 'dashboard' | 'projects' | 'calls';

type FacultyDrawerProps = {
  activeAction: Exclude<FacultyNavAction, 'calls'>;
  visible: boolean;
  onClose: () => void;
  onSelect: (action: FacultyNavAction) => void;
};

const navItems: {
  action: FacultyNavAction;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}[] = [
  { action: 'dashboard', icon: 'grid-outline', label: 'Faculty Dashboard' },
  { action: 'projects', icon: 'folder-open-outline', label: 'My Projects' },
  { action: 'calls', icon: 'calendar-outline', label: 'Research Calls' },
];

export function FacultyDrawer({ activeAction, visible, onClose, onSelect }: FacultyDrawerProps) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.86, 340);
  const translateX = useRef(new Animated.Value(-drawerWidth)).current;

  useEffect(() => {
    if (visible) {
      translateX.setValue(-drawerWidth);
      Animated.spring(translateX, {
        damping: 22,
        mass: 0.75,
        stiffness: 210,
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [drawerWidth, translateX, visible]);

  const closeDrawer = () => {
    Animated.timing(translateX, {
      duration: 180,
      toValue: -drawerWidth,
      useNativeDriver: true,
    }).start(onClose);
  };

  const selectItem = (action: FacultyNavAction) => {
    closeDrawer();
    onSelect(action);
  };

  const exitDemo = () => {
    onClose();
    router.replace('/' as Href);
  };

  return (
    <Modal animationType="fade" onRequestClose={closeDrawer} transparent visible={visible}>
      <View style={styles.modalRoot}>
        <Pressable
          accessibilityLabel="Close faculty navigation"
          onPress={closeDrawer}
          style={[
            styles.backdrop,
            { backgroundColor: isDark ? 'rgba(0,0,0,0.74)' : 'rgba(42,12,18,0.48)' },
          ]}
        />
        <Animated.View
          style={[
            styles.drawer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              paddingBottom: Math.max(insets.bottom, 18),
              paddingTop: Math.max(insets.top, 18),
              transform: [{ translateX }],
              width: drawerWidth,
            },
          ]}>
          <View style={styles.drawerHeader}>
            <BrandMark />
            <Pressable
              accessibilityLabel="Close faculty navigation"
              hitSlop={8}
              onPress={closeDrawer}
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: colors.surfaceMuted, opacity: pressed ? 0.6 : 1 },
              ]}>
              <Ionicons name="close" size={20} color={colors.text} />
            </Pressable>
          </View>

          <View style={[styles.profile, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: isDark ? '#A743C2' : '#8F32A8' }]}>
              <Text style={styles.avatarText}>Q</Text>
            </View>
            <View style={styles.profileCopy}>
              <Text numberOfLines={1} style={[styles.profileName, { color: colors.text }]}>Quey Jinnet Baldos</Text>
              <Text numberOfLines={1} style={[styles.profileEmail, { color: colors.textMuted }]}>Faculty workspace</Text>
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>FACULTY PORTAL</Text>
          <View style={styles.navList}>
            {navItems.map((item) => {
              const selected = item.action === activeAction;

              return (
                <Pressable
                  accessibilityState={{ selected }}
                  key={item.action}
                  onPress={() => selectItem(item.action)}
                  style={({ pressed }) => [
                    styles.navItem,
                    {
                      backgroundColor: selected ? colors.primarySoft : 'transparent',
                      opacity: pressed ? 0.66 : 1,
                    },
                  ]}>
                  <View style={[styles.navIcon, { backgroundColor: selected ? colors.primary : colors.surfaceMuted }]}>
                    <Ionicons name={item.icon} size={18} color={selected ? '#FFFFFF' : colors.textMuted} />
                  </View>
                  <Text style={[styles.navText, { color: selected ? colors.primary : colors.text }]}>{item.label}</Text>
                  {item.action === 'calls' && (
                    <View style={[styles.soonBadge, { borderColor: colors.border }]}>
                      <Text style={[styles.soonBadgeText, { color: colors.textMuted }]}>SOON</Text>
                    </View>
                  )}
                  {selected && <View style={[styles.activePill, { backgroundColor: colors.primary }]} />}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.drawerSpacer} />
          <View style={[styles.universityNote, { borderColor: colors.border }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
            <Text style={[styles.universityNoteText, { color: colors.textMuted }]}>Faculty demo workspace</Text>
          </View>
          <Pressable onPress={exitDemo} style={({ pressed }) => [styles.signOut, { opacity: pressed ? 0.58 : 1 }]}>
            <Ionicons name="arrow-back-outline" size={20} color={colors.textMuted} />
            <Text style={[styles.signOutText, { color: colors.textMuted }]}>Exit demo</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject },
  drawer: {
    borderRightWidth: 1,
    bottom: 0,
    elevation: 24,
    left: 0,
    paddingHorizontal: 20,
    position: 'absolute',
    shadowColor: '#000000',
    shadowOffset: { width: 10, height: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 30,
    top: 0,
  },
  drawerHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  closeButton: { alignItems: 'center', borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  profile: { alignItems: 'center', borderCurve: 'continuous', borderRadius: 18, borderWidth: 1, flexDirection: 'row', gap: 12, marginTop: 30, padding: 14 },
  avatar: { alignItems: 'center', borderRadius: 23, height: 46, justifyContent: 'center', width: 46 },
  avatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  profileCopy: { flex: 1 },
  profileName: { fontSize: 14, fontWeight: '800' },
  profileEmail: { fontSize: 10, marginTop: 3 },
  sectionLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.6, marginBottom: 9, marginLeft: 6, marginTop: 29 },
  navList: { gap: 6 },
  navItem: { alignItems: 'center', borderRadius: 15, flexDirection: 'row', gap: 11, minHeight: 54, paddingHorizontal: 10, position: 'relative' },
  navIcon: { alignItems: 'center', borderRadius: 11, height: 34, justifyContent: 'center', width: 34 },
  navText: { flex: 1, fontSize: 13, fontWeight: '800' },
  soonBadge: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 4 },
  soonBadgeText: { fontSize: 7, fontWeight: '800', letterSpacing: 0.65 },
  activePill: { borderRadius: 2, height: 22, marginLeft: 2, width: 3 },
  drawerSpacer: { flex: 1 },
  universityNote: { alignItems: 'center', borderBottomWidth: 1, flexDirection: 'row', gap: 8, paddingBottom: 17 },
  universityNoteText: { flex: 1, fontSize: 10, lineHeight: 15 },
  signOut: { alignItems: 'center', flexDirection: 'row', gap: 10, paddingHorizontal: 4, paddingTop: 20 },
  signOutText: { fontSize: 13, fontWeight: '700' },
});
