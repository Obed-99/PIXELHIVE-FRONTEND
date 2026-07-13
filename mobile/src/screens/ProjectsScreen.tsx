import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme, Palette, formatMoney, initials } from '../theme';
import { getProjects, Project } from '../api';
import { getCurrentUser } from '../auth';
import { coverFor } from '../covers';
import TabBar from '../components/TabBar';

function statusColors(colors: Palette, status: string) {
  if (status === 'draft') return { bg: colors.grayTint, fg: colors.gray };
  return { bg: colors.greenTint, fg: colors.green };
}

export default function ProjectsScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = makeStyles(colors);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  const load = useCallback(() => {
    getProjects()
      .then(setProjects)
      .catch((e) => setError(e?.message ?? 'Something went wrong'))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(load);

  const statuses = ['all', ...Array.from(new Set(projects.map((p) => p.status)))];
  const shown = filter === 'all' ? projects : projects.filter((p) => p.status === filter);
  const totalValue = projects.reduce((s, p) => s + Number(p.price ?? 0), 0);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your projects</Text>
          <Text style={styles.subtitle}>
            {projects.length} projects · GHS {formatMoney(totalValue)} total
          </Text>
        </View>
        <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.avatarText}>{initials(getCurrentUser()?.fullName)}</Text>
        </TouchableOpacity>
      </View>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {statuses.map((s) => {
            const on = filter === s;
            return (
              <TouchableOpacity
                key={s}
                style={[styles.chip, on && styles.chipOn]}
                onPress={() => setFilter(s)}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>
                  {s === 'all' ? 'All' : s}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading && <ActivityIndicator color={colors.brand} style={{ marginTop: 40 }} />}
      {error && (
        <Text style={styles.error}>
          Couldn't reach the backend.{'\n'}({error})
        </Text>
      )}

      <FlatList
        style={{ flex: 1 }}
        data={shown}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        ListEmptyComponent={
          !loading && !error ? (
            <Text style={styles.empty}>No {filter === 'all' ? '' : filter + ' '}projects yet.</Text>
          ) : null
        }
        renderItem={({ item }) => {
          const sc = statusColors(colors, item.status);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('ProjectDetail', { projectId: item.id, title: item.title })
              }
            >
              <View>
                <Image source={coverFor(item)} style={styles.cover} resizeMode="cover" />
                <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.badgeText, { color: sc.fg }]}>{item.status}</Text>
                </View>
              </View>
              <View style={styles.body}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                {item.client && <Text style={styles.cardSub}>for {item.client.fullName}</Text>}
                <View style={styles.metaRow}>
                  <Text style={styles.price}>GHS {formatMoney(item.price)}</Text>
                  <Text style={styles.view}>View ›</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <TabBar navigation={navigation} active="Projects" />
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  title: { fontSize: 20, fontWeight: '500', color: colors.text },
  subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.brandDark, fontSize: 12, fontWeight: '500' },
  chips: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { fontSize: 13, color: colors.textMuted, textTransform: 'capitalize' },
  chipTextOn: { color: colors.onBrand, fontWeight: '500' },
  error: { color: colors.red, textAlign: 'center', marginTop: 24, paddingHorizontal: 16 },
  empty: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 30 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
  },
  cover: { width: '100%', height: 130 },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: { fontSize: 11, fontWeight: '500', textTransform: 'capitalize' },
  body: { padding: 14 },
  cardTitle: { fontSize: 15, fontWeight: '500', color: colors.text },
  cardSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  price: { fontSize: 14, color: colors.text, fontWeight: '500' },
  view: { fontSize: 13, color: colors.brand },
});
