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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Palette } from '../theme';
import { login } from '../api';
import { setCurrentUser } from '../auth';

export default function LoginScreen({ navigation }: any) {
  const colors = useTheme();
  const styles = makeStyles(colors);
  // Pre-filled with the test user so logging in during the demo is one tap.
  const [email, setEmail] = useState('obed@pixelhive.com');
  const [password, setPassword] = useState('secret123');
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      setCurrentUser(user);
      navigation.replace('Home');
    } catch (e: any) {
      Alert.alert('Login failed', e?.message ?? 'Please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.brand}>
          <Image source={require('../../assets/splash-icon.png')} style={styles.logo} />
          <Text style={styles.title}>PixelHive</Text>
          <Text style={styles.tagline}>Deliver work. Get paid. Stay protected.</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldIcon}>✉️</Text>
          <TextInput
            style={styles.input}
            placeholder="you@studio.com"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldIcon}>🔒</Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={onLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Log in</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.link}>Create account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  brand: { alignItems: 'center', marginBottom: 28 },
  logo: { width: 90, height: 90 },
  title: { fontSize: 24, fontWeight: '500', color: colors.text, marginTop: 8 },
  tagline: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  fieldIcon: { fontSize: 15, marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.text },
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
