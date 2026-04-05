import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';

export default function HintsModal({ visible, onClose, problemId, problemTitle, theme }) {
  const [hints, setHints] = useState([]);
  const [revealed, setRevealed] = useState(0); // how many hints revealed
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && problemId) {
      setRevealed(0);
      setLoading(true);
      api.get(`/hints/${problemId}`).then(res => {
        setHints(res.data?.hints || []);
      }).catch(() => setHints([])).finally(() => setLoading(false));
    }
  }, [visible, problemId]);

  const revealNext = () => {
    if (revealed < hints.length) setRevealed(revealed + 1);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={st.overlay}>
        <View style={[st.card, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <LinearGradient colors={['#3BA8D4', '#62c1e5', '#a0d9ef']} style={st.header}>
            <Ionicons name="bulb" size={24} color="#fff" />
            <Text style={st.headerTitle}>AI Hints</Text>
            <TouchableOpacity onPress={onClose} style={st.closeBtn}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <Text style={[st.problemName, { color: theme.text }]} numberOfLines={2}>{problemTitle}</Text>

          {loading ? (
            <ActivityIndicator style={{ marginVertical: 30 }} color={theme.primary} />
          ) : (
            <View style={st.hintsContainer}>
              {hints.map((hint, i) => {
                const isRevealed = i < revealed;
                const isNext = i === revealed;
                const COLORS = [['#7C5CFC', '#A78BFA'], ['#FF8A65', '#FFB899'], ['#4ECDC4', '#7EDDD6']];
                const gradColors = COLORS[i % COLORS.length];

                if (!isRevealed && !isNext) {
                  return (
                    <View key={i} style={[st.hintLocked, { borderColor: theme.border }]}>
                      <Ionicons name="lock-closed" size={16} color={theme.textMuted} />
                      <Text style={{ color: theme.textMuted, fontSize: 13 }}>Hint {i + 1}: {hint.level}</Text>
                    </View>
                  );
                }

                if (isNext && !isRevealed) {
                  return (
                    <TouchableOpacity key={i} onPress={revealNext}>
                      <LinearGradient colors={gradColors} style={st.revealBtn}>
                        <Text style={st.revealIcon}>{hint.icon}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={st.revealTitle}>Reveal Hint {i + 1}: {hint.level}</Text>
                          <Text style={st.revealSub}>Tap to reveal</Text>
                        </View>
                        <Ionicons name="eye-outline" size={20} color="#fff" />
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                }

                return (
                  <View key={i} style={[st.hintRevealed, { borderColor: gradColors[0] + '40', backgroundColor: gradColors[0] + '10' }]}>
                    <View style={st.hintHeader}>
                      <Text style={st.hintEmoji}>{hint.icon}</Text>
                      <Text style={[st.hintLevel, { color: gradColors[0] }]}>Hint {i + 1}: {hint.level}</Text>
                    </View>
                    <Text style={[st.hintText, { color: theme.text }]}>{hint.hint}</Text>
                  </View>
                );
              })}

              {revealed >= hints.length && hints.length > 0 && (
                <View style={st.allRevealed}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={{ color: '#4CAF50', fontWeight: '600', fontSize: 13 }}>All hints revealed! Now try solving it.</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  card: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 10 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#fff' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  problemName: { fontSize: 15, fontWeight: '600', padding: 16, paddingBottom: 8, lineHeight: 22 },
  hintsContainer: { padding: 16, gap: 12 },
  hintLocked: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', opacity: 0.5 },
  revealBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderRadius: 14 },
  revealIcon: { fontSize: 22 },
  revealTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  revealSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  hintRevealed: { padding: 16, borderRadius: 14, borderWidth: 1 },
  hintHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  hintEmoji: { fontSize: 18 },
  hintLevel: { fontSize: 13, fontWeight: '700' },
  hintText: { fontSize: 14, lineHeight: 22 },
  allRevealed: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', paddingVertical: 12 },
});
