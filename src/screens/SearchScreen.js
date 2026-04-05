import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, Linking, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function SearchScreen() {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async (text) => {
    setQuery(text);
    if (text.length < 2) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(text)}`);
      setResults(res.data || []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  };

  const getDiffColor = (d) => d === 'Easy' ? '#00E676' : d === 'Medium' ? '#FFD600' : d === 'Hard' ? '#FF5252' : '#6B6B80';

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
      onPress={() => item.url && Linking.openURL(item.url)}
      activeOpacity={0.7}
    >
      <View style={[styles.strip, { backgroundColor: getDiffColor(item.difficulty) }]} />
      <View style={styles.cardBody}>
        <Text style={[styles.title, { color: theme.headingColor }]} numberOfLines={1}>{item.title}</Text>
        <View style={styles.meta}>
          <View style={[styles.badge, { backgroundColor: getDiffColor(item.difficulty) + '20' }]}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: getDiffColor(item.difficulty) }}>{item.difficulty}</Text>
          </View>
          {item.topic_name && (
            <Text style={{ fontSize: 11, color: theme.textMuted }}>{item.topic_name}</Text>
          )}
        </View>
      </View>
      <Ionicons name="open-outline" size={16} color={theme.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="search" size={20} color={theme.textMuted} />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Search problems, topics..."
          placeholderTextColor={theme.textMuted}
          value={query}
          onChangeText={doSearch}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
            <Ionicons name="close-circle" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 20 }} color={theme.primary} />}

      {!loading && searched && results.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={48} color={theme.textMuted} />
          <Text style={{ color: theme.textMuted, marginTop: 12, fontSize: 15 }}>No results found</Text>
        </View>
      )}

      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: 16, paddingHorizontal: 14, height: 48, borderRadius: 12, borderWidth: 1, gap: 10 },
  input: { flex: 1, fontSize: 15 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, marginBottom: 8, overflow: 'hidden' },
  strip: { width: 4, alignSelf: 'stretch', borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
  cardBody: { flex: 1, padding: 12 },
  title: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  empty: { alignItems: 'center', marginTop: 60 },
});
