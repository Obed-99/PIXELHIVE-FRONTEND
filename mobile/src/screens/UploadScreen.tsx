import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useTheme, Palette, formatMoney } from '../theme';
import { uploadMedia, suggestPrice, PriceSuggestion } from '../api';

type Picked = {
  uri: string;
  dataUrl?: string;
  fileName: string;
  fileSize: number;
  width?: number;
};

const QUALITIES = ['standard', 'high', 'premium'];

function resolutionOf(width?: number): string {
  if (!width) return '1080p';
  if (width >= 7680) return '8K';
  if (width >= 3800) return '4K';
  return '1080p';
}

export default function UploadScreen({ route, navigation }: any) {
  const colors = useTheme();
  const styles = makeStyles(colors);
  const { projectId } = route.params;
  const [picked, setPicked] = useState<Picked | null>(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [quality, setQuality] = useState('standard');
  const [suggestion, setSuggestion] = useState<PriceSuggestion | null>(null);
  const [suggesting, setSuggesting] = useState(false);

  async function onPick() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access to upload pictures.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.4, // compress so the upload stays small
      base64: true,
    });
    if (result.canceled || !result.assets?.length) return;

    const a = result.assets[0];
    const name = a.fileName ?? `photo_${Date.now()}.jpg`;
    // Build a data-URL the backend can store and any device can display.
    const dataUrl = a.base64
      ? `data:image/jpeg;base64,${a.base64}`
      : a.uri.startsWith('data:')
        ? a.uri
        : undefined;
    setPicked({ uri: a.uri, dataUrl, fileName: name, fileSize: a.fileSize ?? 0, width: a.width });
    setFileName(name);
    setStatus(null);
    setSuggestion(null);
  }

  async function onSuggest() {
    if (!picked) return;
    setSuggesting(true);
    try {
      const s = await suggestPrice(resolutionOf(picked.width), 1, quality);
      setSuggestion(s);
    } catch (e: any) {
      Alert.alert('Could not suggest a price', e?.message ?? 'Try again');
    } finally {
      setSuggesting(false);
    }
  }

  async function onUpload() {
    if (!picked) {
      Alert.alert('Pick a picture first', 'Tap the box above to choose one from your device.');
      return;
    }
    setUploading(true);
    setStatus('Uploading… generating watermark…');
    try {
      await uploadMedia(projectId, fileName.trim() || picked.fileName, picked.fileSize, picked.dataUrl);
      setStatus('Uploaded — watermarked preview ready.');
      setTimeout(() => navigation.goBack(), 900);
    } catch (e: any) {
      setStatus(null);
      Alert.alert('Upload failed', e?.message ?? 'Please try again');
    } finally {
      setUploading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hd}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Upload media</Text>
      </View>

      <View style={styles.body}>
        <TouchableOpacity style={styles.drop} onPress={onPick}>
          {picked ? (
            <Image source={{ uri: picked.uri }} style={styles.preview} resizeMode="cover" />
          ) : (
            <>
              <Text style={styles.dropIcon}>⬆</Text>
              <Text style={styles.dropText}>Tap to choose a picture from your device</Text>
            </>
          )}
        </TouchableOpacity>
        {picked && (
          <TouchableOpacity onPress={onPick}>
            <Text style={styles.changeLink}>Choose a different picture</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.label}>File name</Text>
        <TextInput
          style={styles.input}
          value={fileName}
          onChangeText={setFileName}
          placeholder="Pick a picture to fill this in"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
        />
        {picked && (
          <>
            <Text style={styles.label}>Dynamic pricing · {resolutionOf(picked.width)}</Text>
            <View style={styles.qualityRow}>
              {QUALITIES.map((q) => {
                const on = quality === q;
                return (
                  <TouchableOpacity
                    key={q}
                    style={[styles.chip, on && styles.chipOn]}
                    onPress={() => {
                      setQuality(q);
                      setSuggestion(null);
                    }}
                  >
                    <Text style={[styles.chipText, on && styles.chipTextOn]}>{q}</Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity style={styles.suggestBtn} onPress={onSuggest} disabled={suggesting}>
                <Text style={styles.suggestText}>
                  {suggesting ? 'Calculating…' : '✨ Suggest price'}
                </Text>
              </TouchableOpacity>
            </View>
            {suggestion && (
              <Text style={styles.suggestion}>
                Suggested price: {suggestion.currency}{' '}
                {formatMoney(suggestion.suggestedPrice)}
              </Text>
            )}
          </>
        )}
        {status && <Text style={styles.status}>{status}</Text>}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={onUpload} disabled={uploading}>
          {uploading ? (
            <ActivityIndicator color={colors.onBrand} />
          ) : (
            <Text style={styles.buttonText}>Upload</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  hd: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, paddingBottom: 8 },
  back: { color: colors.textMuted, fontSize: 15 },
  title: { fontSize: 17, fontWeight: '500', color: colors.text },
  body: { flex: 1, padding: 16 },
  drop: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },
  preview: { width: '100%', height: 180 },
  dropIcon: { fontSize: 30, color: colors.textMuted },
  dropText: { fontSize: 13, color: colors.textMuted, marginTop: 6, paddingHorizontal: 20, textAlign: 'center' },
  changeLink: { color: colors.brand, fontSize: 13, textAlign: 'center', marginBottom: 12 },
  label: { fontSize: 12, color: colors.textMuted, marginBottom: 6, marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  status: { fontSize: 13, color: colors.green, marginTop: 10 },
  qualityRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { fontSize: 12, color: colors.textMuted, textTransform: 'capitalize' },
  chipTextOn: { color: colors.onBrand, fontWeight: '500' },
  suggestBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  suggestText: { fontSize: 12, color: colors.brand, fontWeight: '500' },
  suggestion: { fontSize: 14, color: colors.green, fontWeight: '500', marginTop: 10 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  button: { backgroundColor: colors.brand, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: colors.onBrand, fontSize: 15, fontWeight: '500' },
});
