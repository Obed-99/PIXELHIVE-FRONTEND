import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { getCurrentUser, setCurrentUser } from '../auth';

function initials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function ProfileScreen({ navigation }: any) {
  const me = getCurrentUser();

  function onLogout() {
    setCurrentUser(null);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hd}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(me?.fullName)}</Text>
        </View>
        <Text style={styles.name}>{me?.fullName ?? 'Guest'}</Text>
        <Text style={styles.sub}>{me ? `${me.role} · ${me.email}` : ''}</Text>
      </View>

      <View style={styles.rows}>
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Notifications')}>
          <Text style={styles.rowText}>Notifications</Text>
          <Text style={styles.chev}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('AccountSettings')}>
          <Text style={styles.rowText}>Account settings</Text>
          <Text style={styles.chev}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logout} onPress={onLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  hd: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, paddingBottom: 8 },
  back: { color: colors.textMuted, fontSize: 15 },
  title: { fontSize: 17, fontWeight: '500', color: colors.text },
  card: { alignItems: 'center', paddingVertical: 24 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: { color: colors.brandDark, fontSize: 20, fontWeight: '500' },
  name: { fontSize: 18, fontWeight: '500', color: colors.text },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  rows: { paddingHorizontal: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowText: { fontSize: 15, color: colors.text },
  chev: { color: colors.textMuted, fontSize: 16 },
  footer: { flex: 1, justifyContent: 'flex-end', padding: 16 },
  logout: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { color: colors.red, fontSize: 15, fontWeight: '500' },
});
