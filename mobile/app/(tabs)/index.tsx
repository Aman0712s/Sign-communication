import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🤟</Text>
        <Text style={styles.heroTitle}>SignComm</Text>
        <Text style={styles.heroSubtitle}>
          Bridge the gap with sign language — powered by AI
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { value: '150+', label: 'Signs' },
          { value: '2', label: 'Languages' },
          { value: '3D', label: 'Avatar' },
          { value: 'ML', label: 'Powered' },
        ].map((stat, i) => (
          <View key={i} style={styles.stat}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <Link href="/(tabs)/text-to-sign" asChild>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>🗣️</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Text → Sign Language</Text>
              <Text style={styles.actionDesc}>
                Type or speak a sentence to see sign language
              </Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/(tabs)/sign-to-text" asChild>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>📷</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Sign → Text</Text>
              <Text style={styles.actionDesc}>
                Use camera to recognize sign language
              </Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featureGrid}>
          {[
            { icon: '🧠', title: 'ML Recognition', desc: 'Real-time hand sign detection' },
            { icon: '🧍', title: '3D Avatar', desc: 'Animated sign demonstrations' },
            { icon: '🇮🇳', title: 'Hindi Support', desc: 'ISL & ASL languages' },
            { icon: '⚡', title: 'Fast & Offline', desc: 'Client-side ML inference' },
          ].map((f, i) => (
            <View key={i} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  heroEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#f0f0f5',
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#a0a0b0',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#22c55e',
  },
  statLabel: {
    fontSize: 11,
    color: '#6b6b80',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f0f0f5',
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  actionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f0f0f5',
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 13,
    color: '#a0a0b0',
  },
  actionArrow: {
    fontSize: 20,
    color: '#22c55e',
    fontWeight: '700',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f0f0f5',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: '#6b6b80',
    lineHeight: 18,
  },
});
