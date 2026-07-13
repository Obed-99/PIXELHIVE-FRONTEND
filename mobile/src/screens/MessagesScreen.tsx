import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme, Palette } from '../theme';
import { getProjects, Project } from '../api';
import TabBar from '../components/TabBar';

export default function MessagesScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = makeStyles(colors);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    getProjects()
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(load);

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Messages</Text>

      {loading ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={projects}
          keyExtractor={(p) => String(p.id)}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => navigation.navigate('Chat', { projectId: item.id, title: item.title })}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(item.client?.fullName ?? item.title).slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.title}</Text>
                <Text style={styles.sub}>
                  {item.client ? `with ${item.client.fullName}` : 'Tap to open chat'}
                </Text>
              </View>
              <Text style={styles.chev}>›</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No conversations yet.</Text>}
        />
      )}

      <TabBar navigation={navigation} active="Messages" />
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 20, fontWeight: '500', color: colors.text, paddingHorizontal: 16, paddingTop: 8, marginBottom: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.brandDark, fontSize: 14, fontWeight: '500' },
  name: { fontSize: 14, fontWeight: '500', color: colors.text },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  chev: { color: colors.textMuted, fontSize: 16 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
});
