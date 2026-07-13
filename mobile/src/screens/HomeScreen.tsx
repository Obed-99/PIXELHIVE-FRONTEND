import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, formatMoney, initials } from '../theme';
import { getProjects, Project } from '../api';
import { getCurrentUser } from '../auth';
import TabBar from '../components/TabBar';

const SLIDES = [
  { img: require('../../assets/showcase/slide1.jpg'), caption: 'Shoot with confidence' },
  { img: require('../../assets/showcase/slide2.jpg'), caption: 'Your work, protected' },
  { img: require('../../assets/showcase/slide3.jpg'), caption: 'Watermarked previews' },
  { img: require('../../assets/showcase/slide4.jpg'), caption: 'Deliver like a studio' },
  { img: require('../../assets/showcase/slide5.jpg'), caption: 'Get paid, every time' },
];

export default function HomeScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const slideW = width - 32;
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [slide, setSlide] = useState(0);
  const slider = useRef<ScrollView>(null);

  const load = useCallback(() => {
    getProjects()
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(load);

  // Auto-advance the slideshow every 3.5 seconds.
  useEffect(() => {
    const t = setInterval(() => {
      setSlide((s) => {
        const next = (s + 1) % SLIDES.length;
        slider.current?.scrollTo({ x: next * slideW, animated: true });
        return next;
      });
    }, 3500);
    return () => clearInterval(t);
  }, [slideW]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? projects.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.client?.fullName ?? '').toLowerCase().includes(q)
      )
    : projects;
  const recent = [...filtered].sort((a, b) => b.id - a.id);
  const trending = [...filtered].sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0));

  function openProject(p: Project) {
    navigation.navigate('ProjectDetail', { projectId: p.id, title: p.title });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
        <View style={styles.header}>
          <Text style={styles.brand}>PixelHive</Text>
          <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.avatarText}>{initials(getCurrentUser()?.fullName)}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.search}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects or clients…"
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <ScrollView
          ref={slider}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 14 }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          onMomentumScrollEnd={(e) =>
            setSlide(Math.round(e.nativeEvent.contentOffset.x / slideW))
          }
        >
          {SLIDES.map((s, i) => (
            <View key={i} style={[styles.slide, { width: slideW }]}>
              <Image source={s.img} style={styles.slideImg} resizeMode="cover" />
              <View style={styles.slideScrim}>
                <Text style={styles.slideCaption}>{s.caption}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === slide && styles.dotOn]} />
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.brand} style={{ marginTop: 30 }} />
        ) : (
          <>
            <Text style={styles.section}>Recent projects</Text>
            {recent.length === 0 && <Text style={styles.empty}>No projects match your search.</Text>}
            {recent.map((p) => (
              <TouchableOpacity key={p.id} style={styles.card} onPress={() => openProject(p)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{p.title}</Text>
                  {p.client && <Text style={styles.cardSub}>for {p.client.fullName}</Text>}
                </View>
                <Text style={styles.cardPrice}>GHS {formatMoney(p.price)}</Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.section}>Trending projects</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
            >
              {trending.map((p) => (
                <TouchableOpacity key={p.id} style={styles.trendCard} onPress={() => openProject(p)}>
                  <Text style={styles.trendFlame}>🔥</Text>
                  <Text style={styles.cardTitle} numberOfLines={2}>{p.title}</Text>
                  <Text style={styles.cardSub}>{p.status}</Text>
                  <Text style={styles.trendPrice}>GHS {formatMoney(p.price)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>

      <TabBar navigation={navigation} active="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  brand: { fontSize: 20, fontWeight: '500', color: colors.text },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.brandDark, fontSize: 12, fontWeight: '500' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginTop: 12,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 14, color: colors.text },
  slide: { borderRadius: 14, overflow: 'hidden' },
  slideImg: { width: '100%', height: 190 },
  slideScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5,7,8,0.55)',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  slideCaption: { color: '#F5F5F5', fontSize: 14, fontWeight: '500' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotOn: { backgroundColor: colors.brand, width: 16 },
  section: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    paddingHorizontal: 16,
    marginTop: 22,
    marginBottom: 10,
  },
  empty: { color: colors.textMuted, fontSize: 13, paddingHorizontal: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 14, fontWeight: '500', color: colors.text },
  cardSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  cardPrice: { fontSize: 13, color: colors.text, paddingLeft: 10 },
  trendCard: {
    width: 170,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
  },
  trendFlame: { fontSize: 16, marginBottom: 6 },
  trendPrice: { fontSize: 13, color: colors.brandDark, marginTop: 8, fontWeight: '500' },
});
