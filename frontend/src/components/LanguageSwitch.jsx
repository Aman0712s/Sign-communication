import './LanguageSwitch.css';

/**
 * Toggle between English (ASL) and Hindi (ISL) sign language modes.
 */
export default function LanguageSwitch({ language, onChange }) {
  return (
    <div className="lang-toggle" role="radiogroup" aria-label="Language selection">
      <button
        className={`lang-toggle__option ${language === 'en' ? 'lang-toggle__option--active' : ''}`}
        onClick={() => onChange('en')}
        role="radio"
        aria-checked={language === 'en'}
        id="lang-en"
      >
        🇺🇸 English
      </button>
      <button
        className={`lang-toggle__option ${language === 'hi' ? 'lang-toggle__option--active' : ''}`}
        onClick={() => onChange('hi')}
        role="radio"
        aria-checked={language === 'hi'}
        id="lang-hi"
      >
        🇮🇳 हिंदी
      </button>
    </div>
  );
}
