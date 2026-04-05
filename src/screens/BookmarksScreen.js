import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Linking, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function BookmarksScreen() {
  const { theme } = useTheme();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookmarks = async () => {
    try {
      const res = await api.get('/bookmarks');
      setBookmarks(res.data || []);
    } catch { }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchBookmarks(); }, []));

  const removeBookmark = (id) => {
    Alert.alert('Remove Bookmark', 'Remove this problem from bookmarks?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/bookmarks/${id}`);
            setBookmarks((prev) => prev.filter((b) => b.id !== id));
          } catch { Alert.alert('Error', 'Failed to remove'); }
        },
      },
    ]);
  };

  const getDiffColor = (d) => d === 'Easy' ? '#00E676' : d === 'Medium' ? '#FFD600' : d === 'Hard' ? '#FF5252' : '#6B6B80';

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
      <View style={[styles.strip, { backgroundColor: getDiffColor(item.problem?.difficulty) }]} />
      <View style={styles.cardBody}>
        <Text style={[styles.title, { color: theme.headingColor }]} numberOfLines={1}>{item.problem?.title}</Text>
        <View style={styles.meta}>
          <View style={[styles.badge, { backgroundColor: getDiffColor(item.problem?.difficulty) + '20' }]}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: getDiffColor(item.problem?.difficulty) }}>{item.problem?.difficulty}</Text>
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => item.problem?.url && Linking.openURL(item.problem.url)} style={[styles.iconBtn, { backgroundColor: theme.primary }]}>
          <Ionicons name="open-outline" size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => removeBookmark(item.id)} style={[styles.iconBtn, { backgroundColor: '#F4433620' }]}>
          <Ionicons name="trash-outline" size={16} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <View style={[styles.center, { backgroundColor: theme.background }]}><ActivityIndicator size="large" color={theme.primary} /></View>;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {bookmarks.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="bookmark-outline" size={48} color={theme.textMuted} />
          <Text style={{ color: theme.textMuted, marginTop: 12, fontSize: 15 }}>No bookmarks yet</Text>
          <Text style={{ color: theme.textMuted, marginTop: 4, fontSize: 12 }}>Tap the bookmark icon on any problem to save it here</Text>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookmarks(); }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, marginBottom: 8, overflow: 'hidden' },
  strip: { width: 4, alignSelf: 'stretch', borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
  cardBody: { flex: 1, padding: 12 },
  title: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  meta: { flexDirection: 'row', gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  actions: { flexDirection: 'row', gap: 8, paddingRight: 12 },
  iconBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
});
