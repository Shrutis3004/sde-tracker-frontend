import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTopics, getProgress } from '../services/api';

const ACCENT_COLORS = ['#7C5CFC', '#4ECDC4', '#FF8A65', '#FF6B9D', '#64B5F6', '#FFD54F'];
const CARD = 'rgba(255,255,255,0.08)';
const CARD_BORDER = 'rgba(255,255,255,0.15)';

export default function TopicsScreen({ navigation }) {
  const { theme } = useTheme();
  const [topics, setTopics] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [topicsRes, progressRes] = await Promise.all([getTopics(), getProgress()]);
      setTopics(topicsRes.data);
      const map = {};
      progressRes.data.forEach((p) => { map[p.problem_id] = p.status; });
      setProgressMap(map);
    } catch (error) {
      console.log('Failed to fetch topics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const getTopicProgress = (topic) => {
    if (!topic.problems) return { solved: 0, total: 0 };
    const total = topic.problems.length;
    const solved = topic.problems.filter((p) => progressMap[p.id] === 'solved').length;
    return { solved, total };
  };

  const renderTopic = ({ item, index }) => {
    const { solved, total } = getTopicProgress(item);
    const percent = total > 0 ? Math.round((solved / total) * 100) : 0;
    const isComplete = percent === 100;
    const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];

    return (
      <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <View style={[styles.cardAccent, { backgroundColor: accent }]} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.dayLabel, { color: theme.textMuted }]}>Day {index + 1}</Text>
              <Text style={[styles.topicName, { color: theme.headingColor }]}>{item.name}</Text>
            </View>
            {isComplete && <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />}
          </View>
          <View style={styles.progressRow}>
            <View style={[styles.progressBar, { backgroundColor: theme.surfaceLight }]}>
              <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: accent }]} />
            </View>
            <Text style={[styles.progressText, { color: theme.textMuted }]}>{solved}/{total}</Text>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.btnSheet, { backgroundColor: accent + '25', borderColor: accent }]}
              onPress={() => navigation.navigate('Problems', { topicId: item.id, topicName: item.name, problems: item.problems || [] })}
            >
              <Text style={[styles.btnSheetText, { color: accent }]}>Sheet</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnTrack, { backgroundColor: accent }]}
              onPress={() => navigation.navigate('Problems', { topicId: item.id, topicName: item.name, problems: item.problems || [] })}
            >
              <Text style={styles.btnTrackText}>Track</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        data={topics}
        renderItem={renderTopic}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', gap: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: CARD_BORDER,
    maxWidth: '49%',
  },
  cardAccent: { height: 4 },
  cardContent: { padding: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  dayLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 },
  topicName: { fontSize: 14, fontWeight: '600', lineHeight: 19 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  progressBar: { flex: 1, height: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 11, fontWeight: '600', width: 30, textAlign: 'right' },
  buttonRow: { flexDirection: 'row', gap: 8 },
  btnSheet: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
  btnSheetText: { fontWeight: '600', fontSize: 12 },
  btnTrack: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  btnTrackText: { color: '#fff', fontWeight: '600', fontSize: 12 },
});
