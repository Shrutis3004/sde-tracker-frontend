import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getStats } from '../services/api';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const fetchStats = async () => {
    try {
      const response = await getStats();
      setStats(response.data);
    } catch (error) {
      console.log('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';
  const pct = stats ? Math.round((stats.solved / stats.total_problems) * 100) : 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={[styles.name, { color: theme.text }]}>{user?.name}</Text>
        <Text style={[styles.email, { color: theme.textSecondary }]}>{user?.email}</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
          <Text style={[styles.statValue, { color: theme.streak }]}>{stats?.streak || 0}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Day Streak</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
          <Text style={[styles.statValue, { color: theme.success }]}>{stats?.solved || 0}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Solved</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
          <Text style={[styles.statValue, { color: theme.warning }]}>{stats?.revisit || 0}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Revisit</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
          <Text style={[styles.statValue, { color: theme.primary }]}>{stats?.total_problems || 0}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total</Text>
        </View>
      </View>

      {/* Completion */}
      <View style={[styles.completionCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
        <Text style={[styles.completionTitle, { color: theme.text }]}>Overall Completion</Text>
        <View style={[styles.progressBar, { backgroundColor: theme.surfaceLight }]}>
          <View style={[styles.progressFill, { backgroundColor: theme.primary, width: `${pct}%` }]} />
        </View>
        <Text style={[styles.completionText, { color: theme.textSecondary }]}>{pct}% complete</Text>
      </View>

      {/* Menu Items */}
      <TouchableOpacity style={[styles.settingsButton, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]} onPress={() => navigation.navigate('Goals')}>
        <View style={styles.settingsRow}>
          <Ionicons name="flame-outline" size={22} color="#FFD700" />
          <Text style={[styles.settingsText, { color: theme.text }]}>Daily Goals & Streak</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.settingsButton, { backgroundColor: theme.surface, borderColor: theme.cardBorder, marginTop: 10 }]} onPress={() => navigation.navigate('Bookmarks')}>
        <View style={styles.settingsRow}>
          <Ionicons name="bookmark-outline" size={22} color="#FFD700" />
          <Text style={[styles.settingsText, { color: theme.text }]}>Bookmarks</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.settingsButton, { backgroundColor: theme.surface, borderColor: theme.cardBorder, marginTop: 10 }]} onPress={() => navigation.navigate('MockInterview')}>
        <View style={styles.settingsRow}>
          <Ionicons name="timer-outline" size={22} color="#FF8A65" />
          <Text style={[styles.settingsText, { color: theme.text }]}>Mock Interview</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.settingsButton, { backgroundColor: theme.surface, borderColor: theme.cardBorder, marginTop: 10 }]} onPress={() => navigation.navigate('Search')}>
        <View style={styles.settingsRow}>
          <Ionicons name="search-outline" size={22} color={theme.primary} />
          <Text style={[styles.settingsText, { color: theme.text }]}>Search Problems</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.settingsButton, { backgroundColor: theme.surface, borderColor: theme.cardBorder, marginTop: 10 }]} onPress={() => navigation.navigate('ThemeSettings')}>
        <View style={styles.settingsRow}>
          <Ionicons name="color-palette-outline" size={22} color={theme.primary} />
          <Text style={[styles.settingsText, { color: theme.text }]}>Theme Settings</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: theme.error + '20', borderColor: theme.error + '40' }]}
        onPress={handleLogout}
      >
        <Text style={[styles.logoutText, { color: theme.error }]}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  completionCard: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  completionText: {
    fontSize: 13,
    marginTop: 8,
  },
  settingsButton: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsText: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
