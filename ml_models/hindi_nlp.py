"""
Hindi Sign Language (ISL) NLP Pipeline.

Converts Hindi (Devanagari) text into ISL gloss sequence.
Since no standard ISL gloss convention exists, we use a simplified approach:
1. Tokenize Hindi text
2. Remove Hindi stopwords
3. Map common Hindi words to ISL signs
4. Fall back to character-level (Devanagari alphabet) for unknown words
"""

import re
import logging

logger = logging.getLogger(__name__)

# ── Hindi stopwords (common function words) ──
HINDI_STOPWORDS = {
    'का', 'के', 'की', 'में', 'है', 'हैं', 'को', 'से', 'पर', 'ने',
    'और', 'या', 'एक', 'यह', 'वह', 'इस', 'उस', 'जो', 'कि', 'भी',
    'तो', 'ही', 'हम', 'था', 'थे', 'थी', 'हो', 'होता', 'होती',
    'जा', 'कर', 'रहा', 'रहे', 'रही', 'गया', 'गए', 'गई',
    'अपना', 'अपनी', 'अपने', 'वाला', 'वाली', 'वाले',
    'सब', 'कुछ', 'बहुत', 'ज्यादा', 'अभी', 'तक',
}

# ── Hindi → ISL common word mapping ──
HINDI_TO_ISL = {
    # Greetings
    'नमस्ते': 'NAMASTE',
    'नमस्कार': 'NAMASTE',
    'शुभ': 'GOOD',
    'प्रभात': 'MORNING',
    'सुबह': 'MORNING',
    'शाम': 'EVENING',
    'रात': 'NIGHT',
    'धन्यवाद': 'THANK-YOU',
    'शुक्रिया': 'THANK-YOU',
    'कृपया': 'PLEASE',
    'माफ': 'SORRY',
    'माफी': 'SORRY',

    # Pronouns
    'मैं': 'ME',
    'मुझे': 'ME',
    'मेरा': 'MY',
    'मेरी': 'MY',
    'मेरे': 'MY',
    'तुम': 'YOU',
    'तुम्हारा': 'YOUR',
    'आप': 'YOU',
    'आपका': 'YOUR',
    'वो': 'HE/SHE',
    'उनका': 'THEIR',
    'हमारा': 'OUR',

    # Common verbs
    'खाना': 'EAT',
    'पीना': 'DRINK',
    'जाना': 'GO',
    'आना': 'COME',
    'देखना': 'SEE',
    'सुनना': 'HEAR',
    'बोलना': 'SPEAK',
    'पढ़ना': 'READ',
    'लिखना': 'WRITE',
    'सीखना': 'LEARN',
    'समझना': 'UNDERSTAND',
    'मदद': 'HELP',
    'चाहना': 'WANT',
    'करना': 'DO',
    'देना': 'GIVE',
    'लेना': 'TAKE',
    'बताना': 'TELL',
    'रहना': 'LIVE',
    'चलना': 'WALK',
    'दौड़ना': 'RUN',
    'खेलना': 'PLAY',
    'सोना': 'SLEEP',

    # Common nouns
    'पानी': 'WATER',
    'घर': 'HOME',
    'स्कूल': 'SCHOOL',
    'किताब': 'BOOK',
    'दोस्त': 'FRIEND',
    'परिवार': 'FAMILY',
    'माँ': 'MOTHER',
    'पिता': 'FATHER',
    'भाई': 'BROTHER',
    'बहन': 'SISTER',
    'बच्चा': 'CHILD',
    'लड़का': 'BOY',
    'लड़की': 'GIRL',
    'आदमी': 'MAN',
    'औरत': 'WOMAN',
    'डॉक्टर': 'DOCTOR',
    'शिक्षक': 'TEACHER',
    'काम': 'WORK',
    'समय': 'TIME',
    'दिन': 'DAY',
    'नाम': 'NAME',
    'प्यार': 'LOVE',

    # Adjectives / adverbs
    'अच्छा': 'GOOD',
    'अच्छी': 'GOOD',
    'बुरा': 'BAD',
    'बड़ा': 'BIG',
    'छोटा': 'SMALL',
    'नया': 'NEW',
    'पुराना': 'OLD',
    'सुंदर': 'BEAUTIFUL',
    'खुश': 'HAPPY',
    'उदास': 'SAD',

    # Question words
    'क्या': 'WHAT',
    'कौन': 'WHO',
    'कहाँ': 'WHERE',
    'कब': 'WHEN',
    'कैसे': 'HOW',
    'क्यों': 'WHY',
    'कितना': 'HOW-MUCH',

    # Negation
    'नहीं': 'NOT',
    'मत': 'NOT',
    'न': 'NOT',

    # Numbers
    'एक': 'ONE',
    'दो': 'TWO',
    'तीन': 'THREE',
    'चार': 'FOUR',
    'पांच': 'FIVE',

    # Affirmatives
    'हाँ': 'YES',
    'ठीक': 'OK',
}


def tokenize_hindi(text):
    """
    Simple Hindi tokenizer — splits on whitespace and punctuation.
    For production, use `indic-nlp-library` or `stanza`.
    """
    # Remove punctuation except Devanagari characters
    text = re.sub(r'[।,!?;:\'"()\[\]{}]', ' ', text)
    tokens = text.strip().split()
    return [t for t in tokens if t]


def hindi_to_isl_gloss(text):
    """
    Convert Hindi text to ISL gloss sequence.

    ISL uses a similar SOV structure to Hindi, so the word order
    is mostly preserved (unlike English → ASL which needs reordering).

    Args:
        text: Hindi text in Devanagari script

    Returns:
        list of ISL gloss tokens
    """
    if not text or not isinstance(text, str):
        return []

    tokens = tokenize_hindi(text)
    gloss = []
    has_negation = False

    for token in tokens:
        # Skip stopwords
        if token in HINDI_STOPWORDS:
            continue

        # Check for negation
        if token in ('नहीं', 'मत', 'न'):
            has_negation = True
            continue

        # Look up in mapping
        if token in HINDI_TO_ISL:
            gloss.append(HINDI_TO_ISL[token])
        else:
            # Try to find a partial match (stem-like)
            matched = False
            for hindi_word, isl_sign in HINDI_TO_ISL.items():
                if token.startswith(hindi_word) or hindi_word.startswith(token):
                    gloss.append(isl_sign)
                    matched = True
                    break

            if not matched:
                # Fingerspell: break into Devanagari characters
                for char in token:
                    if char.strip():
                        gloss.append(char)

    # Add negation at end (ISL convention)
    if has_negation:
        gloss.append('NOT')

    return gloss


# ── Test ──
if __name__ == '__main__':
    test_sentences = [
        'नमस्ते मैं स्कूल जाना चाहता हूँ',
        'क्या आपका नाम क्या है',
        'मैं पानी पीना चाहता हूँ',
        'धन्यवाद मदद के लिए',
        'मुझे नहीं समझ आया',
    ]

    print('Hindi → ISL Gloss Conversion')
    print('=' * 50)

    for sentence in test_sentences:
        result = hindi_to_isl_gloss(sentence)
        print(f'  Input: {sentence}')
        print(f'  Gloss: {" ".join(result)}')
        print()
