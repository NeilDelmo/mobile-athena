import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/components/app-theme';
import { ThemeToggle } from '@/components/theme-toggle';

type PortalPageHeaderProps = {
  eyebrow: string;
  fallbackHref: Href;
  title: string;
};

export function PortalPageHeader({ eyebrow, fallbackHref, title }: PortalPageHeaderProps) {
  const { colors } = useAppTheme();

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(fallbackHref);
  };

  return (
    <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.headerInner}>
        <View style={styles.headerLeft}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            onPress={goBack}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: colors.surfaceMuted, opacity: pressed ? 0.62 : 1 },
            ]}>
            <Ionicons name="arrow-back" size={21} color={colors.text} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text>
            <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>{title}</Text>
          </View>
        </View>
        <ThemeToggle />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { borderBottomWidth: 1 },
  headerInner: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    maxWidth: 1040,
    minHeight: 68,
    paddingHorizontal: 18,
    paddingVertical: 10,
    width: '100%',
  },
  headerLeft: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 11 },
  backButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 13,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerCopy: { flex: 1 },
  eyebrow: { fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  title: { fontSize: 16, fontWeight: '800', marginTop: 2 },
});
