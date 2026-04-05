import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Linking, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const getDiffColor = (d) => d === 'Easy' ? '#00E676' : d === 'Medium' ? '#FFD600' : d === 'Hard' ? '#FF5252' : '#888';

export default function HeaderSearch({ navigation }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 500;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const doSearch = async (text) => {
    setQuery(text);
    if (text.length < 2) { setResults([]); return; }
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(text)}`);
      setResults((res.data || []).slice(0, 6));
    } catch { setResults([]); }
  };

  const close = () => { setOpen(false); setQuery(''); setResults([]); };

  if (!open) {
    return (
      <View style={st.row}>
        <TouchableOpacity onPress={() => setOpen(true)} style={st.iconBtn}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Bookmarks')} style={st.iconBtn}>
          <Ionicons name="bookmark-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Goals')} style={st.iconBtn}>
          <Ionicons name="flame-outline" size={20} color="#fff" />
        </TouchableOpacity>
        {!isMobile && (
          <View style={st.tagline}>
            <Text style={st.taglineText}>One Decision Can Change Your Career</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={st.searchWrap}>
      <View style={st.searchPill}>
        <Ionicons name="search" size={14} color="#3BA8D4" />
        <TextInput
          style={st.searchInput}
          placeholder="Search problems..."
          placeholderTextColor="#aaa"
          value={query}
          onChangeText={doSearch}
          autoFocus
        />
        <TouchableOpacity onPress={close}>
          <Ionicons name="close" size={16} color="#999" />
        </TouchableOpacity>
      </View>
      {results.length > 0 && (
        <View style={st.dropdown}>
          {results.map((r, i) => (
            <TouchableOpacity key={i} style={st.resultRow} onPress={() => { r.url && Linking.openURL(r.url); close(); }}>
              <View style={[st.dot, { backgroundColor: getDiffColor(r.difficulty) }]} />
              <Text style={st.resultText} numberOfLines={1}>{r.title}</Text>
              <Text style={[st.diffText, { color: getDiffColor(r.difficulty) }]}>{r.difficulty}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginRight: 10 },
  iconBtn: { padding: 4 },
  tagline: { backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4 },
  taglineText: { color: '#B8860B', fontSize: 9, fontWeight: '700', fontStyle: 'italic' },
  searchWrap: { marginRight: 10, position: 'relative' },
  searchPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 12, height: 32, gap: 6, minWidth: 200 },
  searchInput: { flex: 1, fontSize: 13, color: '#333', paddingVertical: 0, outlineStyle: 'none' },
  dropdown: { position: 'absolute', top: 38, right: 0, width: 300, backgroundColor: '#fff', borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 10, overflow: 'hidden' },
  resultRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  resultText: { flex: 1, fontSize: 13, color: '#333', fontWeight: '500' },
  diffText: { fontSize: 11, fontWeight: '600' },
});
