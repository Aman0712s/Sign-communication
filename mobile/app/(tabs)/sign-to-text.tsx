import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

export default function SignToTextScreen() {
  const [prediction, setPrediction] = useState('');
  const [sentence, setSentence] = useState('');
  const [isActive, setIsActive] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Camera Placeholder */}
      <View style={styles.cameraCard}>
        <View style={styles.cameraPlaceholder}>
          <Text style={styles.cameraIcon}>📷</Text>
          <Text style={styles.cameraText}>
            Camera integration requires expo-camera.{'\n'}
            Run `npx expo install expo-camera` to enable.
          </Text>
        </View>

        {isActive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.btn, isActive ? styles.btnDanger : styles.btnPrimary]}
          onPress={() => setIsActive(!isActive)}>
          <Text style={styles.btnText}>
            {isActive ? '⏹ Stop Detection' : '▶ Start Detection'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Current Prediction */}
      <View style={styles.predictionCard}>
        <Text style={styles.predictionLetter}>{prediction || '—'}</Text>
        <Text style={styles.predictionLabel}>Current Sign</Text>
      </View>

      {/* Sentence */}
      <View style={styles.card}>
        <View style={styles.sentenceHeader}>
          <Text style={styles.cardTitle}>Recognized Text</Text>
          <TouchableOpacity onPress={() => setSentence('')}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sentenceBox}>
          <Text style={styles.sentenceText}>
            {sentence || 'Signs will appear here...'}
          </Text>
        </View>
      </View>

      {/* Tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>Tips</Text>
        {[
          'Hold each sign steady for ~1 second',
          'Keep your hand clearly visible',
          'Good lighting improves accuracy',
          'Currently supports ASL alphabet (A-Z)',
        ].map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <Text style={styles.tipDot}>•</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  content: { padding: 20, paddingBottom: 40 },
  cameraCard: {
    backgroundColor: '#111118',
    borderRadius: 16,
    height: 280,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPlaceholder: {
    alignItems: 'center',
    padding: 20,
  },
  cameraIcon: { fontSize: 48, opacity: 0.3, marginBottom: 12 },
  cameraText: {
    color: '#6b6b80',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
  liveText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  controls: {
    marginBottom: 16,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPrimary: { backgroundColor: '#22c55e' },
  btnDanger: { backgroundColor: 'rgba(239,68,68,0.2)', borderWidth: 1, borderColor: '#ef4444' },
  btnText: { color: '#000', fontWeight: '700', fontSize: 16 },
  predictionCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 30,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  predictionLetter: {
    fontSize: 72,
    fontWeight: '800',
    color: '#22c55e',
  },
  predictionLabel: {
    fontSize: 13,
    color: '#6b6b80',
    marginTop: 8,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sentenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#f0f0f5' },
  clearText: { color: '#22c55e', fontSize: 13, fontWeight: '600' },
  sentenceBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 16,
    minHeight: 60,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  sentenceText: {
    color: '#f0f0f5',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  tipsCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b6b80',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  tipRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  tipDot: { color: '#22c55e', fontSize: 13 },
  tipText: { color: '#a0a0b0', fontSize: 13, flex: 1 },
});
