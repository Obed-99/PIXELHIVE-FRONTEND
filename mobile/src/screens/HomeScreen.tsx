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

// Project cards borrow a showcase photo as their cover, keyed by id.
const COVERS = SLIDES.map((s) => s.img);
const coverFor = (id: number) => COVERS[id % COVERS.length];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const slideW = width - 32;
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [slide, setSlide] = useState(0);
  const slider = useRef<ScrollView>(null);
  const me = getCurrentUser();
  const firstName = (me?.fullName ?? '').split(' ')[0] || 'there';

  const load = useCallback(() => {
    getProjects()
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(load);

  // Auto-advance the slideshow every 4 seconds.
  useEffect(() => {
    const t = setInterval(() => {
      setSlide((s) => {
        const next = (s + 1) % SLIDES.length;
        slider.current?.scrollTo({ x: next * slideW, animated: true });
        return next;
      });
    }, 4000);
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
          <View>
            <Text style={styles.hello}>{greeting()},</Text>
            <Text style={styles.brand}>{firstName} 👋</Text>
          </View>
          <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.avatarText}>{initials(me?.fullName)}</Text>
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
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          ref={slider}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 16 }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          onMomentumScrollEnd={(e) =>
            setSlide(Math.round(e.nativeEvent.contentOffset.x / slideW))
          }
        >
          {SLIDES.map((s, i) => (
            <View key={i} style={[styles.slide, { width: slideW }]}>
              <Image source={s.img} style={styles.slideImg} resizeMode="cover" />
              <View style={styles.slideScrim}>
                <Text style={styles.slideEyebrow}>PIXELHIVE STUDIO</Text>
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
            <View style={styles.sectionRow}>
              <Text style={styles.section}>Recent projects</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Projects')}>
                <Text style={styles.seeAll}>See all ›</Text>
              </TouchableOpacity>
            </View>
            {recent.length === 0 && <Text style={styles.empty}>No projects match your search.</Text>}
            {recent.slice(0, 4).map((p) => (
              <TouchableOpacity key={p.id} style={styles.card} onPress={() => openProject(p)}>
                <Image source={coverFor(p.id)} style={styles.thumb} resizeMode="cover" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{p.title}</Text>
                  <Text style={styles.cardSub}>
                    {p.client ? `for ${p.client.fullName}` : p.status}
                  </Text>
                </View>
                <Text style={styles.cardPrice}>GHS {formatMoney(p.price)}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.sectionRow}>
              <Text style={styles.section}>Trending projects</Text>
              <Text style={styles.flame}>🔥</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            >
              {trending.map((p) => (
                <TouchableOpacity key={p.id} style={styles.trendCard} onPress={() => openProject(p)}>
                  <Image source={coverFor(p.id)} style={styles.trendCover} resizeMode="cover" />
                  <View style={styles.trendBody}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{p.title}</Text>
                    <View style={styles.trendMeta}>
                      <Text style={styles.cardSub}>{p.status}</Text>
                      <Text style={styles.trendPrice}>GHS {formatMoney(p.price)}</Text>
                    </View>
                  </View>
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
  hello: { fontSize: 13, color: colors.textMuted },
  brand: { fontSize: 21, fontWeight: '500', color: colors.text, marginTop: 1 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    marginTop: 14,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 14, color: colors.text },
  clear: { color: colors.textMuted, fontSize: 14, paddingHorizontal: 4 },
  slide: { borderRadius: 16, overflow: 'hidden' },
  slideImg: { width: '100%', height: 200 },
  slideScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5,7,8,0.6)',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  slideEyebrow: { color: colors.brand, fontSize: 10, letterSpacing: 2, fontWeight: '500' },
  slideCaption: { color: '#F5F5F5', fontSize: 16, fontWeight: '500', marginTop: 3 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotOn: { backgroundColor: colors.brand, width: 18 },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 10,
  },
  section: { fontSize: 16, fontWeight: '500', color: colors.text },
  seeAll: { fontSize: 13, color: colors.brand },
  flame: { fontSize: 14 },
  empty: { color: colors.textMuted, fontSize: 13, paddingHorizontal: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  thumb: { width: 52, height: 52, borderRadius: 10 },
  cardTitle: { fontSize: 14, fontWeight: '500', color: colors.text },
  cardSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  cardPrice: { fontSize: 13, color: colors.text, paddingLeft: 8 },
  trendCard: {
    width: 190,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
  },
  trendCover: { width: '100%', height: 96 },
  trendBody: { padding: 12 },
  trendMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  trendPrice: { fontSize: 13, color: colors.brandDark, fontWeight: '500' },
});
