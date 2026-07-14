import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image, Easing } from 'react-native';

// Branded splash: always the dark brand look, in every theme, on every platform.
export default function SplashScreen({ navigation }: any) {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.6)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const nameRise = useRef(new Animated.Value(0)).current;
  const tagFade = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance: logo spins in with a spring, then the text stages up.
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 550, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }),
        Animated.timing(spin, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(nameRise, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(tagFade, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();

    // Ambient loops: breathing glow, drifting hexagons, loading shimmer.
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.timing(shimmer, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
    ).start();

    const t = setTimeout(() => navigation.replace('Login'), 2800);
    return () => clearTimeout(t);
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['-30deg', '0deg'] });
  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.07, 0.14] });
  const drift = float.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  const driftDown = float.interpolate({ inputRange: [0, 1], outputRange: [0, 12] });
  const nameY = nameRise.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
  const shimmerX = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-60, 150] });

  return (
    <View style={styles.wrap}>
      <Animated.Text
        style={[styles.hex, styles.hexTopLeft, { opacity: 0.14, transform: [{ translateY: drift }, { rotate: '12deg' }] }]}
      >
        ⬡
      </Animated.Text>
      <Animated.Text
        style={[styles.hex, styles.hexBottomRight, { opacity: 0.1, transform: [{ translateY: driftDown }, { rotate: '-8deg' }] }]}
      >
        ⬡
      </Animated.Text>

      <Animated.View
        style={[styles.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]}
      />

      <Animated.View style={[styles.center, { opacity: fade, transform: [{ scale }, { rotate }] }]}>
        <Image source={require('../../assets/splash-icon.png')} style={styles.logo} />
      </Animated.View>

      <Animated.Text style={[styles.name, { opacity: nameRise, transform: [{ translateY: nameY }] }]}>
        PixelHive
      </Animated.Text>
      <Animated.Text style={[styles.tagline, { opacity: tagFade }]}>
        Deliver work. Get paid. Stay protected.
      </Animated.Text>

      <View style={styles.footer}>
        <View style={styles.bar}>
          <Animated.View style={[styles.barFill, { transform: [{ translateX: shimmerX }] }]} />
        </View>
        <Text style={styles.version}>v1.0 · demo</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: '#0B0F14',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  hex: { position: 'absolute', color: '#0EA5A4', fontSize: 110 },
  hexTopLeft: { top: 60, left: -20 },
  hexBottomRight: { bottom: 90, right: -16, fontSize: 150 },
  glow: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: '#0EA5A4',
  },
  center: { alignItems: 'center' },
  logo: { width: 150, height: 150 },
  name: {
    color: '#F5F5F5',
    fontSize: 30,
    fontWeight: '500',
    marginTop: 18,
    letterSpacing: 2,
  },
  tagline: { color: '#8A96A3', fontSize: 14, marginTop: 10 },
  footer: { position: 'absolute', bottom: 40, alignItems: 'center', gap: 12 },
  bar: {
    width: 150,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(14,165,164,0.18)',
    overflow: 'hidden',
  },
  barFill: {
    width: 60,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#0EA5A4',
  },
  version: { color: '#5B6975', fontSize: 12, letterSpacing: 1 },
});
