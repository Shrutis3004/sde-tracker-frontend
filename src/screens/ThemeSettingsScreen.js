import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

function ColorCircle({ color, selected, onPress, size = 36 }) {
  const checkColor = (color === '#FFFFFF' || color === '#FFD54F' || color === '#F5F5FA') ? '#000' : '#FFF';
  return (
    <TouchableOpacity onPress={onPress} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, borderWidth: selected ? 3 : 1, borderColor: selected ? '#fff' : 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
      {selected && <Ionicons name="checkmark" size={size * 0.45} color={checkColor} />}
    </TouchableOpacity>
  );
}

function Section({ title, children, theme }) {
  return (
    <View style={[styles.section, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      {children}
    </View>
  );
}

export default function ThemeSettingsScreen() {
  const {
    theme, isDark, accent, headingColor, sectionTitleColor, buttonColor, cardBg,
    toggleDarkMode, setAccentColor, updateHeadingColor, updateSectionTitleColor, updateButtonColor, updateCardBg,
    ACCENT_PRESETS, HEADING_PRESETS, BUTTON_PRESETS, CARD_BG_OPTIONS,
  } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Live Preview */}
      <Section title="Live Preview" theme={theme}>
        <View style={[styles.previewCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={{ height: 4, backgroundColor: theme.primary }} />
          <View style={{ padding: 14 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.headingColor, marginBottom: 4 }}>Preview Heading</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: theme.sectionTitleColor, marginBottom: 4 }}>Section Title</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 12 }}>Description text looks like this</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1, backgroundColor: theme.buttonColor, paddingVertical: 7, borderRadius: 6, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Button</Text>
              </View>
              <View style={{ flex: 1, borderWidth: 1.5, borderColor: theme.buttonColor, paddingVertical: 7, borderRadius: 6, alignItems: 'center' }}>
                <Text style={{ color: theme.buttonColor, fontSize: 12, fontWeight: '600' }}>Outline</Text>
              </View>
            </View>
          </View>
        </View>
      </Section>

      {/* Dark / Light Toggle */}
      <Section title="Theme Mode" theme={theme}>
        <View style={styles.toggleRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={22} color={theme.primary} />
            <Text style={{ fontSize: 15, fontWeight: '600', color: theme.text }}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
          </View>
          <Switch value={isDark} onValueChange={toggleDarkMode} trackColor={{ false: '#D0D0D8', true: theme.primary + '60' }} thumbColor={isDark ? theme.primary : '#FFFFFF'} />
        </View>
      </Section>

      {/* Accent Color */}
      <Section title="Accent Color" theme={theme}>
        <Text style={[styles.hint, { color: theme.textMuted }]}>Changes buttons, active tabs, and highlights</Text>
        <View style={styles.colorGrid}>
          {Object.entries(ACCENT_PRESETS).map(([name, val]) => (
            <View key={name} style={{ alignItems: 'center', width: 52 }}>
              <ColorCircle color={val} selected={accent === name} onPress={() => setAccentColor(name)} />
              <Text style={{ color: theme.textMuted, fontSize: 10, marginTop: 4 }}>{name}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* Heading Color */}
      <Section title="Heading Color" theme={theme}>
        <Text style={[styles.hint, { color: theme.textMuted }]}>Main headings like sheet names, titles</Text>
        <View style={styles.colorRow}>{HEADING_PRESETS.map((c, i) => <ColorCircle key={i} color={c} selected={headingColor === c} onPress={() => updateHeadingColor(c)} size={32} />)}</View>
      </Section>

      {/* Section Title Color */}
      <Section title="Section Title Color" theme={theme}>
        <Text style={[styles.hint, { color: theme.textMuted }]}>Titles like "DSA Sheets", "Core CS Subjects"</Text>
        <View style={styles.colorRow}>{HEADING_PRESETS.map((c, i) => <ColorCircle key={i} color={c} selected={sectionTitleColor === c} onPress={() => updateSectionTitleColor(c)} size={32} />)}</View>
      </Section>

      {/* Button Color */}
      <Section title="Button Color" theme={theme}>
        <Text style={[styles.hint, { color: theme.textMuted }]}>Sheet, Track, and Start Learning buttons</Text>
        <View style={styles.colorRow}>{BUTTON_PRESETS.map((c, i) => <ColorCircle key={i} color={c} selected={buttonColor === c} onPress={() => updateButtonColor(c)} size={32} />)}</View>
      </Section>

      {/* Card Background */}
      <Section title="Card Background" theme={theme}>
        <Text style={[styles.hint, { color: theme.textMuted }]}>Background color for all cards</Text>
        <View style={styles.colorRow}>{CARD_BG_OPTIONS.map((c, i) => <ColorCircle key={i} color={c} selected={(cardBg || theme.surface) === c} onPress={() => updateCardBg(c)} size={32} />)}</View>
      </Section>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { marginHorizontal: 16, marginTop: 16, borderRadius: 14, padding: 18, borderWidth: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  hint: { fontSize: 12, marginBottom: 12 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  previewCard: { borderRadius: 12, overflow: 'hidden', borderWidth: 1 },
});
