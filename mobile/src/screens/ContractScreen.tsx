import { useState, useEffect } from 'react';
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Palette } from '../theme';
import { getContract, generateContract, signContract, Contract } from '../api';

export default function ContractScreen({ route, navigation }: any) {
  const colors = useTheme();
  const styles = makeStyles(colors);
  const { projectId } = route.params;
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Load the contract, or generate one if this project doesn't have it yet.
        let c = await getContract(projectId);
        if (!c) c = await generateContract(projectId);
        setContract(c);
      } catch (e: any) {
        Alert.alert('Error', e?.message ?? 'Could not load the contract');
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId]);

  async function onSign() {
    if (!contract) return;
    setSigning(true);
    try {
      const updated = await signContract(contract.id);
      setContract(updated);
      Alert.alert('Contract signed', 'You can now pay to unlock the files.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not sign the contract');
    } finally {
      setSigning(false);
    }
  }

  const signed = contract?.status === 'signed';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hd}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Service agreement</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: 60 }} />
      ) : (
        <>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            <Text style={styles.aiTag}>AI-generated for this project</Text>
            <Text style={styles.content}>{contract?.content}</Text>
          </ScrollView>
          <View style={styles.footer}>
            {signed ? (
              <Text style={styles.signedNote}>Signed ✓</Text>
            ) : (
              <TouchableOpacity style={styles.button} onPress={onSign} disabled={signing}>
                {signing ? (
                  <ActivityIndicator color={colors.onBrand} />
                ) : (
                  <Text style={styles.buttonText}>Sign contract</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  hd: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, paddingBottom: 8 },
  back: { color: colors.textMuted, fontSize: 15 },
  title: { fontSize: 17, fontWeight: '500', color: colors.text },
  aiTag: { fontSize: 12, color: colors.textMuted, marginBottom: 10 },
  content: { fontSize: 14, color: colors.text, lineHeight: 22 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  button: { backgroundColor: colors.brand, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: colors.onBrand, fontSize: 15, fontWeight: '500' },
  signedNote: { textAlign: 'center', color: colors.green, fontSize: 15, fontWeight: '500' },
});
