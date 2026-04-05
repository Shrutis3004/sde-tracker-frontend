import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const TOUR_STEPS = [
  {
    title: 'Welcome to SDE Tracker!',
    desc: 'Your one-stop app to master DSA with Striver\'s sheets. Let us show you around!',
    icon: 'rocket',
    position: 'center',
  },
  {
    title: 'Filter by Category',
    desc: 'Use these tabs to filter content — DSA Sheets, Core CS, System Design, Playlists, CP, and Blogs.',
    icon: 'filter',
    position: 'top',
  },
  {
    title: 'DSA Sheets',
    desc: 'Access all 4 Striver sheets — SDE, A2Z, Blind 75, and Striver 79. Tap "Sheet" to start solving!',
    icon: 'layers',
    position: 'middle',
  },
  {
    title: 'Search Problems',
    desc: 'Tap the search icon in the header to instantly find any problem across all 940+ questions.',
    icon: 'search',
    position: 'top',
  },
  {
    title: 'Bookmarks',
    desc: 'Save problems for later! Tap the bookmark icon on any problem to add it to your personal list.',
    icon: 'bookmark',
    position: 'top',
  },
  {
    title: 'Daily Goals & Streak',
    desc: 'Set a daily target and build your streak. Track your activity on a GitHub-style heatmap!',
    icon: 'flame',
    position: 'top',
  },
  {
    title: 'Track Your Progress',
    desc: 'Mark problems as Solved, Revisit, or Unsolved. Add personal notes with your approach.',
    icon: 'checkmark-done',
    position: 'middle',
  },
  {
    title: 'Difficulty Filter',
    desc: 'Tap any Easy, Medium, or Hard badge on a problem to instantly filter by that difficulty. Tap ✕ to clear.',
    icon: 'options',
    position: 'middle',
  },
  {
    title: 'AI Hints',
    desc: 'Stuck on a problem? Tap the 💡 lightbulb icon to get 3 progressive hints — Approach, Algorithm, and Implementation.',
    icon: 'bulb',
    position: 'middle',
  },
  {
    title: 'Mock Interview',
    desc: 'Simulate a real coding interview! Pick a topic, difficulty, and number of problems. A countdown timer keeps the pressure on.',
    icon: 'timer',
    position: 'middle',
  },
  {
    title: 'Theme Settings',
    desc: 'Customize colors, toggle dark/light mode, and make the app yours. Find it in Profile.',
    icon: 'color-palette',
    position: 'middle',
  },
  {
    title: 'You\'re All Set!',
    desc: 'Start solving and track your progress. Consistency is key — one decision can change your career!',
    icon: 'trophy',
    position: 'center',
  },
];

const storage = {
  getItem: (key) => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return null;
  },
  setItem: (key, val) => {
    if (Platform.OS === 'web') localStorage.setItem(key, val);
  },
};

export default function AppTour({ onComplete }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = storage.getItem('tour_completed');
    if (!seen) setVisible(true);
  }, []);

  const finish = () => {
    setVisible(false);
    storage.setItem('tour_completed', 'true');
    onComplete?.();
  };

  const next = () => {
    if (step >= TOUR_STEPS.length - 1) finish();
    else setStep(step + 1);
  };

  const skip = () => finish();

  if (!visible) return null;

  const s = TOUR_STEPS[step];
  const isFirst = step === 0;
  const isLast = step === TOUR_STEPS.length - 1;
  const progress = ((step + 1) / TOUR_STEPS.length) * 100;

  return (
    <View style={styles.overlay}>
      <View style={[
        styles.card,
        s.position === 'top' && styles.cardTop,
        s.position === 'center' && styles.cardCenter,
        s.position === 'middle' && styles.cardMiddle,
      ]}>
        {/* Icon */}
        <LinearGradient
          colors={['#3BA8D4', '#62c1e5', '#a0d9ef']}
          style={styles.iconCircle}
        >
          <Ionicons name={s.icon} size={28} color="#fff" />
        </LinearGradient>

        {/* Step indicator */}
        <Text style={styles.stepLabel}>Step {step + 1} of {TOUR_STEPS.length}</Text>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <LinearGradient
            colors={['#3BA8D4', '#62c1e5', '#a0d9ef']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progress}%` }]}
          />
        </View>

        {/* Content */}
        <Text style={styles.title}>{s.title}</Text>
        <Text style={styles.desc}>{s.desc}</Text>

        {/* Buttons */}
        <View style={styles.btnRow}>
          {!isLast && (
            <TouchableOpacity onPress={skip} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip Tour</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={next} style={{ flex: 1 }}>
            <LinearGradient
              colors={['#3BA8D4', '#62c1e5', '#a0d9ef']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextBtn}
            >
              <Text style={styles.nextText}>
                {isFirst ? 'Start Tour' : isLast ? 'Get Started!' : 'Next'}
              </Text>
              {!isLast && <Ionicons name="arrow-forward" size={16} color="#fff" />}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Dots */}
        <View style={styles.dots}>
          {TOUR_STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === step && styles.dotActive, i < step && styles.dotDone]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    marginHorizontal: 24,
    maxWidth: 380,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  cardTop: { position: 'absolute', top: 100 },
  cardCenter: {},
  cardMiddle: { position: 'absolute', top: '30%' },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E8E8E8',
    borderRadius: 2,
    marginBottom: 18,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  skipBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  skipText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  nextBtn: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  nextText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  dotActive: {
    backgroundColor: '#3BA8D4',
    width: 20,
  },
  dotDone: {
    backgroundColor: '#a0d9ef',
  },
});
