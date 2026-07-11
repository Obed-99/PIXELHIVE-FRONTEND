import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { getMessages, sendMessage, Message } from '../api';
import { getCurrentUser } from '../auth';

export default function ChatScreen({ route, navigation }: any) {
  const { projectId, title } = route.params;
  const me = getCurrentUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    getMessages(projectId)
      .then(setMessages)
      .catch((e) => Alert.alert('Error', e?.message ?? 'Could not load messages'))
      .finally(() => setLoading(false));
  }, [projectId]);

  useFocusEffect(load);

  async function onSend() {
    const content = text.trim();
    if (!content || !me) return;
    setText('');
    try {
      const msg = await sendMessage(projectId, me.id, content);
      setMessages((prev) => [...prev, msg]);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not send');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hd}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{title || 'Messages'}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item }) => {
            const mine = !!me && item.sender?.id === me.id;
            return (
              <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                <Text style={[styles.bubbleText, mine && { color: '#fff' }]}>{item.content}</Text>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>No messages yet. Say hello!</Text>}
        />
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Message…"
          placeholderTextColor={colors.textMuted}
        />
        <TouchableOpacity style={styles.send} onPress={onSend}>
          <Text style={styles.sendText}>Send</Text>
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
  bubble: { maxWidth: '82%', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.brand },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.surface },
  bubbleText: { fontSize: 14, color: colors.text },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 14,
    color: colors.text,
  },
  send: { backgroundColor: colors.brand, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9 },
  sendText: { color: '#fff', fontSize: 14, fontWeight: '500' },
});
