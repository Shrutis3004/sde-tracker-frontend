import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, Linking, ActivityIndicator, Modal, TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getProgress, updateProgress } from '../services/api';
import api from '../services/api';
import HintsModal from '../components/HintsModal';

export default function ProblemsScreen({ route }) {
  const { topicId, topicName, problems } = route.params;
  const { theme } = useTheme();
  const [progressMap, setProgressMap] = useState({});
  const [notesMap, setNotesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [bookmarks, setBookmarks] = useState({});
  const [hintsProblem, setHintsProblem] = useState(null);
  const [diffFilter, setDiffFilter] = useState(null); // null = show all, 'Easy'/'Medium'/'Hard'

  const fetchProgress = async () => {
    try {
      const response = await getProgress();
      const sMap = {}, nMap = {};
      response.data.forEach((p) => { sMap[p.problem_id] = p.status; nMap[p.problem_id] = p.notes || ''; });
      setProgressMap(sMap);
      setNotesMap(nMap);
      // Fetch bookmarks
      const bRes = await api.get('/bookmarks');
      const bMap = {};
      (bRes.data || []).forEach((b) => { bMap[b.problem_id] = b.id; });
      setBookmarks(bMap);
    } catch (error) { console.log('Failed:', error); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { fetchProgress(); }, []));

  const handleStatusChange = async (problemId, newStatus) => {
    try {
      await updateProgress(problemId, newStatus, notesMap[problemId] || '');
      setProgressMap((prev) => ({ ...prev, [problemId]: newStatus }));
    } catch { Alert.alert('Error', 'Failed to update'); }
  };

  const handleSaveNotes = async () => {
    if (!selectedProblem) return;
    try {
      await updateProgress(selectedProblem.id, progressMap[selectedProblem.id] || 'unsolved', noteText);
      setNotesMap((prev) => ({ ...prev, [selectedProblem.id]: noteText }));
      setModalVisible(false);
    } catch { Alert.alert('Error', 'Failed to save notes'); }
  };

  const toggleBookmark = async (problemId) => {
    if (bookmarks[problemId]) {
      try {
        await api.delete(`/bookmarks/${bookmarks[problemId]}`);
        setBookmarks((prev) => { const n = { ...prev }; delete n[problemId]; return n; });
      } catch {}
    } else {
      try {
        const res = await api.post('/bookmarks', { problem_id: problemId });
        setBookmarks((prev) => ({ ...prev, [problemId]: res.data.id }));
      } catch {}
    }
  };

  const getDiffColor = (d) => d === 'Easy' ? '#00E676' : d === 'Medium' ? '#FFD600' : d === 'Hard' ? '#FF5252' : '#6B6B80';
  const getStatusIcon = (s) => s === 'solved' ? { sym: '\u2713', col: '#4CAF50' } : s === 'revisit' ? { sym: '\u21BB', col: '#FF9800' } : { sym: '\u25CB', col: '#6B6B80' };

  const renderProblem = ({ item, index }) => {
    const status = progressMap[item.id] || 'unsolved';
    const { sym, col } = getStatusIcon(status);
    const hasNotes = notesMap[item.id]?.length > 0;

    return (
      <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <View style={styles.cardTop}>
          <TouchableOpacity
            style={[styles.statusBtn, { backgroundColor: theme.surfaceLight }]}
            onPress={() => {
              const next = status === 'unsolved' ? 'solved' : status === 'solved' ? 'revisit' : 'unsolved';
              handleStatusChange(item.id, next);
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: col }}>{sym}</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.problemTitle, { color: theme.headingColor }]}>{index + 1}. {item.title}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={() => setDiffFilter(item.difficulty)} style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, backgroundColor: getDiffColor(item.difficulty) + '20' }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: getDiffColor(item.difficulty) }}>{item.difficulty}</Text>
              </TouchableOpacity>
              {hasNotes && (
                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: theme.primary + '20' }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: theme.primary }}>Notes</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={[styles.solveBtn, { backgroundColor: theme.buttonColor }]} onPress={() => Linking.openURL(item.url)}>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Solve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.notesBtn, { borderColor: theme.buttonColor }]} onPress={() => { setSelectedProblem(item); setNoteText(notesMap[item.id] || ''); setModalVisible(true); }}>
            <Text style={{ color: theme.buttonColor, fontSize: 13, fontWeight: '600' }}>Notes</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setHintsProblem(item)} style={{ padding: 6 }}>
            <Ionicons name="bulb-outline" size={20} color="#FFD600" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleBookmark(item.id)} style={{ padding: 6 }}>
            <Ionicons name={bookmarks[item.id] ? 'bookmark' : 'bookmark-outline'} size={20} color={bookmarks[item.id] ? '#FFD700' : theme.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}><ActivityIndicator size="large" color={theme.primary} /></View>;
  }

  const filteredProblems = diffFilter ? problems.filter(p => p.difficulty === diffFilter) : problems;
  const solved = problems.filter((p) => progressMap[p.id] === 'solved').length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.cardBg, borderBottomColor: theme.cardBorder }]}>
        <Text style={[styles.headerTitle, { color: theme.headingColor }]}>{topicName}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {['Easy', 'Medium', 'Hard'].map(d => {
            const active = diffFilter === d;
            return (
              <TouchableOpacity
                key={d}
                onPress={() => setDiffFilter(active ? null : d)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: active ? getDiffColor(d) + '30' : theme.surfaceLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 }}
              >
                <Text style={{ fontSize: 11, fontWeight: '600', color: active ? getDiffColor(d) : theme.textMuted }}>{d}</Text>
                {active && <Ionicons name="close" size={12} color={getDiffColor(d)} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <FlatList data={filteredProblems} renderItem={renderProblem} keyExtractor={(item) => item.id.toString()} contentContainerStyle={{ padding: 16 }} />

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Notes: {selectedProblem?.title}</Text>
            <TextInput
              style={[styles.notesInput, { backgroundColor: theme.surfaceLight, color: theme.text, borderColor: theme.border }]}
              multiline placeholder="Write your approach, time complexity, key insights..."
              placeholderTextColor={theme.textMuted} value={noteText} onChangeText={setNoteText}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 12 }}>
              <TouchableOpacity style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }} onPress={() => setModalVisible(false)}>
                <Text style={{ color: theme.textMuted, fontSize: 15 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, backgroundColor: theme.primary }} onPress={handleSaveNotes}>
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <HintsModal
        visible={!!hintsProblem}
        onClose={() => setHintsProblem(null)}
        problemId={hintsProblem?.id}
        problemTitle={hintsProblem?.title}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: '600', flex: 1 },
  card: { borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  statusBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
  problemTitle: { fontSize: 15, fontWeight: '500', marginBottom: 6, lineHeight: 21 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, gap: 10 },
  solveBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8 },
  notesBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8, backgroundColor: 'transparent', borderWidth: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '70%' },
  modalTitle: { fontSize: 17, fontWeight: '600', marginBottom: 16 },
  notesInput: { borderRadius: 12, padding: 16, fontSize: 15, minHeight: 150, textAlignVertical: 'top', borderWidth: 1 },
});
