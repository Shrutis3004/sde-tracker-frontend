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
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { getProgress } from '../services/api';
import api from '../services/api';

const ACCENT_COLORS = [
  '#7C5CFC',
  '#4ECDC4',
  '#FF8A65',
  '#FF6B9D',
  '#64B5F6',
  '#FFD54F',
];

export default function SheetTopicsScreen({ route, navigation }) {
  const { slug, name } = route.params;
  const { theme } = useTheme();
  const [topics, setTopics] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [diffFilter, setDiffFilter] = useState('All');

  const fetchData = async () => {
    try {
      const params = diffFilter !== 'All' ? `?difficulty=${diffFilter}` : '';
      const [sheetRes, progressRes] = await Promise.all([
        api.get(`/sheets/${slug}${params}`),
        getProgress(),
      ]);
      setTopics(sheetRes.data.topics || []);

      const map = {};
      progressRes.data.forEach((p) => {
        map[p.problem_id] = p.status;
      });
      setProgressMap(map);
    } catch (error) {
      console.log('Failed to fetch sheet topics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [diffFilter])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getTopicProgress = (topic) => {
    if (!topic.problems) return { solved: 0, total: 0 };
    const total = topic.problems.length;
    const solved = topic.problems.filter(
      (p) => progressMap[p.id] === 'solved'
    ).length;
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
            <View style={styles.cardTitleArea}>
              <Text style={[styles.topicName, { color: theme.headingColor }]}>{item.name}</Text>
              <Text style={[styles.problemCount, { color: theme.textMuted }]}>{total} problems</Text>
            </View>
            {isComplete && (
              <Ionicons name="checkmark-circle" size={22} color={theme.success} />
            )}
          </View>

          <View style={styles.progressRow}>
            <View style={[styles.progressBar, { backgroundColor: theme.surfaceLight }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${percent}%`, backgroundColor: accent },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.textMuted }]}>{solved}/{total}</Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.btnSheet, { backgroundColor: accent + '20', borderColor: accent }]}
              onPress={() =>
                navigation.navigate('Problems', {
                  topicId: item.id,
                  topicName: item.name,
                  problems: item.problems || [],
                })
              }
            >
              <Text style={[styles.btnSheetText, { color: accent }]}>Sheet</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnTrack, { backgroundColor: accent }]}
              onPress={() =>
                navigation.navigate('Problems', {
                  topicId: item.id,
                  topicName: item.name,
                  problems: item.problems || [],
                })
              }
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
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const FILTERS = ['All', 'Easy', 'Medium', 'Hard'];
  const FILTER_COLORS = { All: ['#3BA8D4', '#a0d9ef'], Easy: ['#00C853', '#69F0AE'], Medium: ['#FFB300', '#FFD54F'], Hard: ['#E53935', '#FF8A80'] };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Difficulty Filter */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = diffFilter === f;
          if (active) {
            return (
              <TouchableOpacity key={f} onPress={() => setDiffFilter(f)}>
                <LinearGradient colors={FILTER_COLORS[f]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.filterPill}>
                  <Text style={styles.filterTextActive}>{f}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity key={f} style={[styles.filterPill, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]} onPress={() => setDiffFilter(f)}>
              <Text style={[styles.filterText, { color: theme.textMuted }]}>{f}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <FlatList
        data={topics}
        renderItem={renderTopic}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  filterText: { fontSize: 13, fontWeight: '600' },
  filterTextActive: { fontSize: 13, fontWeight: '600', color: '#fff' },
  list: {
    padding: 16,
  },
  card: {
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    flexDirection: 'row',
  },
  cardAccent: {
    width: 5,
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardTitleArea: {
    flex: 1,
    marginRight: 8,
  },
  topicName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  problemCount: {
    fontSize: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    width: 35,
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btnSheet: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  btnSheetText: {
    fontWeight: '600',
    fontSize: 13,
  },
  btnTrack: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnTrackText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});
