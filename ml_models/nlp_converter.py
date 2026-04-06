import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import os

# Download NLTK data if needed
def download_nltk_data():
    """Download required NLTK data packages"""
    packages = ['punkt', 'stopwords', 'wordnet', 'averaged_perceptron_tagger']
    for package in packages:
        try:
            nltk.data.find(f'tokenizers/{package}')
        except LookupError:
            print(f"Downloading {package}...")
            nltk.download(package)

# Initialize
download_nltk_data()
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

def text_to_gloss(sentence):
    """
    Convert English sentence to Sign Language Gloss
    
    Args:
        sentence (str): Input English sentence
    
    Returns:
        list: List of gloss words
    """
    if not sentence or not isinstance(sentence, str):
        return []
    
    # Convert to lowercase
    sentence = sentence.lower().strip()
    
    try:
        # Tokenize
        words = word_tokenize(sentence)
        
        # Process each word
        gloss_words = []
        
        for word in words:
            # Skip stopwords
            if word in stop_words:
                continue
            
            # Lemmatize
            lemma = lemmatizer.lemmatize(word)
            
            # Handle special cases
            if lemma == 'i':
                gloss_words.append('ME')
            elif lemma in ['am', 'is', 'are', 'was', 'were']:
                continue  # Skip be verbs
            else:
                gloss_words.append(lemma.upper())
        
        return gloss_words
        
    except Exception as e:
        print(f"Error processing sentence: {e}")
        return []

def process_sentence_with_tense(sentence):
    """
    Advanced processing with tense detection
    """
    words = word_tokenize(sentence.lower())
    tagged = nltk.pos_tag(words)
    
    gloss = []
    
    for word, tag in tagged:
        if word not in stop_words:
            if tag.startswith('VB'):  # Verb
                lemma = lemmatizer.lemmatize(word, pos='v')
                
                # Add tense indicators
                if tag in ['VBD', 'VBN']:  # Past tense
                    if 'BEFORE' not in gloss:
                        gloss.append('BEFORE')
                elif tag == 'VBG':  # Present continuous
                    if 'NOW' not in gloss:
                        gloss.append('NOW')
                
                gloss.append(lemma.upper())
            else:
                lemma = lemmatizer.lemmatize(word)
                if lemma == 'i':
                    gloss.append('ME')
                else:
                    gloss.append(lemma.upper())
    
    return gloss

# Test the module
if __name__ == "__main__":
    test_sentences = [
        "I am going to college",
        "Hello world",
        "She was eating food",
        "They will come tomorrow"
    ]
    
    print("Testing text_to_gloss function:")
    print("-" * 40)
    
    for sentence in test_sentences:
        result = text_to_gloss(sentence)
        print(f"Input: {sentence}")
        print(f"Gloss: {result}")
        print()