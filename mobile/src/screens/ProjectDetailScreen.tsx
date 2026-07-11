import { useState, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { colors, formatMoney } from '../theme';
import {
  getProject,
  getProjectMedia,
  getContract,
  Project,
  MediaAsset,
  Contract,
} from '../api';

export default function ProjectDetailScreen({ route, navigation }: any) {
  const { projectId } = route.params;
  const [project, setProject] = useState<Project | null>(null);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  // Re-fetch every time this screen comes into focus (e.g. after signing/paying).
  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getProject(projectId), getProjectMedia(projectId), getContract(projectId)])
      .then(([p, m, c]) => {
        setProject(p);
        setMedia(m);
        setContract(c);
      })
      .catch((e) => Alert.alert('Error', e?.message ?? 'Could not load project'))
      .finally(() => setLoading(false));
  }, [projectId]);

  useFocusEffect(load);

  const signed = contract?.status === 'signed';
  const released = media.some((m) => m.status === 'released');
  const firstMedia = media[0];

  function onPay() {
    if (!signed) {
      Alert.alert('Sign the contract first', 'Review and sign the contract before paying.');
      return;
    }
    navigation.navigate('Payment', {
      projectId,
      amount: Number(project?.price ?? 0),
      title: project?.title ?? '',
    });
  }

  function onFiles() {
    if (released) {
      Alert.alert('Download started', `${firstMedia?.fileName ?? 'File'} saved to your device.`);
    } else {
      Alert.alert('Locked', 'Files unlock after payment.');
    }
  }

  if (loading && !project) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={colors.brand} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{project?.title}</Text>
        <View style={[styles.pill, released ? styles.pillGreen : styles.pillAmber]}>
          <Text style={[styles.pillText, { color: released ? colors.green : colors.brandDark }]}>
            {released ? 'delivered' : signed ? 'awaiting payment' : 'awaiting contract'}
          </Text>
        </View>

        <View style={styles.preview}>
          <Text style={styles.previewMark}>PREVIEW · PIXELHIVE</Text>
          <Text style={styles.previewIcon}>▶</Text>
        </View>
        <Text style={styles.fileLabel}>
          {firstMedia
            ? `${firstMedia.fileName} · ${released ? 'released' : 'watermarked preview'}`
            : 'No media uploaded yet'}
        </Text>

        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('Contract', { projectId })}
        >
          <Text style={styles.rowLabel}>Contract</Text>
          <Text style={[styles.rowValue, signed && { color: colors.green }]}>
            {signed ? 'Signed ✓' : 'Review & sign ›'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={onPay}>
          <Text style={styles.rowLabel}>Payment</Text>
          <Text style={[styles.rowValue, released && { color: colors.green }]}>
            {released ? 'Paid ✓' : `GHS ${formatMoney(project?.price)} due ›`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={onFiles}>
          <Text style={styles.rowLabel}>Files</Text>
          <Text style={[styles.rowValue, released && { color: colors.brand }]}>
            {released ? 'Download ›' : 'Locked'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  back: { color: colors.textMuted, fontSize: 15, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '500', color: colors.text },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 14,
  },
  pillAmber: { backgroundColor: colors.brandTint },
  pillGreen: { backgroundColor: colors.greenTint },
  pillText: { fontSize: 12 },
  preview: {
    height: 150,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewMark: {
    position: 'absolute',
    color: colors.textMuted,
    opacity: 0.4,
    fontSize: 14,
    letterSpacing: 2,
    transform: [{ rotate: '-18deg' }],
  },
  previewIcon: { fontSize: 30, color: colors.textMuted },
  fileLabel: { fontSize: 12, color: colors.textMuted, marginTop: 8, marginBottom: 6 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowLabel: { fontSize: 15, color: colors.text },
  rowValue: { fontSize: 13, color: colors.textMuted },
});
