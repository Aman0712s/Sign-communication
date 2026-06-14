"""
Enhanced NLP Pipeline for Sign Language Gloss Conversion.

Features:
- SOV (Subject-Object-Verb) reordering for sign language grammar
- Tense markers (BEFORE, NOW, FUTURE)
- Pronoun mapping (I→ME, he→HE, etc.)
- Negation handling (don't→NOT)
- Question detection (WH-words at end for ISL)
- Compound sign detection (thank you→THANK-YOU)
- Hindi text support stub
"""

import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import logging

logger = logging.getLogger(__name__)

# ── Ensure NLTK data ──
_NLTK_PACKAGES = [
    ('tokenizers/punkt', 'punkt'),
    ('tokenizers/punkt_tab', 'punkt_tab'),
    ('corpora/wordnet', 'wordnet'),
    ('corpora/stopwords', 'stopwords'),
    ('taggers/averaged_perceptron_tagger', 'averaged_perceptron_tagger'),
    ('taggers/averaged_perceptron_tagger_eng', 'averaged_perceptron_tagger_eng'),
]


def _ensure_nltk_data():
    for resource, package in _NLTK_PACKAGES:
        try:
            nltk.data.find(resource)
        except LookupError:
            try:
                nltk.download(package, quiet=True)
            except Exception:
                pass


_ensure_nltk_data()

lemmatizer = WordNetLemmatizer()

try:
    _stop_words = set(stopwords.words('english'))
except Exception:
    _stop_words = set()

# ── Compound signs (multi-word → single sign) ──
COMPOUND_SIGNS = {
    ('thank', 'you'): 'THANK-YOU',
    ('good', 'morning'): 'GOOD-MORNING',
    ('good', 'night'): 'GOOD-NIGHT',
    ('good', 'afternoon'): 'GOOD-AFTERNOON',
    ('how', 'are', 'you'): 'HOW-ARE-YOU',
    ('nice', 'to', 'meet', 'you'): 'NICE-MEET-YOU',
    ('i', 'love', 'you'): 'I-LOVE-YOU',
    ('sign', 'language'): 'SIGN-LANGUAGE',
    ('high', 'school'): 'HIGH-SCHOOL',
    ('ice', 'cream'): 'ICE-CREAM',
}

# ── Pronoun mapping ──
PRONOUN_MAP = {
    'i': 'ME',
    'me': 'ME',
    'my': 'MY',
    'mine': 'MY',
    'myself': 'ME',
    'you': 'YOU',
    'your': 'YOUR',
    'yours': 'YOUR',
    'yourself': 'YOU',
    'he': 'HE',
    'him': 'HE',
    'his': 'HIS',
    'she': 'SHE',
    'her': 'SHE',
    'hers': 'SHE',
    'we': 'WE',
    'us': 'WE',
    'our': 'OUR',
    'they': 'THEY',
    'them': 'THEY',
    'their': 'THEIR',
}

# ── Negation words ──
NEGATION_WORDS = {
    "don't", "dont", "doesn't", "doesnt", "didn't", "didnt",
    "won't", "wont", "wouldn't", "wouldnt", "can't", "cant",
    "cannot", "couldn't", "couldnt", "shouldn't", "shouldnt",
    "isn't", "isnt", "aren't", "arent", "wasn't", "wasnt",
    "weren't", "werent", "not", "never", "no",
    # NLTK tokenizer splits contractions: "don't" → ["do", "n't"]
    "n't",
}

# ── WH-question words ──
WH_WORDS = {'what', 'where', 'when', 'who', 'whom', 'why', 'how', 'which'}

# ── Be-verbs to skip ──
BE_VERBS = {'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being'}

# ── Words to always skip (not informational in sign) ──
SKIP_WORDS = {'a', 'an', 'the', 'to', 'of', 'for', 'in', 'on', 'at', 'by', 'with', 'and', 'or', 'but', 'do', 'did', 'does', 'will', 'shall'}


def _detect_compounds(words):
    """
    Scan for compound sign phrases and replace with single tokens.
    """
    result = []
    i = 0
    while i < len(words):
        matched = False
        # Try longest match first (4, 3, 2 words)
        for length in (4, 3, 2):
            if i + length <= len(words):
                phrase = tuple(words[i:i + length])
                if phrase in COMPOUND_SIGNS:
                    result.append(COMPOUND_SIGNS[phrase])
                    i += length
                    matched = True
                    break
        if not matched:
            result.append(words[i])
            i += 1
    return result


def _detect_tense(tagged_words):
    """
    Detect the primary tense of the sentence from POS tags.
    Returns 'past', 'present', 'future', or None.
    """
    for word, tag in tagged_words:
        word_l = word.lower()
        if word_l in ('will', 'shall', "won't", 'gonna', "'ll"):
            return 'future'
        if tag in ('VBD', 'VBN'):  # Past tense / Past participle
            return 'past'
        if tag == 'VBG':  # Present continuous
            return 'present'
    return None


def _detect_question(words):
    """Check if the sentence is a question."""
    if not words:
        return False
    # Check for WH-word at start or question mark
    return words[0].lower() in WH_WORDS or words[-1] == '?'


def _detect_negation(words):
    """Check if the sentence contains negation."""
    return any(w.lower() in NEGATION_WORDS for w in words)


def text_to_gloss(sentence):
    """
    Convert English sentence to Sign Language Gloss (ASL/ISL ordering).

    Sign language grammar:
    - Tense marker first (BEFORE, NOW, FUTURE)
    - Subject first
    - Object before verb (SOV ordering)
    - Negation (NOT) placed after verb
    - WH-words at end in ISL (beginning in ASL)
    - Skip articles, prepositions, be-verbs

    Args:
        sentence: Input English text

    Returns:
        list of gloss tokens (uppercase strings)
    """
    if not sentence or not isinstance(sentence, str):
        return []

    sentence = sentence.strip()
    if not sentence:
        return []

    try:
        # Tokenize
        words = word_tokenize(sentence.lower())

        # Detect compounds before processing
        words = _detect_compounds(words)

        # POS tag
        try:
            tagged = nltk.pos_tag(words)
        except Exception:
            tagged = [(w, 'NN') for w in words]

        # Detect sentence properties
        tense = _detect_tense(tagged)
        is_question = _detect_question(words)
        has_negation = _detect_negation(words)

        # Build gloss tokens
        subjects = []
        verbs = []
        objects_other = []
        wh_word = None
        negation_added = False

        for word, tag in tagged:
            word_lower = word.lower()

            # Skip punctuation (words without any alphanumeric characters)
            if not any(c.isalnum() for c in word):
                continue

            # Already a compound sign (contains hyphen from compound detection)
            if '-' in word and word == word.upper():
                objects_other.append(word)
                continue

            # WH-words
            if word_lower in WH_WORDS:
                wh_word = word_lower.upper()
                continue

            # Skip articles, prepositions, be-verbs
            if word_lower in SKIP_WORDS or word_lower in BE_VERBS:
                continue

            # Handle negation words
            if word_lower in NEGATION_WORDS:
                has_negation = True
                # Extract the base verb from contractions like "don't" → skip
                continue

            # Map pronouns
            if word_lower in PRONOUN_MAP:
                mapped = PRONOUN_MAP[word_lower]
                # Pronouns that are subjects (PRP at sentence start or subject position)
                if tag in ('PRP', 'PRP$') and not subjects:
                    subjects.append(mapped)
                else:
                    objects_other.append(mapped)
                continue

            # Verbs
            if tag.startswith('VB'):
                lemma = lemmatizer.lemmatize(word_lower, pos='v')
                verbs.append(lemma.upper())
                continue

            # Nouns and adjectives
            if tag.startswith('NN') or tag.startswith('JJ') or tag.startswith('RB'):
                lemma = lemmatizer.lemmatize(word_lower)
                objects_other.append(lemma.upper())
                continue

            # Numbers
            if tag == 'CD':
                objects_other.append(word.upper())
                continue

            # Anything else: include as-is
            lemma = lemmatizer.lemmatize(word_lower)
            if lemma and lemma not in SKIP_WORDS:
                objects_other.append(lemma.upper())

        # ── Assemble in sign language order ──
        gloss = []

        # 1. Tense marker
        if tense == 'past':
            gloss.append('BEFORE')
        elif tense == 'future':
            gloss.append('FUTURE')
        elif tense == 'present' and any(t == 'VBG' for _, t in tagged):
            gloss.append('NOW')

        # 2. Subject
        gloss.extend(subjects)

        # 3. Objects (before verb in SOV)
        gloss.extend(objects_other)

        # 4. Verb
        gloss.extend(verbs)

        # 5. Negation after verb
        if has_negation:
            gloss.append('NOT')

        # 6. Question word at end (ISL style)
        if wh_word:
            gloss.append(wh_word)

        # Remove duplicates while preserving order
        seen = set()
        deduped = []
        for g in gloss:
            if g not in seen:
                seen.add(g)
                deduped.append(g)

        return deduped if deduped else [sentence.upper()]

    except Exception as e:
        logger.error(f"NLP processing error: {e}")
        return [w.upper() for w in sentence.split() if w.strip()]


def process_sentence_with_tense(sentence):
    """
    Advanced processing with tense detection.
    Delegates to text_to_gloss which now handles tense internally.
    """
    return text_to_gloss(sentence)


# ── Test ──
if __name__ == "__main__":
    test_sentences = [
        "I am going to college",
        "Hello world",
        "She was eating food",
        "They will come tomorrow",
        "Where is the library?",
        "I don't like coffee",
        "Thank you for helping me",
        "What is your name?",
        "I love you",
        "He didn't go to school",
    ]

    print("Enhanced NLP Pipeline — Text to Gloss")
    print("=" * 50)

    for sentence in test_sentences:
        result = text_to_gloss(sentence)
        print(f"  Input: {sentence}")
        print(f"  Gloss: {' '.join(result)}")
        print()