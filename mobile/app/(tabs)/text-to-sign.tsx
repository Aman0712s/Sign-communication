import { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { textToGloss } from '../../services/api';

export default function TextToSignScreen() {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en');
  const [gloss, setGloss] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConvert = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await textToGloss(text, language);
      setGloss(result.gloss || []);
    } catch (err) {
      setError('Could not connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Language Toggle */}
      <View style={styles.langToggle}>
        <TouchableOpacity
          style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
          onPress={() => setLanguage('en')}>
          <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>
            🇺🇸 English
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.langBtn, language === 'hi' && styles.langBtnActive]}
          onPress={() => setLanguage('hi')}>
          <Text style={[styles.langText, language === 'hi' && styles.langTextActive]}>
            🇮🇳 हिंदी
          </Text>
        </TouchableOpacity>
      </View>

      {/* Input */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Input</Text>
        <TextInput
          style={styles.textInput}
          placeholder={language === 'hi' ? 'हिंदी में टाइप करें...' : 'Type a sentence...'}
          placeholderTextColor="#6b6b80"
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary, (!text.trim() || loading) && styles.btnDisabled]}
            onPress={handleConvert}
            disabled={!text.trim() || loading}>
            {loading ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Text style={styles.btnPrimaryText}>🔄 Convert</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnSecondary]}
            onPress={() => { setText(''); setGloss([]); }}>
            <Text style={styles.btnSecondaryText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      ) : null}

      {/* Gloss Output */}
      {gloss.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gloss Sequence</Text>
          <View style={styles.glossRow}>
            {gloss.map((word, i) => (
              <View key={i} style={styles.glossChip}>
                <Text style={styles.glossText}>{word}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          💡 The gloss sequence shows the sign-language word order (SOV). 
          Connect to the backend server to see video/avatar playback.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  content: { padding: 20, paddingBottom: 40 },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 999,
    padding: 3,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  langBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: 'center',
  },
  langBtnActive: {
    backgroundColor: '#22c55e',
  },
  langText: { fontSize: 13, fontWeight: '600', color: '#6b6b80' },
  langTextActive: { color: '#000' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f0f0f5',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 16,
    color: '#f0f0f5',
    fontSize: 16,
    minHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: '#22c55e',
    flex: 1,
  },
  btnDisabled: { opacity: 0.5 },
  btnPrimaryText: { color: '#000', fontWeight: '700', fontSize: 15 },
  btnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  btnSecondaryText: { color: '#a0a0b0', fontWeight: '600' },
  errorCard: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  errorText: { color: '#ef4444', fontSize: 13 },
  glossRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  glossChip: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.25)',
  },
  glossText: {
    color: '#22c55e',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  infoCard: {
    backgroundColor: 'rgba(59,130,246,0.08)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.15)',
  },
  infoText: { color: '#a0a0b0', fontSize: 13, lineHeight: 20 },
});
