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

  // Re-fetch each time the screen focuses (e.g. after signing or paying).
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
    navigation.navigate('Payment', {
      projectId,
      amount: Number(project?.price ?? 0),
      title: project?.title ?? '',
    });
  }

  function onFiles() {
    Alert.alert('Download started', `${firstMedia?.fileName ?? 'File'} saved to your device.`);
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
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{project?.title}</Text>

        {released ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>✓  Payment received — files unlocked</Text>
          </View>
        ) : (
          <Text style={styles.status}>🕐  {signed ? 'awaiting payment' : 'awaiting contract'}</Text>
        )}

        <View style={styles.media}>
          <Text style={styles.mediaIcon}>🎞️</Text>
        </View>
        <View style={styles.mediaRow}>
          <Text style={styles.fname}>{firstMedia?.fileName ?? 'No media uploaded yet'}</Text>
          <View style={[styles.badge, released ? styles.badgeGreen : styles.badgeGray]}>
            <Text style={[styles.badgeText, { color: released ? colors.green : colors.textMuted }]}>
              {released ? 'released' : 'locked'}
            </Text>
          </View>
        </View>
        {!released && (
          <Text style={styles.hint}>
            You're seeing a watermarked preview. Pay to unlock the full-resolution download.
          </Text>
        )}

        <View style={{ flex: 1, minHeight: 24 }} />

        {!signed ? (
          <TouchableOpacity
            style={styles.primary}
            onPress={() => navigation.navigate('Contract', { projectId })}
          >
            <Text style={styles.primaryText}>Review & sign contract</Text>
          </TouchableOpacity>
        ) : !released ? (
          <TouchableOpacity style={styles.primary} onPress={onPay}>
            <Text style={styles.primaryText}>🔒  Pay GHS {formatMoney(project?.price)} to unlock</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primary} onPress={onFiles}>
            <Text style={styles.primaryText}>⬇  Download original</Text>
          </TouchableOpacity>
        )}

        <View style={styles.tools}>
          <TouchableOpacity
            style={styles.tool}
            onPress={() => navigation.navigate('Upload', { projectId })}
          >
            <Text style={styles.toolText}>Upload media</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tool}
            onPress={() =>
              navigation.navigate('Chat', { projectId, title: project?.title ?? '' })
            }
          >
            <Text style={styles.toolText}>Messages</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, flexGrow: 1 },
  back: { color: colors.textMuted, fontSize: 15, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '500', color: colors.text },
  status: { fontSize: 13, color: colors.textMuted, marginTop: 8, marginBottom: 14 },
  banner: {
    backgroundColor: colors.greenTint,
    borderRadius: 9,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 14,
  },
  bannerText: { color: colors.green, fontSize: 13 },
  media: {
    height: 150,
    borderRadius: 10,
    backgroundColor: '#17171A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaIcon: { fontSize: 40 },
  mediaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  fname: { fontSize: 14, color: colors.text },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8 },
  badgeGreen: { backgroundColor: colors.greenTint },
  badgeGray: { backgroundColor: colors.grayTint },
  badgeText: { fontSize: 11 },
  hint: { fontSize: 13, color: colors.textMuted, marginTop: 12, lineHeight: 19 },
  primary: {
    backgroundColor: colors.brand,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  tools: { flexDirection: 'row', gap: 10, marginTop: 12 },
  tool: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toolText: { fontSize: 13, color: colors.text },
});
