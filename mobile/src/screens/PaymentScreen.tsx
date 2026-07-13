import { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Palette, formatMoney } from '../theme';
import { payForProject, initializePayment, verifyPayment } from '../api';
import { getCurrentUser } from '../auth';

export default function PaymentScreen({ route, navigation }: any) {
  const colors = useTheme();
  const styles = makeStyles(colors);
  const { projectId, amount, title } = route.params;
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  function succeed() {
    Alert.alert('Payment received', 'Your files are now unlocked.', [
      { text: 'View files', onPress: () => navigation.goBack() },
    ]);
  }

  async function onPay() {
    setBusy(true);
    try {
      const email = getCurrentUser()?.email ?? 'client@pixelhive.com';
      const init = await initializePayment(projectId, email);
      if (init.demo) {
        // No Paystack key configured on the server - instant demo payment.
        await payForProject(projectId, amount);
        succeed();
      } else {
        // Real test-mode checkout: open Paystack's hosted payment page.
        setReference(init.reference!);
        await Linking.openURL(init.authorizationUrl!);
      }
    } catch (e: any) {
      Alert.alert('Payment failed', e?.message ?? 'Please try again');
    } finally {
      setBusy(false);
    }
  }

  async function onVerify() {
    if (!reference) return;
    setBusy(true);
    try {
      await verifyPayment(projectId, reference);
      succeed();
    } catch (e: any) {
      Alert.alert('Not verified', e?.message ?? 'Finish the checkout, then try again.');
    } finally {
      setBusy(false);
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
        {reference && (
          <Text style={styles.pendingNote}>
            Checkout opened in your browser. Finish paying there, then come back and verify.
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        {reference ? (
          <>
            <TouchableOpacity style={styles.button} onPress={onVerify} disabled={busy}>
              {busy ? (
                <ActivityIndicator color={colors.onOrange} />
              ) : (
                <Text style={styles.buttonText}>I've paid — verify</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={onPay} disabled={busy}>
              <Text style={styles.retry}>Reopen checkout</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.button} onPress={onPay} disabled={busy}>
            {busy ? (
              <ActivityIndicator color={colors.onOrange} />
            ) : (
              <Text style={styles.buttonText}>Pay with Paystack</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
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
  pendingNote: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 19,
  },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  button: { backgroundColor: colors.orange, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: colors.onOrange, fontSize: 15, fontWeight: '500' },
  retry: { textAlign: 'center', color: colors.brand, fontSize: 13, marginTop: 12 },
});
