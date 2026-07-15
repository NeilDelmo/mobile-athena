import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import { BrandMark } from '@/components/brand-mark';
import { ThemeToggle } from '@/components/theme-toggle';
import { WelcomeIntro } from '@/components/welcome-intro';

let hasPlayedWelcomeIntro = false;

function ResearchArtwork() {
  const { colors, isDark } = useAppTheme();

  return (
    <View style={[styles.artwork, { backgroundColor: isDark ? '#7B0D29' : '#B20D30' }]}>
      <View style={styles.artGlow} />
      <View style={[styles.sun, { backgroundColor: isDark ? '#F1617D' : '#E95772' }]} />
      <View style={styles.sparkOne} />
      <View style={styles.sparkTwo} />
      <View style={styles.researchCard}>
        <View style={styles.cardTopRow}>
          <View style={styles.cardCopy}>
            <View style={styles.cardLine} />
            <View style={[styles.cardLine, styles.cardLineShort]} />
          </View>
          <View style={styles.cardStatus} />
        </View>
        <View style={styles.chart}>
          {[38, 62, 49, 78, 67].map((height, index) => (
            <View key={index} style={[styles.chartBar, { height }]} />
          ))}
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.cardAvatar} />
          <View style={styles.cardFooterLine} />
        </View>
      </View>
      <View style={[styles.researchNode, styles.nodeOne]}>
        <Ionicons name="document-text-outline" size={19} color="#FFFFFF" />
      </View>
      <View style={[styles.researchNode, styles.nodeTwo]}>
        <Ionicons name="git-network-outline" size={19} color="#FFFFFF" />
      </View>
      <View style={[styles.artBadge, { backgroundColor: colors.surface }]}>
        <Ionicons name="analytics-outline" size={17} color={colors.primary} />
        <Text style={[styles.badgeText, { color: colors.text }]}>Research, organized</Text>
      </View>
    </View>
  );
}

export default function GetStartedScreen() {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 820;
  const [showIntro, setShowIntro] = useState(() => !hasPlayedWelcomeIntro);

  const finishIntro = useCallback(() => {
    hasPlayedWelcomeIntro = true;
    setShowIntro(false);
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {!showIntro && (
        <Animated.View
          entering={FadeIn.duration(280).reduceMotion(ReduceMotion.System)}
          style={styles.root}>
          <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.ambientTop, { backgroundColor: colors.primarySoft }]} />
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.page, isWide && styles.pageWide]}>
          <View style={styles.header}>
            <BrandMark />
            <ThemeToggle />
          </View>

          <View style={[styles.main, isWide && styles.mainWide]}>
            <View style={[styles.copy, isWide && styles.copyWide]}>
              <View style={[styles.eyebrow, { backgroundColor: colors.primarySoft }]}>
                <View style={[styles.eyebrowDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.eyebrowText, { color: colors.primary }]}>RESEARCH MANAGEMENT</Text>
              </View>
              <Text style={[styles.title, { color: colors.text }, isWide && styles.titleWide]}>
                Manage research,{`\n`}
                <Text style={{ color: colors.primary }}>all in one place.</Text>
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Track research calls, proposals, reviews, and decisions through one focused workspace.
              </Text>

              <View style={styles.featureRow}>
                {[
                  ['megaphone-outline', 'Research calls'],
                  ['document-text-outline', 'Proposal tracking'],
                  ['shield-checkmark-outline', 'Role-based access'],
                ].map(([icon, label]) => (
                  <View key={label} style={styles.feature}>
                    <View style={[styles.featureIcon, { backgroundColor: colors.primarySoft }]}>
                      <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={17} color={colors.primary} />
                    </View>
                    <Text style={[styles.featureText, { color: colors.textMuted }]}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <ResearchArtwork />
          </View>

          <View style={styles.footer}>
            <View style={styles.pagination}>
              <View style={[styles.paginationActive, { backgroundColor: colors.primary }]} />
              <View style={[styles.paginationDot, { backgroundColor: colors.border }]} />
              <View style={[styles.paginationDot, { backgroundColor: colors.border }]} />
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/login' as Href)}
              style={({ pressed }) => [
                styles.primaryButton,
                {
                  backgroundColor: pressed ? colors.primaryPressed : colors.primary,
                  shadowColor: colors.shadow,
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                },
              ]}>
              <Text style={styles.primaryButtonText}>Get started</Text>
              <View style={styles.buttonArrow}>
                <Ionicons name="arrow-forward" size={18} color={colors.primary} />
              </View>
            </Pressable>
            <Text style={[styles.helperText, { color: colors.textMuted }]}>For faculty researchers and research management</Text>
          </View>
        </View>
      </ScrollView>
          </SafeAreaView>
        </Animated.View>
      )}
      {showIntro && <WelcomeIntro onFinish={finishIntro} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1, overflow: 'hidden' },
  ambientTop: {
    borderRadius: 180,
    height: 280,
    opacity: 0.55,
    position: 'absolute',
    right: -150,
    top: -145,
    width: 280,
  },
  scrollContent: { flexGrow: 1 },
  page: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: 1160,
    paddingBottom: 22,
    paddingHorizontal: 24,
    paddingTop: 12,
    width: '100%',
  },
  pageWide: { paddingHorizontal: 48, paddingTop: 24 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  main: { flex: 1, gap: 28, justifyContent: 'center', paddingVertical: 32 },
  mainWide: { alignItems: 'center', flexDirection: 'row', gap: 74, paddingVertical: 48 },
  copy: { gap: 18 },
  copyWide: { flex: 1, maxWidth: 510 },
  eyebrow: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  eyebrowDot: { borderRadius: 4, height: 7, width: 7 },
  eyebrowText: { fontSize: 10, fontWeight: '800', letterSpacing: 1.25 },
  title: { fontSize: 39, fontWeight: '800', letterSpacing: -1.5, lineHeight: 45 },
  titleWide: { fontSize: 55, letterSpacing: -2.4, lineHeight: 61 },
  subtitle: { fontSize: 16, lineHeight: 25, maxWidth: 500 },
  featureRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 2 },
  feature: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  featureIcon: { alignItems: 'center', borderRadius: 10, height: 32, justifyContent: 'center', width: 32 },
  featureText: { fontSize: 12, fontWeight: '600' },
  artwork: {
    alignSelf: 'center',
    borderRadius: 32,
    height: 274,
    maxWidth: 460,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#5B0718',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 26,
    width: '100%',
  },
  artGlow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 170,
    height: 270,
    opacity: 0.07,
    position: 'absolute',
    right: -60,
    top: -100,
    width: 270,
  },
  sun: { borderRadius: 45, height: 90, position: 'absolute', right: 52, top: 41, width: 90 },
  sparkOne: { backgroundColor: '#FFFFFF', borderRadius: 3, height: 6, left: 42, opacity: 0.7, position: 'absolute', top: 48, width: 6 },
  sparkTwo: { backgroundColor: '#FFFFFF', borderRadius: 2, height: 4, opacity: 0.5, position: 'absolute', right: 38, top: 154, width: 4 },
  researchCard: {
    backgroundColor: '#FFF8F7',
    borderCurve: 'continuous',
    borderRadius: 22,
    height: 178,
    left: '18%',
    padding: 18,
    position: 'absolute',
    top: 34,
    transform: [{ rotate: '-3deg' }],
    width: '64%',
  },
  cardTopRow: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  cardCopy: { gap: 7, width: '64%' },
  cardLine: { backgroundColor: '#C95B72', borderRadius: 4, height: 7, width: '100%' },
  cardLineShort: { backgroundColor: '#E4B4BE', width: '68%' },
  cardStatus: { backgroundColor: '#B20D30', borderRadius: 8, height: 16, width: 36 },
  chart: { alignItems: 'flex-end', flexDirection: 'row', gap: 8, height: 82, paddingTop: 12 },
  chartBar: { backgroundColor: '#C93A58', borderRadius: 5, flex: 1, opacity: 0.88 },
  cardFooter: { alignItems: 'center', flexDirection: 'row', gap: 8, paddingTop: 8 },
  cardAvatar: { backgroundColor: '#F0CAD2', borderRadius: 7, height: 14, width: 14 },
  cardFooterLine: { backgroundColor: '#E4B4BE', borderRadius: 3, height: 5, width: 72 },
  researchNode: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 15,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    position: 'absolute',
    width: 44,
  },
  nodeOne: { left: 22, top: 37 },
  nodeTwo: { right: 22, top: 137 },
  artBadge: {
    alignItems: 'center',
    borderRadius: 14,
    bottom: 18,
    flexDirection: 'row',
    gap: 8,
    left: 18,
    paddingHorizontal: 13,
    paddingVertical: 10,
    position: 'absolute',
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  footer: { alignItems: 'center', alignSelf: 'center', gap: 14, maxWidth: 480, width: '100%' },
  pagination: { flexDirection: 'row', gap: 6 },
  paginationActive: { borderRadius: 4, height: 6, width: 25 },
  paginationDot: { borderRadius: 4, height: 6, width: 6 },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 18,
    elevation: 7,
    flexDirection: 'row',
    height: 58,
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    width: '100%',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
  buttonArrow: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 15, height: 30, justifyContent: 'center', position: 'absolute', right: 14, width: 30 },
  helperText: { fontSize: 11 },
});
