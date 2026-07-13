import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme, Palette } from '../theme';
import { getNotifications, markNotificationRead, NotificationItem } from '../api';
import { getCurrentUser } from '../auth';

export default function NotificationsScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = makeStyles(colors);
  const me = getCurrentUser();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!me) {
      setLoading(false);
      return;
    }
    getNotifications(me.id)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [me]);

  useFocusEffect(load);

  async function onTap(n: NotificationItem) {
    if (n.read) return;
    try {
      await markNotificationRead(n.id);
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    } catch {
      // ignore
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hd}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => String(n.id)}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => onTap(item)}>
              <View style={[styles.dot, { backgroundColor: item.read ? colors.border : colors.brand }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.msg}>{item.message}</Text>
                <Text style={styles.type}>{item.type}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No notifications yet.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  hd: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, paddingBottom: 8 },
  back: { color: colors.textMuted, fontSize: 15 },
  title: { fontSize: 17, fontWeight: '500', color: colors.text },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  msg: { fontSize: 14, color: colors.text },
  type: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
});
