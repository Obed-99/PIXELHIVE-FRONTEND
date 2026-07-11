import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { getCurrentUser } from '../auth';

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function cap(s?: string): string {
  if (!s) return '—';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function AccountSettingsScreen({ navigation }: any) {
  const me = getCurrentUser();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hd}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Account settings</Text>
      </View>

      <View style={styles.card}>
        <Row label="Full name" value={me?.fullName ?? '—'} />
        <Row label="Email" value={me?.email ?? '—'} />
        <Row label="Role" value={cap(me?.role)} />
        <Row label="Member since" value={formatDate(me?.createdAt)} last />
      </View>

      <Text style={styles.note}>
        Editing account details isn't available in this demo build.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  hd: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, paddingBottom: 8 },
  back: { color: colors.textMuted, fontSize: 15 },
  title: { fontSize: 17, fontWeight: '500', color: colors.text },
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { fontSize: 14, color: colors.textMuted },
  rowValue: { fontSize: 14, color: colors.text, fontWeight: '500', flexShrink: 1, textAlign: 'right', paddingLeft: 12 },
  note: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 20, paddingHorizontal: 24 },
});
