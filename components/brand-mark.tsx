import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/components/app-theme';

type BrandMarkProps = {
  compact?: boolean;
  inverted?: boolean;
};

export function BrandMark({ compact = false, inverted = false }: BrandMarkProps) {
  const { colors } = useAppTheme();
  const size = compact ? 42 : 58;
  const backgroundColor = inverted ? colors.white : colors.primary;
  const foregroundColor = inverted ? colors.primary : colors.white;

  return (
    <View style={[styles.wrap, { gap: compact ? 10 : 12 }]}>
      <View
        style={[
          styles.mark,
          {
            width: size,
            height: size,
            borderRadius: compact ? 13 : 18,
            backgroundColor,
            shadowColor: colors.shadow,
          },
        ]}>
        <Text style={[styles.letter, { color: foregroundColor, fontSize: compact ? 23 : 32 }]}>A</Text>
        <View style={[styles.rule, { backgroundColor: foregroundColor }]} />
      </View>
      {!compact && (
        <View>
          <Text style={[styles.name, { color: colors.text }]}>ATHENA</Text>
          <Text style={[styles.label, { color: colors.textMuted }]}>UNIVERSITY PORTAL</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  mark: {
    alignItems: 'center',
    elevation: 5,
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  letter: {
    fontFamily: 'Georgia',
    fontWeight: '700',
    lineHeight: 36,
  },
  rule: {
    borderRadius: 1,
    bottom: 10,
    height: 2,
    position: 'absolute',
    width: 23,
  },
  name: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 3.2,
  },
  label: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginTop: 2,
  },
});
