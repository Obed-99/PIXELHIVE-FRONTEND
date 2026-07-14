import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';

// Branded splash: always the dark brand look, in every theme, on every platform.
export default function SplashScreen({ navigation }: any) {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.7)).current;
  const tagFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
      ]),
      Animated.timing(tagFade, { toValue: 1, duration: 450, useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => navigation.replace('Login'), 2300);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.center, { opacity: fade, transform: [{ scale }] }]}>
        <Image source={require('../../assets/splash-icon.png')} style={styles.logo} />
        <Text style={styles.name}>PixelHive</Text>
      </Animated.View>
      <Animated.Text style={[styles.tagline, { opacity: tagFade }]}>
        Deliver work. Get paid. Stay protected.
      </Animated.Text>
      <Animated.Text style={[styles.version, { opacity: tagFade }]}>v1.0 · demo</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: '#0B0F14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { alignItems: 'center' },
  logo: { width: 150, height: 150 },
  name: { color: '#F5F5F5', fontSize: 28, fontWeight: '500', marginTop: 14, letterSpacing: 1 },
  tagline: { color: '#8A96A3', fontSize: 14, marginTop: 10 },
  version: {
    position: 'absolute',
    bottom: 34,
    color: '#5B6975',
    fontSize: 12,
    letterSpacing: 1,
  },
});
