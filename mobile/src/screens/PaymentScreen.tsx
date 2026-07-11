import { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, formatMoney } from '../theme';
import { payForProject } from '../api';

export default function PaymentScreen({ route, navigation }: any) {
  const { projectId, amount, title } = route.params;
  const [paying, setPaying] = useState(false);

  async function onPay() {
    setPaying(true);
    try {
      await payForProject(projectId, amount);
      Alert.alert('Payment received', 'Your files are now unlocked.', [
        { text: 'View files', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Payment failed', e?.message ?? 'Please try again');
    } finally {
      setPaying(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hd}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Payment</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.label}>Amount due</Text>
        <Text style={styles.amount}>GHS {formatMoney(amount)}</Text>
        <Text style={styles.sub}>{title}</Text>
        <View style={styles.escrow}>
          <Text style={styles.escrowText}>Escrow-protected · held until delivery</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={onPay} disabled={paying}>
          {paying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Pay with Paystack</Text>
          )}
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
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  label: { fontSize: 13, color: colors.textMuted },
  amount: { fontSize: 34, fontWeight: '600', color: colors.text, marginTop: 4 },
  sub: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  escrow: {
    marginTop: 20,
    backgroundColor: colors.greenTint,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  escrowText: { color: colors.green, fontSize: 13 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  button: { backgroundColor: colors.brand, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '500' },
});
