import { useState, useRef, useCallback } from 'react';
import LanguageSwitch from '../components/LanguageSwitch';
import SignPlayer from '../components/SignPlayer';
import { textToGloss } from '../services/api';
import { createSpeechRecognizer, isSpeechSupported } from '../services/speechService';
import './TextToSign.css';

export default function TextToSign() {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en');
  const [gloss, setGloss] = useState([]);
  const [availableSigns, setAvailableSigns] = useState([]);
  const [fingerspell, setFingerspell] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const recognizerRef = useRef(null);

  // ── Convert text to gloss ──
  const handleConvert = useCallback(async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const result = await textToGloss(text, language);
      setGloss(result.gloss || []);
      setAvailableSigns(result.available_signs || []);
      setFingerspell(result.fingerspell || []);
    } catch (err) {
      console.error('Error converting text:', err);
    } finally {
      setLoading(false);
    }
  }, [text, language]);

  // ── Speech input ──
  const toggleListening = useCallback(() => {
    if (isListening) {
      recognizerRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognizer = createSpeechRecognizer({
      lang: language === 'hi' ? 'hi-IN' : 'en-US',
      onResult: (transcript, isFinal) => {
        if (isFinal) {
          setText((prev) => (prev ? prev + ' ' + transcript : transcript));
        }
      },
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false),
    });

    if (recognizer) {
      recognizer.start();
      recognizerRef.current = recognizer;
      setIsListening(true);
    }
  }, [isListening, language]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleConvert();
    }
  };

  return (
    <div className="page text-to-sign">
      <div className="container">
        <header className="page-header animate-fade-in-up">
          <h1>Text & Speech → Sign Language</h1>
          <p>Type or speak a sentence and watch it translated into sign language.</p>
          <LanguageSwitch language={language} onChange={setLanguage} />
        </header>

        <div className="tts__layout">
          {/* Input Panel */}
          <div className="tts__input-panel glass-card animate-fade-in-up" id="input-panel">
            <div className="tts__input-header">
              <h3>Input</h3>
              {isSpeechSupported() && (
                <button
                  className={`btn btn--icon ${isListening ? 'btn--recording' : 'btn--secondary'}`}
                  onClick={toggleListening}
                  data-tooltip={isListening ? 'Stop listening' : 'Start voice input'}
                  id="mic-button"
                >
                  {isListening ? '🔴' : '🎤'}
                </button>
              )}
            </div>

            <textarea
              className="input"
              placeholder={
                language === 'hi'
                  ? 'हिंदी में वाक्य टाइप करें...'
                  : 'Type a sentence in English...'
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={4}
              id="text-input"
            />

            <div className="tts__actions">
              <button
                className="btn btn--primary"
                onClick={handleConvert}
                disabled={loading || !text.trim()}
                id="convert-button"
              >
                {loading ? (
                  <>
                    <span className="spinner" /> Converting...
                  </>
                ) : (
                  '🔄 Convert to Sign'
                )}
              </button>
              <button
                className="btn btn--secondary"
                onClick={() => {
                  setText('');
                  setGloss([]);
                }}
                id="clear-button"
              >
                Clear
              </button>
            </div>

            {/* Gloss Sequence */}
            {gloss.length > 0 && (
              <div className="tts__gloss" id="gloss-display">
                <h4>Gloss Sequence</h4>
                <div className="gloss-sequence">
                  {gloss.map((word, i) => {
                    const isFingerSpelled = fingerspell
                      .map((s) => s.toLowerCase())
                      .includes(word.toLowerCase());
                    return (
                      <span
                        key={i}
                        className={`gloss-word ${isFingerSpelled ? 'gloss-word--fingerspell' : ''}`}
                      >
                        {word}
                        {isFingerSpelled && (
                          <span className="gloss-word__tag">spell</span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Output Panel — SignPlayer with 3D Avatar + Video */}
          <div className="tts__output-panel glass-card animate-fade-in-up" id="output-panel">
            <SignPlayer
              gloss={gloss}
              availableSigns={availableSigns}
              fingerspell={fingerspell}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
