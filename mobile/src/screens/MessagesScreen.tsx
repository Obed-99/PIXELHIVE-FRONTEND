import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme, Palette } from '../theme';
import { getMyProjects, getMessages, Project, Message } from '../api';
import { coverFor } from '../covers';
import TabBar from '../components/TabBar';

type Convo = { project: Project; last: Message | null };

function timeLabel(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function MessagesScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = makeStyles(colors);
  const [convos, setConvos] = useState<Convo[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    (async () => {
      try {
        const projects = await getMyProjects();
        const withLast = await Promise.all(
          projects.map(async (project) => {
            const ms = await getMessages(project.id).catch(() => [] as Message[]);
            return { project, last: ms.length ? ms[ms.length - 1] : null };
          })
        );
        // Conversations with the newest activity float to the top.
        withLast.sort(
          (a, b) =>
            (b.last ? Date.parse(b.last.createdAt) : 0) -
            (a.last ? Date.parse(a.last.createdAt) : 0)
        );
        setConvos(withLast);
      } catch {
        // header still renders; list stays empty
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useFocusEffect(load);

  const active = convos.filter((c) => c.last).length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>
          {active} active conversation{active === 1 ? '' : 's'}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={convos}
          keyExtractor={(c) => String(c.project.id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4 }}
          renderItem={({ item }) => {
            const sender = item.last?.sender?.fullName?.split(' ')[0];
            return (
              <TouchableOpacity
                style={styles.row}
                onPress={() =>
                  navigation.navigate('Chat', {
                    projectId: item.project.id,
                    title: item.project.title,
                  })
                }
              >
                <Image source={coverFor(item.project)} style={styles.thumb} resizeMode="cover" />
                <View style={{ flex: 1 }}>
                  <View style={styles.rowTop}>
                    <Text style={styles.name} numberOfLines={1}>{item.project.title}</Text>
                    <Text style={styles.time}>{timeLabel(item.last?.createdAt)}</Text>
                  </View>
                  <Text style={styles.preview} numberOfLines={1}>
                    {item.last
                      ? `${sender ? sender + ': ' : ''}${item.last.content}`
                      : 'No messages yet — say hello'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>No conversations yet.</Text>}
        />
      )}

      <TabBar navigation={navigation} active="Messages" />
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 16, paddingTop: 8, marginBottom: 10 },
  title: { fontSize: 20, fontWeight: '500', color: colors.text },
  subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  thumb: { width: 50, height: 50, borderRadius: 12 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  name: { flex: 1, fontSize: 14, fontWeight: '500', color: colors.text },
  time: { fontSize: 11, color: colors.textMuted },
  preview: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
});
