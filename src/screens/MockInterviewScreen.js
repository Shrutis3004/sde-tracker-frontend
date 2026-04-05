import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Linking, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const DIFFICULTIES = ['Mixed', 'Easy', 'Medium', 'Hard'];
const COUNTS = [3, 4, 5, 6, 8];

export default function MockInterviewScreen() {
  const { theme } = useTheme();
  const [phase, setPhase] = useState('setup'); // setup, running, finished
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDiff, setSelectedDiff] = useState('Mixed');
  const [selectedCount, setSelectedCount] = useState(5);
  const [problems, setProblems] = useState([]);
  const [duration, setDuration] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [solved, setSolved] = useState({});
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    api.get('/topics-list').then(res => {
      setTopics(['All', ...(res.data || []).slice(0, 30)]);
    }).catch(() => {});
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startInterview = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/mock-interview?difficulty=${selectedDiff}&count=${selectedCount}&topic=${selectedTopic}`);
      const data = res.data;
      setProblems(data.problems || []);
      setDuration(data.duration || 45);
      setTimeLeft((data.duration || 45) * 60);
      setSolved({});
      setPhase('running');

      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setPhase('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch { Alert.alert('Error', 'Failed to generate interview'); }
    finally { setLoading(false); }
  };

  const endInterview = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('finished');
  };

  const resetInterview = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('setup');
    setProblems([]);
    setSolved({});
  };

  const toggleSolved = (id) => {
    setSolved(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getDiffColor = (d) => d === 'Easy' ? '#00E676' : d === 'Medium' ? '#FFD600' : d === 'Hard' ? '#FF5252' : '#6B6B80';
  const solvedCount = Object.values(solved).filter(Boolean).length;
  const timePct = duration > 0 ? ((duration * 60 - timeLeft) / (duration * 60)) * 100 : 0;

  // SETUP PHASE
  if (phase === 'setup') {
    return (
      <ScrollView style={[st.container, { backgroundColor: theme.background }]}>
        <View style={[st.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <LinearGradient colors={['#3BA8D4', '#62c1e5', '#a0d9ef']} style={st.headerBanner}>
            <Ionicons name="timer-outline" size={32} color="#fff" />
            <Text style={st.headerTitle}>Mock Interview</Text>
            <Text style={st.headerSub}>Simulate a real coding interview</Text>
          </LinearGradient>

          {/* Difficulty */}
          <Text style={[st.label, { color: theme.text }]}>Difficulty</Text>
          <View style={st.chipRow}>
            {DIFFICULTIES.map(d => (
              <TouchableOpacity key={d} onPress={() => setSelectedDiff(d)}
                style={[st.chip, selectedDiff === d && { backgroundColor: theme.primary, borderColor: theme.primary }]}>
                <Text style={[st.chipText, { color: selectedDiff === d ? '#fff' : theme.textSecondary }]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Count */}
          <Text style={[st.label, { color: theme.text }]}>Number of Problems</Text>
          <View style={st.chipRow}>
            {COUNTS.map(c => (
              <TouchableOpacity key={c} onPress={() => setSelectedCount(c)}
                style={[st.chip, selectedCount === c && { backgroundColor: theme.primary, borderColor: theme.primary }]}>
                <Text style={[st.chipText, { color: selectedCount === c ? '#fff' : theme.textSecondary }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Topic */}
          <Text style={[st.label, { color: theme.text }]}>Topic</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            <View style={st.chipRow}>
              {topics.map(t => (
                <TouchableOpacity key={t} onPress={() => setSelectedTopic(t)}
                  style={[st.chip, selectedTopic === t && { backgroundColor: theme.primary, borderColor: theme.primary }]}>
                  <Text style={[st.chipText, { color: selectedTopic === t ? '#fff' : theme.textSecondary }]} numberOfLines={1}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Start */}
          <TouchableOpacity onPress={startInterview} disabled={loading}>
            <LinearGradient colors={['#3BA8D4', '#62c1e5', '#a0d9ef']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={st.startBtn}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="play" size={20} color="#fff" />
                  <Text style={st.startBtnText}>Start Interview</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    );
  }

  // RUNNING / FINISHED PHASE
  const isFinished = phase === 'finished';
  const timerColor = timeLeft < 300 ? '#FF5252' : timeLeft < 600 ? '#FFD600' : '#fff';

  return (
    <ScrollView style={[st.container, { backgroundColor: theme.background }]}>
      {/* Timer Bar */}
      <View style={[st.timerCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <LinearGradient colors={isFinished ? ['#4CAF50', '#66BB6A'] : ['#3BA8D4', '#62c1e5']} style={st.timerBanner}>
          <Text style={[st.timerText, { color: timerColor }]}>{isFinished ? 'FINISHED' : formatTime(timeLeft)}</Text>
          <Text style={st.timerSub}>{duration} min • {problems.length} problems • {selectedDiff}</Text>
          <View style={st.timerBar}>
            <View style={[st.timerFill, { width: `${isFinished ? 100 : timePct}%`, backgroundColor: isFinished ? '#fff' : timerColor }]} />
          </View>
        </LinearGradient>

        <View style={st.scoreRow}>
          <View style={st.scoreItem}>
            <Text style={[st.scoreNum, { color: '#4CAF50' }]}>{solvedCount}</Text>
            <Text style={[st.scoreLabel, { color: theme.textMuted }]}>Solved</Text>
          </View>
          <View style={st.scoreItem}>
            <Text style={[st.scoreNum, { color: '#FF9800' }]}>{problems.length - solvedCount}</Text>
            <Text style={[st.scoreLabel, { color: theme.textMuted }]}>Remaining</Text>
          </View>
          <View style={st.scoreItem}>
            <Text style={[st.scoreNum, { color: theme.primary }]}>{problems.length}</Text>
            <Text style={[st.scoreLabel, { color: theme.textMuted }]}>Total</Text>
          </View>
        </View>
      </View>

      {/* Problems */}
      {problems.map((p, i) => (
        <View key={p.id} style={[st.problemCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={[st.problemStrip, { backgroundColor: getDiffColor(p.difficulty) }]} />
          <View style={st.problemBody}>
            <View style={st.problemTop}>
              <TouchableOpacity onPress={() => toggleSolved(p.id)}
                style={[st.checkBtn, solved[p.id] && { backgroundColor: '#4CAF5030' }]}>
                <Ionicons name={solved[p.id] ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22} color={solved[p.id] ? '#4CAF50' : theme.textMuted} />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={[st.problemTitle, { color: theme.text, textDecorationLine: solved[p.id] ? 'line-through' : 'none' }]}>
                  Q{i + 1}. {p.title}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                  <Text style={{ fontSize: 11, color: getDiffColor(p.difficulty), fontWeight: '600' }}>{p.difficulty}</Text>
                  <Text style={{ fontSize: 11, color: theme.textMuted }}>{p.topic_name}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={() => p.url && Linking.openURL(p.url)}
              style={[st.solveLink, { borderColor: theme.primary }]}>
              <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '600' }}>Open Problem</Text>
              <Ionicons name="open-outline" size={14} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Action Buttons */}
      <View style={st.actionRow}>
        {!isFinished && (
          <TouchableOpacity onPress={endInterview} style={[st.actionBtn, { backgroundColor: '#FF525220', borderColor: '#FF5252' }]}>
            <Ionicons name="stop" size={18} color="#FF5252" />
            <Text style={{ color: '#FF5252', fontWeight: '600', fontSize: 13 }}>End Interview</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={resetInterview} style={{ flex: 1 }}>
          <LinearGradient colors={['#3BA8D4', '#62c1e5', '#a0d9ef']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[st.actionBtn, { borderWidth: 0 }]}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>New Interview</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Result Summary */}
      {isFinished && (
        <View style={[st.resultCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <Ionicons name="trophy" size={36} color="#FFD700" />
          <Text style={[st.resultTitle, { color: theme.text }]}>Interview Complete!</Text>
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 4 }}>
            You solved {solvedCount} out of {problems.length} problems
          </Text>
          <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 8 }}>
            Score: {Math.round((solvedCount / problems.length) * 100)}%
          </Text>
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1 },
  card: { margin: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  headerBanner: { padding: 28, alignItems: 'center', gap: 6 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  label: { fontSize: 14, fontWeight: '700', marginTop: 18, marginBottom: 10, paddingHorizontal: 18 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 18 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  chipText: { fontSize: 13, fontWeight: '600' },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 18, paddingVertical: 14, borderRadius: 12 },
  startBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  // Timer
  timerCard: { margin: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  timerBanner: { padding: 20, alignItems: 'center' },
  timerText: { fontSize: 40, fontWeight: '800', fontVariant: ['tabular-nums'] },
  timerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  timerBar: { width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, marginTop: 12, overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: 2 },
  scoreRow: { flexDirection: 'row', padding: 16 },
  scoreItem: { flex: 1, alignItems: 'center' },
  scoreNum: { fontSize: 22, fontWeight: '700' },
  scoreLabel: { fontSize: 11, marginTop: 2 },
  // Problem cards
  problemCard: { marginHorizontal: 16, marginBottom: 10, borderRadius: 12, overflow: 'hidden', borderWidth: 1, flexDirection: 'row' },
  problemStrip: { width: 5 },
  problemBody: { flex: 1, padding: 14 },
  problemTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  problemTitle: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  solveLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, alignSelf: 'flex-end', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1 },
  // Actions
  actionRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: 8 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10, borderWidth: 1 },
  // Result
  resultCard: { margin: 16, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1 },
  resultTitle: { fontSize: 20, fontWeight: '700', marginTop: 10 },
});
