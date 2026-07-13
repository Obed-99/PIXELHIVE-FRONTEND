import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Palette, formatMoney, initials } from '../theme';
import { getProjects, Project } from '../api';
import { getCurrentUser } from '../auth';
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

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch((e) => setError(e?.message ?? 'Something went wrong'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Your projects</Text>
        <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.avatarText}>{initials(getCurrentUser()?.fullName)}</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator color={colors.brand} style={{ marginTop: 40 }} />}
      {error && (
        <Text style={styles.error}>
          Couldn't reach the backend.{'\n'}({error})
        </Text>
      )}

      <FlatList
        style={{ flex: 1 }}
        data={projects}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const sc = statusColors(colors, item.status);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('ProjectDetail', { projectId: item.id, title: item.title })
              }
            >
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {item.client && <Text style={styles.cardSub}>for {item.client.fullName}</Text>}
                </View>
                <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.badgeText, { color: sc.fg }]}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.price}>GHS {formatMoney(item.price)}</Text>
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
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.brandDark, fontSize: 12, fontWeight: '500' },
  error: { color: colors.red, textAlign: 'center', marginTop: 24, paddingHorizontal: 16 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 15, fontWeight: '500', color: colors.text },
  cardSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 11 },
  price: { fontSize: 14, color: colors.text, marginTop: 8 },
});
