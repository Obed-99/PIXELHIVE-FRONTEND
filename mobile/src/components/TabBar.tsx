import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';

const TABS = [
  { key: 'Home', label: 'Home', icon: '🏠' },
  { key: 'Projects', label: 'Projects', icon: '📁' },
  { key: 'Messages', label: 'Messages', icon: '💬' },
  { key: 'Profile', label: 'Profile', icon: '👤' },
];

export default function TabBar({ navigation, active }: { navigation: any; active: string }) {
  return (
    <View style={styles.bar}>
      {TABS.map((t) => {
        const on = t.key === active;
        return (
          <TouchableOpacity
            key={t.key}
            style={styles.tab}
            onPress={() => {
              if (!on) navigation.navigate(t.key);
            }}
          >
            <Text style={[styles.icon, on ? styles.iconOn : styles.iconOff]}>{t.icon}</Text>
            <Text style={[styles.label, on && styles.labelOn]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: colors.bg,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
  icon: { fontSize: 18 },
  iconOn: { opacity: 1 },
  iconOff: { opacity: 0.45 },
  label: { fontSize: 11, color: colors.textMuted },
  labelOn: { color: colors.brand, fontWeight: '500' },
});
