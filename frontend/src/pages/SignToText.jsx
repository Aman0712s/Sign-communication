import { useState, useRef, useCallback, useEffect } from 'react';
import LanguageSwitch from '../components/LanguageSwitch';
import { predictSign } from '../services/api';
import './SignToText.css';

export default function SignToText() {
  const [language, setLanguage] = useState('en');
  const [prediction, setPrediction] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [sentence, setSentence] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const handsRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastPredictionRef = useRef('');
  const stableCountRef = useRef(0);
  const lastCallRef = useRef(0);

  // ── Start camera ──
  const startCamera = useCallback(async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.');
      console.error('Camera error:', err);
    }
  }, []);

  // ── Stop camera ──
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setCameraReady(false);
    setIsActive(false);
  }, []);

  // ── Initialize MediaPipe Hands ──
  useEffect(() => {
    let mounted = true;

    async function initMediaPipe() {
      try {
        // Dynamic import for MediaPipe
        const { Hands } = await import('@mediapipe/hands');

        const hands = new Hands({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((results) => {
          if (!mounted) return;
          drawLandmarks(results);

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const now = Date.now();
            if (now - lastCallRef.current >= 150) {
              lastCallRef.current = now;
              const landmarks = results.multiHandLandmarks[0].map((lm) => ({
                x: lm.x,
                y: lm.y,
                z: lm.z,
              }));
              sendPrediction(landmarks);
            }
          }
        });

        if (mounted) {
          handsRef.current = hands;
        }
      } catch (err) {
        console.error('MediaPipe init error:', err);
      }
    }

    initMediaPipe();

    return () => {
      mounted = false;
      stopCamera();
    };
  }, [stopCamera]);

  // ── Draw hand landmarks on canvas ──
  const drawLandmarks = useCallback((results) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        // Draw connections
        const connections = [
          [0,1],[1,2],[2,3],[3,4],
          [0,5],[5,6],[6,7],[7,8],
          [0,9],[9,10],[10,11],[11,12],
          [0,13],[13,14],[14,15],[15,16],
          [0,17],[17,18],[18,19],[19,20],
          [5,9],[9,13],[13,17],
        ];

        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        for (const [a, b] of connections) {
          ctx.beginPath();
          ctx.moveTo(landmarks[a].x * canvas.width, landmarks[a].y * canvas.height);
          ctx.lineTo(landmarks[b].x * canvas.width, landmarks[b].y * canvas.height);
          ctx.stroke();
        }

        // Draw points
        for (const point of landmarks) {
          ctx.beginPath();
          ctx.arc(
            point.x * canvas.width,
            point.y * canvas.height,
            4,
            0,
            2 * Math.PI
          );
          ctx.fillStyle = '#4ade80';
          ctx.fill();
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }, []);

  // ── Send landmarks to API for prediction ──
  const sendPrediction = useCallback(
    async (landmarks) => {
      try {
        const result = await predictSign(landmarks, language);
        const label = result.label || '?';
        const conf = result.confidence || 0;

        setPrediction(label);
        setConfidence(conf);

        // Stability check — add to sentence after N stable frames (N=3 since we throttle to 150ms)
        if (label === lastPredictionRef.current && label !== '?') {
          stableCountRef.current += 1;
          if (stableCountRef.current >= 3) {
            setSentence((prev) => {
              if (label.length === 1) {
                // Alphabet fingerspelling
                return prev + label;
              } else {
                // Complete word prediction
                const spaceBefore = prev && !prev.endsWith(' ') ? ' ' : '';
                return prev + spaceBefore + label + ' ';
              }
            });
            stableCountRef.current = 0;
          }
        } else {
          lastPredictionRef.current = label;
          stableCountRef.current = 0;
        }
      } catch (err) {
        // Silently ignore prediction errors during streaming
      }
    },
    [language]
  );

  // ── Detection loop ──
  const startDetection = useCallback(() => {
    if (!handsRef.current || !videoRef.current) return;
    setIsActive(true);

    const detect = async () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        await handsRef.current.send({ image: videoRef.current });
      }
      animFrameRef.current = requestAnimationFrame(detect);
    };

    detect();
  }, []);

  const handleToggle = useCallback(() => {
    if (isActive) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setIsActive(false);
    } else if (cameraReady) {
      startDetection();
    } else {
      startCamera().then(() => {
        setTimeout(startDetection, 500);
      });
    }
  }, [isActive, cameraReady, startCamera, startDetection]);

  return (
    <div className="page sign-to-text">
      <div className="container">
        <header className="page-header animate-fade-in-up">
          <h1>Sign Language → Text</h1>
          <p>Show hand signs to your camera and watch them converted to text in real-time.</p>
          <LanguageSwitch language={language} onChange={setLanguage} />
        </header>

        <div className="stt__layout">
          {/* Camera Panel */}
          <div className="stt__camera-panel glass-card animate-fade-in-up" id="camera-panel">
            <div className="stt__camera-header">
              <h3>Camera Feed</h3>
              <div className="stt__camera-controls">
                <button
                  className={`btn ${isActive ? 'btn--recording' : 'btn--primary'}`}
                  onClick={handleToggle}
                  id="toggle-detection"
                >
                  {isActive ? '⏹ Stop' : '▶ Start Detection'}
                </button>
              </div>
            </div>

            <div className="camera-feed" id="camera-feed">
              <video ref={videoRef} playsInline muted />
              <canvas ref={canvasRef} />
              {!cameraReady && (
                <div className="stt__camera-placeholder">
                  <span className="stt__camera-icon">📷</span>
                  <p>Click "Start Detection" to activate camera</p>
                </div>
              )}
              {isActive && (
                <div className="stt__camera-badge">
                  <span className="stt__recording-dot" />
                  LIVE
                </div>
              )}
            </div>

            {error && (
              <div className="stt__error">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="stt__results-panel glass-card animate-fade-in-up" id="results-panel">
            {/* Current Prediction */}
            <div className="prediction-display" id="prediction-display">
              <div className="prediction-letter">{prediction || '—'}</div>
              {prediction && (
                <div className="prediction-confidence">
                  Confidence: {Math.round(confidence * 100)}%
                </div>
              )}
            </div>

            {/* Accumulated Sentence */}
            <div className="stt__sentence-section">
              <div className="stt__sentence-header">
                <h3>Recognized Text</h3>
                <div className="stt__sentence-actions">
                  <button
                    className="btn btn--ghost"
                    onClick={() => setSentence((prev) => prev + ' ')}
                    id="add-space"
                  >
                    Space ⎵
                  </button>
                  <button
                    className="btn btn--ghost"
                    onClick={() => setSentence('')}
                    id="clear-sentence"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="stt__sentence" id="sentence-output">
                {sentence || (
                  <span className="stt__sentence-placeholder">
                    Signs will appear here as you sign...
                  </span>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="stt__instructions">
              <h4>Tips</h4>
              <ul>
                <li>Hold each sign steady for about 1 second</li>
                <li>Keep your hand clearly visible to the camera</li>
                <li>Good lighting improves accuracy</li>
                <li>The system currently recognizes ASL alphabet (A-Z)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
