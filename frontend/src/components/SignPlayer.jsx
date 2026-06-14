import { useState, useRef, useCallback, useEffect } from 'react';
import Avatar3D, { hasSignAnimation } from './Avatar3D';
import './SignPlayer.css';

/**
 * SignPlayer — Plays sign language output as either:
 * 1. 3D avatar animations (when available)
 * 2. Pre-recorded video files (fallback)
 * 3. Letter-by-letter fingerspelling (last resort)
 */
export default function SignPlayer({
  gloss = [],
  availableSigns = [],
  fingerspell = [],
  onComplete,
}) {
  const [mode, setMode] = useState('avatar'); // 'avatar' | 'video'
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentSign, setCurrentSign] = useState('');
  const videoRef = useRef(null);
  const timerRef = useRef(null);

  const currentWord = currentIndex >= 0 && currentIndex < gloss.length ? gloss[currentIndex] : '';

  // ── Clean up on unmount ──
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // ── Play with 3D avatar ──
  const playWithAvatar = useCallback(() => {
    if (gloss.length === 0) return;
    setPlaying(true);
    setMode('avatar');
    let idx = 0;

    const playNext = () => {
      if (idx >= gloss.length) {
        setPlaying(false);
        setCurrentIndex(-1);
        setCurrentSign('');
        onComplete?.();
        return;
      }

      const word = gloss[idx];
      setCurrentIndex(idx);
      setCurrentSign(word);

      // Duration depends on whether animation exists
      const hasAnim = hasSignAnimation(word);
      const duration = hasAnim ? 1500 : 800; // longer for animated, shorter for static

      timerRef.current = setTimeout(() => {
        idx++;
        playNext();
      }, duration);
    };

    playNext();
  }, [gloss, onComplete]);

  // ── Play with videos ──
  const playWithVideo = useCallback(() => {
    if (gloss.length === 0) return;
    setPlaying(true);
    setMode('video');
    let idx = 0;

    const playNext = () => {
      if (idx >= gloss.length) {
        setPlaying(false);
        setCurrentIndex(-1);
        onComplete?.();
        return;
      }

      const word = gloss[idx].toLowerCase();
      setCurrentIndex(idx);

      const video = videoRef.current;
      if (!video) { idx++; playNext(); return; }

      const isAvailable = availableSigns.map(s => s.toLowerCase()).includes(word);

      if (isAvailable) {
        video.src = `/static/${word}.mp4`;
        video.onended = () => { idx++; playNext(); };
        video.onerror = () => { idx++; playNext(); };
        video.play().catch(() => { idx++; playNext(); });
      } else {
        // Fingerspell
        const letters = word.split('');
        let li = 0;
        const playLetter = () => {
          if (li >= letters.length) { idx++; playNext(); return; }
          video.src = `/static/${letters[li]}.mp4`;
          video.onended = () => { li++; playLetter(); };
          video.onerror = () => { li++; playLetter(); };
          video.play().catch(() => { li++; playLetter(); });
        };
        playLetter();
      }
    };

    playNext();
  }, [gloss, availableSigns, onComplete]);

  // ── Stop ──
  const stop = useCallback(() => {
    setPlaying(false);
    setCurrentIndex(-1);
    setCurrentSign('');
    if (timerRef.current) clearTimeout(timerRef.current);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }
  }, []);

  return (
    <div className="sign-player" id="sign-player">
      {/* Mode Toggle */}
      <div className="sign-player__header">
        <h3>Sign Output</h3>
        <div className="sign-player__modes">
          <button
            className={`sign-player__mode-btn ${mode === 'avatar' ? 'sign-player__mode-btn--active' : ''}`}
            onClick={() => { stop(); setMode('avatar'); }}
            id="mode-avatar"
          >
            🧍 3D Avatar
          </button>
          <button
            className={`sign-player__mode-btn ${mode === 'video' ? 'sign-player__mode-btn--active' : ''}`}
            onClick={() => { stop(); setMode('video'); }}
            id="mode-video"
          >
            🎥 Video
          </button>
        </div>
      </div>

      {/* Display Area */}
      <div className="sign-player__display">
        {mode === 'avatar' ? (
          <Avatar3D
            currentSign={currentSign}
            isPlaying={playing}
            height="400px"
          />
        ) : (
          <div className="video-container">
            <video ref={videoRef} muted playsInline id="sign-video" />
            {!playing && (
              <div className="sign-player__placeholder">
                <span className="sign-player__placeholder-icon">🎥</span>
                <p>Click play to see sign language videos</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      {gloss.length > 0 && (
        <div className="sign-player__controls">
          <button
            className="btn btn--primary"
            onClick={mode === 'avatar' ? playWithAvatar : playWithVideo}
            disabled={playing}
            id="play-signs"
          >
            {playing ? '⏸ Playing...' : '▶ Play Signs'}
          </button>
          {playing && (
            <button className="btn btn--secondary" onClick={stop} id="stop-signs">
              ⏹ Stop
            </button>
          )}
        </div>
      )}

      {/* Progress */}
      {playing && currentIndex >= 0 && (
        <div className="sign-player__progress">
          <span className="sign-player__progress-dot" />
          Signing: <strong>{currentWord}</strong>
          <span className="sign-player__progress-count">
            {currentIndex + 1} / {gloss.length}
          </span>
          <div className="sign-player__progress-bar">
            <div
              className="sign-player__progress-fill"
              style={{ width: `${((currentIndex + 1) / gloss.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
