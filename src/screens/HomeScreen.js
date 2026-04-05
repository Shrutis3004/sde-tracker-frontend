import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { getSheets } from '../services/api';
import api from '../services/api';
import AppTour from '../components/AppTour';

const NAV_TABS = ['All', 'DSA Sheets', 'Core CS Subjects', 'System Design', 'DSA Playlist', 'Competitive Programming', 'Blogs'];

const CATEGORIES = [
  { id: 'dsa', label: 'DSA Sheets', icon: 'layers', gradient: ['#7C5CFC', '#A78BFA'] },
  { id: 'interview', label: 'Interview Experience', icon: 'briefcase', gradient: ['#4ECDC4', '#7EDDD6'] },
  { id: 'corecs', label: 'Core CS Subjects', icon: 'hardware-chip', gradient: ['#FF8A65', '#FFB899'] },
  { id: 'sysdesign', label: 'System Design', icon: 'git-network', gradient: ['#FF6B9D', '#FF9DBF'] },
];

const CORE_CS = [
  { name: 'CN Sheet', desc: 'Most Asked Computer Networks Interview Questions', slug: 'cn-sheet' },
  { name: 'DBMS Sheet', desc: 'Most Asked DBMS Interview Questions', slug: 'dbms-sheet' },
  { name: 'OS Sheet', desc: 'Most Asked Operating System Interview Questions', slug: 'os-sheet' },
];

const DSA_PLAYLIST = [
  { name: 'Array', desc: 'Learn from Basics to Advanced' },
  { name: 'Binary Search', desc: 'Learn from Basics to Advanced' },
  { name: 'Dynamic Programming', desc: 'Learn from Basics to Advanced' },
  { name: 'Graphs', desc: 'Learn from Basics to Advanced' },
  { name: 'Linked Lists', desc: 'Learn from Basics to Advanced' },
  { name: 'Recursion', desc: 'Learn from Basics to Advanced' },
  { name: 'Stack and Queue', desc: 'Learn from Basics to Advanced' },
  { name: 'Strings', desc: 'Learn from Basics to Advanced' },
  { name: 'Trees', desc: 'Learn from Basics to Advanced' },
];

const BLOGS = [
  'Arrays', 'Introduction to DSA', 'Binary Search', 'Binary Search Tree',
  'Binary Tree', 'Bit Manipulation', 'C++', 'CS Core',
  'Data Structures', 'Dynamic Programming', 'Graph', 'Greedy',
  'Hashing', 'Heap', 'Interview Experience', 'Java',
  'Javascript', 'Linked List', 'Maths', 'Python',
  'Queue', 'Recursion', 'Sliding Window', 'Sorting',
  'Stack', 'String', 'Trie', 'Two Pointer',
];

const SHEET_COLORS = ['#7C5CFC', '#4ECDC4', '#FF8A65', '#FF6B9D'];
// Fallback colors for static stylesheet — overridden inline with theme values
const CARD = '#1C1C2B';
const CARD_BORDER = '#2A2A3D';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');

  const isDesktop = width > 700;
  const gap = 10;
  const padding = 12;
  const cardW = isDesktop ? 175 : Math.floor((width - padding * 2 - gap) / 2) - 2;

  const fetchData = async () => {
    try {
      const sheetsRes = await getSheets();
      setSheets(sheetsRes.data);
    } catch (error) {
      console.log('Failed to fetch data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchData(); };


  const getDiffColor = (d) => d === 'Easy' ? '#00E676' : d === 'Medium' ? '#FFD600' : d === 'Hard' ? '#FF5252' : '#6B6B80';

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const dsaSheets = sheets.filter(sh => ['sde-sheet', 'a2z-sheet', 'blind-75', 'striver-79'].includes(sh.slug));
  const show = (section) => activeTab === 'All' || activeTab === section;

  const HorizontalOrWrap = ({ children }) => {
    return <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: padding, gap }}>{children}</View>;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
    <AppTour />
    <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

      {/* Search Bar or Nav Tabs */}
      <View style={s.tabsRow}>
        {NAV_TABS.map((tab) => {
          const active = activeTab === tab;
          if (active) {
            return (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#3BA8D4', '#62c1e5', '#a0d9ef']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.tabGradient}
                >
                  <Text style={s.tabTextGradient}>{tab}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity key={tab} style={[s.tab, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setActiveTab(tab)}>
              <Text style={[s.tabText, { color: theme.textMuted }]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Categories */}
      {show('DSA Sheets') && (
        <>
          <View style={s.sectionRow}><LinearGradient colors={['#3BA8D4', '#62c1e5', '#a0d9ef']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.sectionPill}><Text style={s.sectionText}>Categories</Text></LinearGradient></View>
          <View style={s.catRow}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity key={c.id} style={s.catCard} activeOpacity={0.8}>
                <View style={s.catIconWrap}>
                  <LinearGradient
                    colors={c.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={s.catIconGradient}
                  >
                    <Ionicons name={c.icon} size={28} color="#fff" />
                    {/* Glossy shine overlay */}
                    <View style={s.glossy} />
                  </LinearGradient>
                </View>
                <Text style={[s.catLabel, { color: theme.textSecondary }]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* DSA Sheets */}
      {show('DSA Sheets') && (
        <View style={[s.sectionBlock, { borderLeftColor: '#7C5CFC' }]}>
          <View style={s.sectionRow}><LinearGradient colors={['#3BA8D4', '#62c1e5', '#a0d9ef']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.sectionPill}><Text style={s.sectionText}>DSA Sheets</Text></LinearGradient></View>
          <HorizontalOrWrap>
            {dsaSheets.map((sheet, i) => {
              const color = SHEET_COLORS[i % SHEET_COLORS.length];
              return (
                <View key={sheet.id} style={[s.card, { width: cardW, backgroundColor: theme.cardBg, borderColor: theme.cardBorder }, isDesktop && { flex: 1 }]}>
                  <View style={[s.cardStrip, { backgroundColor: color }]} />
                  <View style={s.cardBody}>
                    <Text style={[s.cardTitle, { color: theme.headingColor }]}>{sheet.name}</Text>
                    <Text style={[s.cardDesc, { color: theme.textMuted }]} numberOfLines={1}>{sheet.description}</Text>
                    <TouchableOpacity
                      style={[s.btnFilled, { backgroundColor: color }]}
                      onPress={() => navigation.navigate('SheetTopics', { slug: sheet.slug, name: sheet.name })}
                    >
                      <Text style={s.btnText}>Sheet</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </HorizontalOrWrap>
        </View>
      )}

      {/* Core CS */}
      {show('Core CS Subjects') && (
        <View style={[s.sectionBlock, { borderLeftColor: '#FF8A65' }]}>
          <View style={s.sectionRow}><LinearGradient colors={['#3BA8D4', '#62c1e5', '#a0d9ef']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.sectionPill}><Text style={s.sectionText}>Core Cs Subjects</Text></LinearGradient></View>
          <HorizontalOrWrap>
            {CORE_CS.map((item, i) => (
              <View key={i} style={[s.card, { width: cardW, backgroundColor: theme.cardBg, borderColor: theme.cardBorder }, isDesktop && { flex: 1 }]}>
                <View style={[s.cardStrip, { backgroundColor: '#FF8A65' }]} />
                <View style={s.cardBody}>
                  <View>
                    <Text style={[s.cardTitle, { color: theme.headingColor }]}>{item.name}</Text>
                    <Text style={[s.cardDesc, { color: theme.textMuted }]} numberOfLines={1}>{item.desc}</Text>
                  </View>
                  <TouchableOpacity style={[s.btnOutline, { backgroundColor: '#FFD5C2', borderColor: '#FFB899' }]} onPress={() => navigation.navigate('SheetTopics', { slug: item.slug, name: item.name })}>
                    <Text style={[s.btnOutlineText, { color: '#D4602C' }]}>Start Learning</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </HorizontalOrWrap>
        </View>
      )}

      {/* System Design */}
      {show('System Design') && (
        <View style={[s.sectionBlock, { borderLeftColor: '#FF6B9D' }]}>
          <View style={s.sectionRow}><LinearGradient colors={['#3BA8D4', '#62c1e5', '#a0d9ef']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.sectionPill}><Text style={s.sectionText}>System Design</Text></LinearGradient></View>
          <View style={{ paddingHorizontal: padding }}>
            <View style={[s.card, { width: cardW, backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <View style={[s.cardStrip, { backgroundColor: '#FF6B9D' }]} />
              <View style={s.cardBody}>
                <View>
                  <Text style={[s.cardTitle, { color: theme.headingColor }]}>System Design Sheet</Text>
                  <Text style={[s.cardDesc, { color: theme.textMuted }]} numberOfLines={1}>Master HLD from Basics to Advanced</Text>
                </View>
                <TouchableOpacity style={[s.btnOutline, { backgroundColor: '#FFD0E0', borderColor: '#FFB8D0' }]} onPress={() => navigation.navigate('SheetTopics', { slug: 'system-design-sheet', name: 'System Design Sheet' })}>
                  <Text style={[s.btnOutlineText, { color: '#CC3870' }]}>Start Learning</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* DSA Playlist */}
      {show('DSA Playlist') && (
        <View style={[s.sectionBlock, { borderLeftColor: '#4ECDC4' }]}>
          <View style={s.sectionRow}><LinearGradient colors={['#3BA8D4', '#62c1e5', '#a0d9ef']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.sectionPill}><Text style={s.sectionText}>DSA Playlist</Text></LinearGradient></View>
          <HorizontalOrWrap>
            {DSA_PLAYLIST.map((item, i) => (
              <View key={i} style={[s.card, { width: cardW, backgroundColor: theme.cardBg, borderColor: theme.cardBorder }, isDesktop && { flex: 1 }]}>
                <View style={[s.cardStrip, { backgroundColor: '#4ECDC4' }]} />
                <View style={s.cardBody}>
                  <View>
                    <Text style={[s.cardTitle, { color: theme.headingColor }]}>{item.name}</Text>
                    <Text style={[s.cardDesc, { color: theme.textMuted }]} numberOfLines={1}>{item.desc}</Text>
                  </View>
                  <TouchableOpacity style={[s.btnOutline, { backgroundColor: '#C5F0EC', borderColor: '#B2E8E3' }]} onPress={() => navigation.navigate('SheetTopics', { slug: 'a2z-sheet', name: 'A2Z DSA Sheet' })}>
                    <Text style={[s.btnOutlineText, { color: '#2A9D8F' }]}>Start Learning</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </HorizontalOrWrap>
        </View>
      )}

      {/* Competitive Programming */}
      {show('Competitive Programming') && (
        <View style={[s.sectionBlock, { borderLeftColor: '#7C5CFC' }]}>
          <View style={s.sectionRow}><LinearGradient colors={['#3BA8D4', '#62c1e5', '#a0d9ef']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.sectionPill}><Text style={s.sectionText}>Competitive Programming</Text></LinearGradient></View>
          <View style={{ paddingHorizontal: padding }}>
            <View style={[s.card, { width: cardW, backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <View style={[s.cardStrip, { backgroundColor: '#7C5CFC' }]} />
              <View style={s.cardBody}>
                <View>
                  <Text style={[s.cardTitle, { color: theme.headingColor }]}>CP Sheet</Text>
                  <Text style={[s.cardDesc, { color: theme.textMuted }]} numberOfLines={1}>Level up your CP with our curated sheet</Text>
                </View>
                <TouchableOpacity style={[s.btnOutline, { backgroundColor: '#DDD6FE', borderColor: '#C4B5FD' }]} onPress={() => navigation.navigate('SheetTopics', { slug: 'cp-sheet', name: 'CP Sheet' })}>
                  <Text style={[s.btnOutlineText, { color: '#5B3FD4' }]}>Start Learning</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Blogs */}
      {show('Blogs') && (
        <View style={[s.sectionBlock, { borderLeftColor: '#3BA8D4' }]}>
          <View style={s.sectionRow}><LinearGradient colors={['#3BA8D4', '#62c1e5', '#a0d9ef']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.sectionPill}><Text style={s.sectionText}>Blogs</Text></LinearGradient></View>
          <View style={s.blogsGrid}>
            {BLOGS.map((blog, i) => (
              <TouchableOpacity key={i} style={[s.blogChip, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]} onPress={() => navigation.navigate('Blog', { category: blog })}>
                <View style={[s.blogStrip, { backgroundColor: '#3BA8D4' }]} />
                <Text style={[s.blogChipText, { color: theme.text }]}>{blog}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
  banner: { backgroundColor: 'rgba(30,26,14,0.5)', paddingVertical: 10, paddingHorizontal: 16 },
  bannerText: { color: '#C9953C', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  tabsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  searchPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingHorizontal: 12, height: 34, gap: 6, minWidth: 140 },
  searchPillInput: { flex: 1, fontSize: 13, paddingVertical: 0 },
  searchResult: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, borderWidth: 1, marginBottom: 6, overflow: 'hidden' },
  searchStrip: { width: 3, alignSelf: 'stretch' },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  tabGradient: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  tabText: { fontSize: 13, fontWeight: '500' },
  tabTextGradient: { color: '#fff', fontSize: 13, fontWeight: '600' },
  sectionBlock: { marginTop: 24, paddingBottom: 4 },
  sectionRow: { paddingHorizontal: 16, marginBottom: 14, flexDirection: 'row' },
  sectionPill: { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 20 },
  sectionText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  catRow: { flexDirection: 'row', paddingHorizontal: 16, justifyContent: 'space-between' },
  catCard: { alignItems: 'center', flex: 1 },
  catIconWrap: { marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  catIconGradient: { width: 64, height: 64, borderRadius: 18, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  glossy: { position: 'absolute', top: 0, left: 0, right: 0, height: '45%', backgroundColor: 'rgba(255,255,255,0.25)', borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  catLabel: { fontSize: 11, textAlign: 'center', fontWeight: '500', lineHeight: 14 },
  card: { backgroundColor: CARD, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: CARD_BORDER, flexDirection: 'row' },
  cardStrip: { width: 5, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  cardBody: { padding: 16, flex: 1, justifyContent: 'space-between' },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  cardDesc: { fontSize: 12, marginBottom: 18, lineHeight: 16 },
  btnFilled: { paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  btnOutline: { borderWidth: 1.5, borderColor: CARD_BORDER, borderRadius: 6, paddingVertical: 9, alignItems: 'center' },
  btnOutlineText: { fontSize: 13, fontWeight: '600' },
  blogsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  blogChip: { backgroundColor: CARD, borderRadius: 10, borderWidth: 1, borderColor: CARD_BORDER, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  blogStrip: { width: 4, alignSelf: 'stretch', borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
  blogChipText: { fontSize: 13, fontWeight: '600', paddingHorizontal: 14, paddingVertical: 10 },
});
