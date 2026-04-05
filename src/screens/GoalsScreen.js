import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

function getColor(count, target) {
  if (count === 0) return 'rgba(255,255,255,0.06)';
  const ratio = Math.min(count / Math.max(target, 1), 1);
  if (ratio < 0.25) return '#0e4429';
  if (ratio < 0.5) return '#006d32';
  if (ratio < 0.75) return '#26a641';
  return '#39d353';
}

function buildHeatmapData(solves, target) {
  const today = new Date();
  const data = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const count = solves[key] || 0;
    data.push({ date: key, count, day: d.getDay(), color: getColor(count, target) });
  }
  return data;
}

function Heatmap({ solves, target, theme }) {
  const data = buildHeatmapData(solves, target);
  // Group into weeks (columns)
  const weeks = [];
  let week = new Array(7).fill(null);
  data.forEach((d) => {
    const dayIdx = d.day === 0 ? 6 : d.day - 1; // Mon=0
    week[dayIdx] = d;
    if (d.day === 0) { weeks.push(week); week = new Array(7).fill(null); }
  });
  if (week.some(Boolean)) weeks.push(week);

  // Month labels
  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((w, wi) => {
    const cell = w.find(Boolean);
    if (cell) {
      const m = new Date(cell.date).getMonth();
      if (m !== lastMonth) { monthLabels.push({ index: wi, label: MONTHS[m] }); lastMonth = m; }
    }
  });

  return (
    <View>
      {/* Month labels */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={{ flexDirection: 'row', marginBottom: 4, marginLeft: 28 }}>
            {weeks.map((_, wi) => {
              const ml = monthLabels.find((m) => m.index === wi);
              return <Text key={wi} style={{ width: 14, fontSize: 9, color: theme.textMuted, textAlign: 'center' }}>{ml ? ml.label : ''}</Text>;
            })}
          </View>
          <View style={{ flexDirection: 'row' }}>
            {/* Day labels */}
            <View style={{ marginRight: 4 }}>
              {DAYS.map((d, i) => <Text key={i} style={{ height: 14, fontSize: 9, color: theme.textMuted, lineHeight: 14 }}>{d}</Text>)}
            </View>
            {/* Grid */}
            {weeks.map((w, wi) => (
              <View key={wi} style={{ flexDirection: 'column' }}>
                {w.map((cell, ci) => (
                  <View
                    key={ci}
                    style={{
                      width: 12, height: 12, borderRadius: 2, margin: 1,
                      backgroundColor: cell ? cell.color : 'transparent',
                    }}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      {/* Legend */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8, gap: 4 }}>
        <Text style={{ fontSize: 10, color: theme.textMuted, marginRight: 4 }}>Less</Text>
        {['rgba(255,255,255,0.06)', '#0e4429', '#006d32', '#26a641', '#39d353'].map((c, i) => (
          <View key={i} style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: c }} />
        ))}
        <Text style={{ fontSize: 10, color: theme.textMuted, marginLeft: 4 }}>More</Text>
      </View>
    </View>
  );
}

export default function GoalsScreen() {
  const { theme } = useTheme();
  const [target, setTarget] = useState(5);
  const [inputTarget, setInputTarget] = useState('5');
  const [solves, setSolves] = useState({});
  const [todayCount, setTodayCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalSolved, setTotalSolved] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [goalRes, heatmapRes, statsRes] = await Promise.all([
        api.get('/goals'),
        api.get('/goals/heatmap'),
        api.get('/stats'),
      ]);
      const t = goalRes.data?.target || 5;
      setTarget(t);
      setInputTarget(String(t));

      const solvesMap = {};
      (heatmapRes.data || []).forEach((s) => { solvesMap[s.date] = s.count; });
      setSolves(solvesMap);

      const today = new Date().toISOString().split('T')[0];
      setTodayCount(solvesMap[today] || 0);
      setStreak(statsRes.data?.streak || 0);
      setTotalSolved(statsRes.data?.solved || 0);
    } catch { }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const saveGoal = async () => {
    const val = parseInt(inputTarget) || 5;
    try {
      await api.put('/goals', { target: val });
      setTarget(val);
      Alert.alert('Goal Updated', `Daily target set to ${val} problems`);
    } catch { Alert.alert('Error', 'Failed to save goal'); }
  };

  if (loading) {
    return <View style={[styles.center, { backgroundColor: theme.background }]}><ActivityIndicator size="large" color={theme.primary} /></View>;
  }

  const todayPct = Math.min((todayCount / Math.max(target, 1)) * 100, 100);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Today's Progress */}
      <View style={[styles.section, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Progress</Text>
        <View style={styles.todayRow}>
          <View style={styles.todayCircle}>
            <LinearGradient colors={['#3BA8D4', '#62c1e5', '#a0d9ef']} style={styles.todayCircleBg}>
              <Text style={styles.todayCount}>{todayCount}</Text>
              <Text style={styles.todayTarget}>/ {target}</Text>
            </LinearGradient>
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${todayPct}%` }]} />
            </View>
            <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 6 }}>
              {todayCount >= target ? 'Goal completed! Great job!' : `${target - todayCount} more to go`}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <Ionicons name="flame" size={24} color="#FFD700" />
          <Text style={[styles.statNum, { color: '#FFD700' }]}>{streak}</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Day Streak</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <Ionicons name="checkmark-done" size={24} color="#4CAF50" />
          <Text style={[styles.statNum, { color: '#4CAF50' }]}>{totalSolved}</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Solved</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <Ionicons name="trophy" size={24} color={theme.primary} />
          <Text style={[styles.statNum, { color: theme.primary }]}>{target}</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Daily Goal</Text>
        </View>
      </View>

      {/* Set Goal */}
      <View style={[styles.section, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Set Daily Goal</Text>
        <View style={styles.goalRow}>
          {[3, 5, 7, 10, 15].map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.goalChip, inputTarget === String(v) && { backgroundColor: theme.primary, borderColor: theme.primary }]}
              onPress={() => setInputTarget(String(v))}
            >
              <Text style={[styles.goalChipText, { color: inputTarget === String(v) ? '#fff' : theme.textSecondary }]}>{v}</Text>
            </TouchableOpacity>
          ))}
          <TextInput
            style={[styles.goalInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surfaceLight }]}
            value={inputTarget}
            onChangeText={setInputTarget}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>
        <TouchableOpacity onPress={saveGoal}>
          <LinearGradient colors={['#3BA8D4', '#62c1e5', '#a0d9ef']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Save Goal</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Heatmap */}
      <View style={[styles.section, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Activity Heatmap</Text>
        <Heatmap solves={solves} target={target} theme={theme} />
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: { marginHorizontal: 16, marginTop: 16, borderRadius: 14, padding: 18, borderWidth: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  todayRow: { flexDirection: 'row', alignItems: 'center' },
  todayCircle: { width: 80, height: 80 },
  todayCircleBg: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  todayCount: { fontSize: 28, fontWeight: '800', color: '#fff' },
  todayTarget: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: -4 },
  progressBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#39d353', borderRadius: 4 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 16, gap: 10 },
  statCard: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, gap: 4 },
  statNum: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 10 },
  goalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  goalChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  goalChipText: { fontSize: 14, fontWeight: '600' },
  goalInput: { width: 50, height: 36, borderRadius: 8, borderWidth: 1, textAlign: 'center', fontSize: 14, fontWeight: '600' },
  saveBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
