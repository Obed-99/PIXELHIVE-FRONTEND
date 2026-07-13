import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { uploadMedia } from '../api';

export default function UploadScreen({ route, navigation }: any) {
  const { projectId } = route.params;
  const [fileName, setFileName] = useState('highlights_4k.mp4');
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function onUpload() {
    if (!fileName.trim()) return;
    setUploading(true);
    setStatus('Uploading… generating watermark…');
    try {
      await uploadMedia(projectId, fileName.trim());
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
        <View style={styles.drop}>
          <Text style={styles.dropIcon}>⬆</Text>
          <Text style={styles.dropText}>Select a video or photo</Text>
        </View>

        <Text style={styles.label}>File name</Text>
        <TextInput
          style={styles.input}
          value={fileName}
          onChangeText={setFileName}
          autoCapitalize="none"
        />
        <Text style={styles.tags}>Tags (saved offline first): ceremony · 4K · outdoor</Text>
        {status && <Text style={styles.status}>{status}</Text>}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={onUpload} disabled={uploading}>
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Upload</Text>
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
  body: { flex: 1, padding: 16 },
  drop: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 28,
    alignItems: 'center',
    marginBottom: 16,
  },
  dropIcon: { fontSize: 30, color: colors.textMuted },
  dropText: { fontSize: 13, color: colors.textMuted, marginTop: 6 },
  label: { fontSize: 12, color: colors.textMuted, marginBottom: 6 },
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
  tags: { fontSize: 12, color: colors.textMuted },
  status: { fontSize: 13, color: colors.green, marginTop: 16 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  button: { backgroundColor: colors.brand, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: colors.onBrand, fontSize: 15, fontWeight: '500' },
});
