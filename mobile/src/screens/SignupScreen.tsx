import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { register } from '../api';
import { setCurrentUser } from '../auth';

export default function SignupScreen({ navigation }: any) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('creator');
  const [loading, setLoading] = useState(false);

  async function onCreate() {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert('Missing details', 'Please fill in your name, email and password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Use at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const user = await register(fullName.trim(), email.trim().toLowerCase(), password, role);
      setCurrentUser(user);
      navigation.replace('Projects');
    } catch (e: any) {
      Alert.alert('Could not create account', e?.message ?? 'Please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.brand}>
          <Text style={styles.logo}>⬢</Text>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.tagline}>Join PixelHive in a few seconds.</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor={colors.textMuted}
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          style={styles.input}
          placeholder="you@studio.com"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password (min 6 characters)"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.label}>I am a…</Text>
        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[styles.role, role === 'creator' && styles.roleActive]}
            onPress={() => setRole('creator')}
          >
            <Text style={[styles.roleText, role === 'creator' && styles.roleTextActive]}>
              Creator
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.role, role === 'client' && styles.roleActive]}
            onPress={() => setRole('client')}
          >
            <Text style={[styles.roleText, role === 'client' && styles.roleTextActive]}>
              Client
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={onCreate} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  brand: { alignItems: 'center', marginBottom: 24 },
  logo: { fontSize: 46, color: colors.brand },
  title: { fontSize: 22, fontWeight: '500', color: colors.text, marginTop: 8 },
  tagline: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    marginBottom: 12,
  },
  label: { fontSize: 12, color: colors.textMuted, marginBottom: 8, marginTop: 2 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  role: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  roleActive: { borderColor: colors.brand, backgroundColor: colors.brandTint },
  roleText: { fontSize: 14, color: colors.textMuted },
  roleTextActive: { color: colors.brandDark, fontWeight: '500' },
  button: {
    backgroundColor: colors.brand,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  link: { textAlign: 'center', color: colors.brand, fontSize: 13, marginTop: 16 },
});
