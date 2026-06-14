/**
 * Speech Service — Web Speech API wrapper for voice input.
 */

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

/**
 * Create and return a SpeechRecognition instance.
 * @param {Object} opts
 * @param {'en-US'|'hi-IN'} opts.lang
 * @param {boolean} opts.continuous
 * @param {(transcript: string, isFinal: boolean) => void} opts.onResult
 * @param {(error: string) => void} opts.onError
 * @param {() => void} opts.onEnd
 */
export function createSpeechRecognizer({
  lang = 'en-US',
  continuous = true,
  onResult,
  onError,
  onEnd,
} = {}) {
  if (!SpeechRecognition) {
    console.warn('Web Speech API not supported');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.continuous = continuous;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        finalTranscript += result[0].transcript;
      } else {
        interimTranscript += result[0].transcript;
      }
    }

    if (finalTranscript && onResult) {
      onResult(finalTranscript.trim(), true);
    } else if (interimTranscript && onResult) {
      onResult(interimTranscript.trim(), false);
    }
  };

  recognition.onerror = (event) => {
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
}

/**
 * Check if the browser supports Web Speech API.
 */
export function isSpeechSupported() {
  return !!SpeechRecognition;
}
