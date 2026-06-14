import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch } from 'react-native';

export default function SettingsScreen() {
  const [language, setLanguage] = useState('en');
  const [darkMode, setDarkMode] = useState(true);
  const [haptics, setHaptics] = useState(true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      {/* Language */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.langOption, language === 'en' && styles.langOptionActive]}
            onPress={() => setLanguage('en')}>
            <Text style={styles.langEmoji}>🇺🇸</Text>
            <View style={styles.langInfo}>
              <Text style={styles.langName}>English (ASL)</Text>
              <Text style={styles.langDesc}>American Sign Language</Text>
            </View>
            {language === 'en' && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.langOption, language === 'hi' && styles.langOptionActive]}
            onPress={() => setLanguage('hi')}>
            <Text style={styles.langEmoji}>🇮🇳</Text>
            <View style={styles.langInfo}>
              <Text style={styles.langName}>हिंदी (ISL)</Text>
              <Text style={styles.langDesc}>Indian Sign Language</Text>
            </View>
            {language === 'hi' && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        </View>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDesc}>Use dark theme</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#333', true: 'rgba(34,197,94,0.3)' }}
              thumbColor={darkMode ? '#22c55e' : '#666'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Haptic Feedback</Text>
              <Text style={styles.settingDesc}>Vibrate on sign detection</Text>
            </View>
            <Switch
              value={haptics}
              onValueChange={setHaptics}
              trackColor={{ false: '#333', true: 'rgba(34,197,94,0.3)' }}
              thumbColor={haptics ? '#22c55e' : '#666'}
            />
          </View>
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>App Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>ML Model</Text>
            <Text style={styles.aboutValue}>Random Forest v1</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Developer</Text>
            <Text style={styles.aboutValue}>Aman Singh</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  content: { padding: 20, paddingBottom: 40 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f0f0f5',
    marginBottom: 24,
  },
  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b6b80',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  langOptionActive: {
    backgroundColor: 'rgba(34,197,94,0.08)',
  },
  langEmoji: { fontSize: 28, marginRight: 14 },
  langInfo: { flex: 1 },
  langName: { fontSize: 15, fontWeight: '700', color: '#f0f0f5' },
  langDesc: { fontSize: 12, color: '#6b6b80', marginTop: 2 },
  checkmark: { color: '#22c55e', fontSize: 18, fontWeight: '700' },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLabel: { fontSize: 15, fontWeight: '600', color: '#f0f0f5' },
  settingDesc: { fontSize: 12, color: '#6b6b80', marginTop: 2 },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  aboutLabel: { fontSize: 14, color: '#a0a0b0' },
  aboutValue: { fontSize: 14, fontWeight: '600', color: '#f0f0f5' },
});
