import { Link } from 'react-router-dom';
import './Home.css';

const features = [
  {
    icon: '🗣️',
    title: 'Text & Speech to Sign',
    desc: 'Type or speak a sentence and watch it converted into sign language animations with a 3D avatar in real-time.',
  },
  {
    icon: '🤖',
    title: 'ML-Powered Recognition',
    desc: 'Our trained machine learning model recognizes hand signs through your webcam with high accuracy.',
  },
  {
    icon: '🧍',
    title: '3D Avatar Animation',
    desc: 'A Three.js-powered 3D humanoid avatar demonstrates each sign with smooth skeletal animations.',
  },
  {
    icon: '🇮🇳',
    title: 'Hindi Sign Language',
    desc: 'Supports both ASL (American) and ISL (Indian) sign languages. Toggle between English and Hindi.',
  },
  {
    icon: '📱',
    title: 'Cross-Platform',
    desc: 'Use on web or mobile. The same powerful engine works everywhere via React and React Native.',
  },
  {
    icon: '⚡',
    title: 'Real-Time Processing',
    desc: 'Client-side MediaPipe + TensorFlow.js inference runs at 30+ FPS — no server round-trips for recognition.',
  },
];

export default function Home() {
  return (
    <div className="page home">
      <div className="container">
        {/* Hero */}
        <section className="home__hero animate-fade-in-up" id="hero-section">
          <div className="home__hero-badge">
            <span className="badge">✨ Powered by Machine Learning</span>
          </div>
          <h1 className="home__title">
            Bridge the Gap with
            <br />
            <span className="home__title--accent">Sign Language</span>
          </h1>
          <p className="home__subtitle">
            Convert speech and text into expressive sign language animations instantly.
            Powered by AI, accessible to everyone.
          </p>
          <div className="home__cta">
            <Link to="/text-to-sign" className="btn btn--primary btn--lg" id="cta-text-to-sign">
              🚀 Start Converting
            </Link>
            <Link to="/sign-to-text" className="btn btn--secondary btn--lg" id="cta-sign-to-text">
              📷 Sign to Text
            </Link>
          </div>

          {/* Stats */}
          <div className="home__stats stagger">
            <div className="home__stat">
              <span className="home__stat-value">150+</span>
              <span className="home__stat-label">Sign Words</span>
            </div>
            <div className="home__stat">
              <span className="home__stat-value">2</span>
              <span className="home__stat-label">Languages</span>
            </div>
            <div className="home__stat">
              <span className="home__stat-value">30+</span>
              <span className="home__stat-label">FPS Real-Time</span>
            </div>
            <div className="home__stat">
              <span className="home__stat-value">3D</span>
              <span className="home__stat-label">Avatar Demo</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section" id="features-section">
          <h2 className="home__section-title animate-fade-in-up">
            Everything You Need
          </h2>
          <p className="home__section-desc animate-fade-in-up">
            A complete platform for sign language communication — from text to signs and back.
          </p>
          <div className="grid grid--3 stagger">
            {features.map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="section" id="how-it-works-section">
          <h2 className="home__section-title animate-fade-in-up">
            How It Works
          </h2>
          <div className="home__steps stagger">
            <div className="home__step glass-card">
              <div className="home__step-num">01</div>
              <h4>Input</h4>
              <p>Type text, speak a sentence, or show signs to your camera.</p>
            </div>
            <div className="home__step-arrow">→</div>
            <div className="home__step glass-card">
              <div className="home__step-num">02</div>
              <h4>Process</h4>
              <p>Our ML models process NLP gloss ordering and recognize hand signs.</p>
            </div>
            <div className="home__step-arrow">→</div>
            <div className="home__step glass-card">
              <div className="home__step-num">03</div>
              <h4>Output</h4>
              <p>Watch the 3D avatar perform signs or read recognized text.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
