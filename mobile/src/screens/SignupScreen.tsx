import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Palette } from '../theme';
import { register, login } from '../api';
import { setSession } from '../auth';

export default function SignupScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = makeStyles(colors);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      await register(fullName.trim(), email.trim().toLowerCase(), password, role);
      // Log straight in so the new account gets its token.
      const { user, token } = await login(email.trim().toLowerCase(), password);
      setSession(user, token);
      navigation.replace('Home');
    } catch (e: any) {
      Alert.alert('Could not create account', e?.message ?? 'Please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <Image source={require('../../assets/splash-icon.png')} style={styles.logo} />
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
        <View style={styles.passRow}>
          <TextInput
            style={styles.passInput}
            placeholder="Password (min 6 characters)"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            returnKeyType="go"
            onSubmitEditing={onCreate}
          />
          <TouchableOpacity
            onPress={() => setShowPassword((s) => !s)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.eye}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

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
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 24 },
  brand: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 72, height: 72 },
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
  passRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingRight: 12,
    marginBottom: 12,
  },
  passInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.text },
  eye: { fontSize: 16 },
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
  buttonText: { color: colors.onBrand, fontSize: 15, fontWeight: '500' },
  link: { textAlign: 'center', color: colors.brand, fontSize: 13, marginTop: 16 },
});
