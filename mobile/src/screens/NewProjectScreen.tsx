import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Palette, formatMoney } from '../theme';
import { getUsers, createProject, suggestPrice, User } from '../api';
import { getCurrentUser, } from '../auth';

const RESOLUTIONS = ['1080p', '4K', '8K'];
const QUALITIES = ['standard', 'high', 'premium'];

export default function NewProjectScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = makeStyles(colors);
  const me = getCurrentUser();
  const [clients, setClients] = useState<User[]>([]);
  const [clientId, setClientId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [resolution, setResolution] = useState('1080p');
  const [quality, setQuality] = useState('standard');
  const [minutes, setMinutes] = useState(1);
  const [suggesting, setSuggesting] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getUsers()
      .then((us) => {
        const cs = us.filter((u) => u.role === 'client');
        setClients(cs);
        if (cs.length === 1) setClientId(cs[0].id);
      })
      .catch(() => {});
  }, []);

  async function onSuggest() {
    setSuggesting(true);
    try {
      const s = await suggestPrice(resolution, minutes, quality);
      setPrice(String(s.suggestedPrice));
    } catch (e: any) {
      Alert.alert('Could not suggest a price', e?.message ?? 'Try again');
    } finally {
      setSuggesting(false);
    }
  }

  async function onCreate() {
    if (!me) return;
    if (!title.trim()) {
      Alert.alert('Missing title', 'Give the project a name.');
      return;
    }
    if (!clientId) {
      Alert.alert('Pick a client', 'Choose who this project is for.');
      return;
    }
    const p = Number(price);
    if (!p || p <= 0) {
      Alert.alert('Set a price', 'Enter a price, or tap Suggest to calculate one.');
      return;
    }
    setCreating(true);
    try {
      const project = await createProject(me.id, clientId, title.trim(), description.trim(), p);
      navigation.replace('ProjectDetail', { projectId: project.id, title: project.title });
    } catch (e: any) {
      Alert.alert('Could not create the project', e?.message ?? 'Please try again');
    } finally {
      setCreating(false);
    }
  }

  function Chips({
    options,
    value,
    onPick,
  }: {
    options: string[];
    value: string;
    onPick: (v: string) => void;
  }) {
    return (
      <View style={styles.chipRow}>
        {options.map((o) => {
          const on = value === o;
          return (
            <TouchableOpacity
              key={o}
              style={[styles.chip, on && styles.chipOn]}
              onPress={() => onPick(o)}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{o}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <View style={styles.hd}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New project</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Project title</Text>
        <TextInput
          style={styles.input}
          placeholder="Birthday shoot highlights"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="What are you delivering?"
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>Client</Text>
        {clients.length === 0 ? (
          <Text style={styles.hint}>No clients yet — ask your client to create an account.</Text>
        ) : (
          <View style={styles.chipRow}>
            {clients.map((c) => {
              const on = clientId === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.chip, on && styles.chipOn]}
                  onPress={() => setClientId(c.id)}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{c.fullName}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <Text style={styles.section}>Pricing</Text>
        <Text style={styles.label}>Resolution</Text>
        <Chips options={RESOLUTIONS} value={resolution} onPick={setResolution} />
        <Text style={styles.label}>Quality</Text>
        <Chips options={QUALITIES} value={quality} onPick={setQuality} />
        <Text style={styles.label}>Duration (minutes of footage)</Text>
        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => setMinutes((m) => Math.max(1, m - 1))}
          >
            <Text style={styles.stepBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.stepValue}>{minutes}</Text>
          <TouchableOpacity style={styles.stepBtn} onPress={() => setMinutes((m) => m + 1)}>
            <Text style={styles.stepBtnText}>＋</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Price (GHS)</Text>
        <View style={styles.priceRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.suggestBtn} onPress={onSuggest} disabled={suggesting}>
            <Text style={styles.suggestText}>{suggesting ? '…' : '✨ Suggest'}</Text>
          </TouchableOpacity>
        </View>
        {price !== '' && Number(price) > 0 && (
          <Text style={styles.pricePreview}>Client will pay GHS {formatMoney(Number(price))}</Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={onCreate} disabled={creating}>
          {creating ? (
            <ActivityIndicator color={colors.onBrand} />
          ) : (
            <Text style={styles.buttonText}>Create project</Text>
          )}
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  hd: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, paddingBottom: 8 },
  back: { color: colors.textMuted, fontSize: 15 },
  title: { fontSize: 17, fontWeight: '500', color: colors.text },
  section: { fontSize: 15, fontWeight: '500', color: colors.text, marginTop: 18, marginBottom: 4 },
  label: { fontSize: 12, color: colors.textMuted, marginTop: 10, marginBottom: 6 },
  hint: { fontSize: 13, color: colors.textMuted },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  multiline: { minHeight: 64, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { fontSize: 13, color: colors.textMuted },
  chipTextOn: { color: colors.onBrand, fontWeight: '500' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { fontSize: 16, color: colors.text },
  stepValue: { fontSize: 16, fontWeight: '500', color: colors.text, minWidth: 26, textAlign: 'center' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  suggestBtn: {
    borderWidth: 1,
    borderColor: colors.brand,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  suggestText: { color: colors.brand, fontSize: 13, fontWeight: '500' },
  pricePreview: { color: colors.green, fontSize: 13, marginTop: 8 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  button: { backgroundColor: colors.brand, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: colors.onBrand, fontSize: 15, fontWeight: '500' },
});
