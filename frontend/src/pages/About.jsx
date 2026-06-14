import './About.css';

const team = [
  { name: 'Aman Singh', role: 'Full-Stack Developer', emoji: '👨‍💻' },
];

const techStack = [
  { name: 'Django + DRF', desc: 'REST API backend', icon: '🐍' },
  { name: 'React + Vite', desc: 'Modern web frontend', icon: '⚛️' },
  { name: 'Three.js', desc: '3D avatar rendering', icon: '🎮' },
  { name: 'MediaPipe', desc: 'Real-time hand tracking', icon: '🤚' },
  { name: 'TensorFlow', desc: 'ML sign recognition', icon: '🧠' },
  { name: 'React Native', desc: 'Cross-platform mobile', icon: '📱' },
];

export default function About() {
  return (
    <div className="page about">
      <div className="container">
        <header className="page-header animate-fade-in-up">
          <h1>About SignComm</h1>
          <p>Building bridges between the deaf community and the hearing world through technology.</p>
        </header>

        {/* Mission */}
        <section className="about__mission glass-card animate-fade-in-up" id="mission-section">
          <h2>Our Mission</h2>
          <p>
            SignComm is an AI-powered sign language communication platform designed to make
            sign language accessible to everyone. We use machine learning, computer vision,
            and 3D animation to enable seamless two-way communication between sign language
            users and non-signers.
          </p>
          <p>
            Our platform supports both <strong>American Sign Language (ASL)</strong> and
            <strong> Indian Sign Language (ISL/Hindi)</strong>, with plans to expand to more
            sign languages in the future.
          </p>
        </section>

        {/* Features */}
        <section className="section animate-fade-in-up" id="about-features">
          <h2 className="about__section-title">What We Offer</h2>
          <div className="about__features">
            <div className="glass-card">
              <h3>🗣️ Text/Speech → Sign</h3>
              <p>Convert any English or Hindi text into sign language. Speak naturally or type — our NLP engine converts it to proper sign language gloss ordering.</p>
            </div>
            <div className="glass-card">
              <h3>📷 Sign → Text</h3>
              <p>Use your webcam to sign, and our ML model recognizes your hand gestures in real-time, converting them back to text.</p>
            </div>
            <div className="glass-card">
              <h3>🧍 3D Avatar</h3>
              <p>A fully animated 3D humanoid avatar demonstrates each sign with realistic skeletal animations using Three.js.</p>
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="section animate-fade-in-up" id="tech-stack">
          <h2 className="about__section-title">Technology Stack</h2>
          <div className="grid grid--3 stagger">
            {techStack.map((tech, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-card__icon">{tech.icon}</div>
                <h4 className="feature-card__title">{tech.name}</h4>
                <p className="feature-card__desc">{tech.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="section animate-fade-in-up" id="team-section">
          <h2 className="about__section-title">Team</h2>
          <div className="about__team">
            {team.map((member, i) => (
              <div className="about__team-member glass-card" key={i}>
                <span className="about__team-avatar">{member.emoji}</span>
                <h4>{member.name}</h4>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
