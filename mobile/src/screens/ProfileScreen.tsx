import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  useTheme,
  useThemeMode,
  toggleThemeMode,
  Palette,
  initials,
  formatMoney,
} from '../theme';
import { getCurrentUser, setCurrentUser } from '../auth';
import { getProjects } from '../api';
import TabBar from '../components/TabBar';

export default function ProfileScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = makeStyles(colors);
  const mode = useThemeMode();
  const me = getCurrentUser();
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [totalValue, setTotalValue] = useState(0);

  const load = useCallback(() => {
    getProjects()
      .then((ps) => {
        setProjectCount(ps.length);
        setTotalValue(ps.reduce((s, p) => s + Number(p.price ?? 0), 0));
      })
      .catch(() => setProjectCount(null));
  }, []);

  useFocusEffect(load);

  const memberYear = me?.createdAt ? new Date(me.createdAt).getFullYear() : '—';

  function onLogout() {
    setCurrentUser(null);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }

  function MenuRow({
    icon,
    label,
    value,
    onPress,
  }: {
    icon: string;
    label: string;
    value?: string;
    onPress: () => void;
  }) {
    return (
      <TouchableOpacity style={styles.menuRow} onPress={onPress}>
        <View style={styles.menuIcon}>
          <Text style={{ fontSize: 15 }}>{icon}</Text>
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
        <Text style={styles.menuValue}>{value ?? '›'}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(me?.fullName)}</Text>
          </View>
          <Text style={styles.name}>{me?.fullName ?? 'Guest'}</Text>
          <Text style={styles.email}>{me?.email ?? ''}</Text>
          {me?.role ? (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{me.role}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{projectCount ?? '—'}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>GHS {formatMoney(totalValue)}</Text>
            <Text style={styles.statLabel}>Portfolio</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{memberYear}</Text>
            <Text style={styles.statLabel}>Member since</Text>
          </View>
        </View>

        <View style={styles.menu}>
          <MenuRow
            icon="🔔"
            label="Notifications"
            onPress={() => navigation.navigate('Notifications')}
          />
          <MenuRow
            icon="⚙️"
            label="Account settings"
            onPress={() => navigation.navigate('AccountSettings')}
          />
          <MenuRow
            icon={mode === 'dark' ? '🌙' : '☀️'}
            label="Appearance"
            value={mode === 'dark' ? 'Dark' : 'Light'}
            onPress={toggleThemeMode}
          />
        </View>

        <TouchableOpacity style={styles.logout} onPress={onLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>

      <TabBar navigation={navigation} active="Profile" />
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.text,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  card: { alignItems: 'center', paddingVertical: 22 },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.brandTint,
    borderWidth: 2,
    borderColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: { color: colors.brandDark, fontSize: 24, fontWeight: '500' },
  name: { fontSize: 19, fontWeight: '500', color: colors.text },
  email: { fontSize: 13, color: colors.textMuted, marginTop: 3 },
  roleBadge: {
    marginTop: 8,
    backgroundColor: colors.brandTint,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: { color: colors.brandDark, fontSize: 12, fontWeight: '500', textTransform: 'capitalize' },
  stats: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 18 },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: { fontSize: 15, fontWeight: '500', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 3 },
  menu: {
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 14, color: colors.text },
  menuValue: { fontSize: 13, color: colors.textMuted },
  logout: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.red,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  logoutText: { color: colors.red, fontSize: 15, fontWeight: '500' },
});
