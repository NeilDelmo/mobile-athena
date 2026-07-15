import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  ReduceMotion,
  ZoomIn,
  useReducedMotion,
} from 'react-native-reanimated';

import { BrandMark } from '@/components/brand-mark';

type WelcomeIntroProps = {
  onFinish: () => void;
};

export function WelcomeIntro({ onFinish }: WelcomeIntroProps) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(onFinish, reduceMotion ? 350 : 1450);

    return () => clearTimeout(timer);
  }, [onFinish, reduceMotion]);

  return (
    <Animated.View
      accessibilityLabel="ATHENA Research Management"
      accessibilityViewIsModal
      exiting={FadeOut.duration(220).reduceMotion(ReduceMotion.System)}
      style={styles.container}>
      <View style={styles.glow} />
      <View style={styles.orbitLarge} />
      <View style={styles.orbitSmall} />

      <Animated.View
        entering={ZoomIn.duration(300)
          .springify()
          .damping(14)
          .stiffness(180)
          .reduceMotion(ReduceMotion.System)}
        style={styles.brandLockup}>
        <BrandMark compact inverted />
        <Text accessibilityRole="header" style={styles.brandName}>
          ATHENA
        </Text>
      </Animated.View>

      <Animated.Text
        entering={FadeInDown.delay(240).duration(260).reduceMotion(ReduceMotion.System)}
        style={styles.tagline}>
        Research, connected.
      </Animated.Text>

      <Animated.View
        entering={FadeIn.delay(420).duration(220).reduceMotion(ReduceMotion.System)}
        style={styles.pulseDot}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: '#A90D2E',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 10,
  },
  glow: {
    backgroundColor: '#E85770',
    borderRadius: 260,
    height: 520,
    opacity: 0.34,
    position: 'absolute',
    right: -260,
    top: -200,
    width: 520,
  },
  orbitLarge: {
    borderColor: '#FFFFFF',
    borderRadius: 190,
    borderWidth: 1,
    height: 380,
    opacity: 0.08,
    position: 'absolute',
    width: 380,
  },
  orbitSmall: {
    borderColor: '#FFFFFF',
    borderRadius: 125,
    borderWidth: 1,
    height: 250,
    opacity: 0.1,
    position: 'absolute',
    width: 250,
  },
  brandLockup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 5,
  },
  tagline: {
    color: '#FCE9ED',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.6,
    paddingTop: 18,
  },
  pulseDot: {
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    bottom: 42,
    height: 6,
    opacity: 0.75,
    position: 'absolute',
    width: 6,
  },
});
