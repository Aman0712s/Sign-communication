from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.staticfiles import finders

# Import NLTK properly
import nltk
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from ml_models.sign_recognizer import predict_sign

@login_required(login_url="login")
def sign_to_text_view(request):
    return render(request, 'sign_to_text.html', {'title': 'Sign → Text'})

@csrf_exempt  
@login_required(login_url="login")
def predict_sign_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            landmarks = data.get('landmarks', [])  # list of 21 {x,y,z} dicts
            # Convert to list of [x, y, z]
            lm_list = [[p['x'], p['y'], p['z']] for p in landmarks]
            label = predict_sign(lm_list)
            return JsonResponse({'label': label})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'POST only'}, status=405)

# Download required NLTK data (only once)
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('taggers/averaged_perceptron_tagger')
except LookupError:
    nltk.download('averaged_perceptron_tagger')

# Initialize lemmatizer and stopwords
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))


def home_view(request):
    return render(request, 'home.html', {
        'title': 'Home',
        'tagline': 'Convert your audio or text into expressive sign language animations instantly.'
    })


def about_view(request):
    return render(request, 'about.html', {
        'title': 'About'
    })


def contact_view(request):
    return render(request, 'contact.html', {
        'title': 'Contact'
    })


@login_required(login_url="login")
def animation_view(request):

    context = {'title': 'Converter'}

    if request.method == 'POST':

        text = request.POST.get('sen', '').strip()

        if not text:
            messages.warning(request, "Enter a sentence first.")
            return render(request, 'animation.html', context)

        # Convert to lowercase
        text = text.lower()
        
        try:
            # Tokenize the sentence
            words = word_tokenize(text)
            print(f"Tokenized words: {words}")  # Debug print
            
            # Remove stopwords and lemmatize
            filtered = []
            
            for word in words:
                # Skip stopwords
                if word not in stop_words:
                    # Lemmatize the word
                    lemma = lemmatizer.lemmatize(word)
                    filtered.append(lemma)
            
            print(f"Filtered words: {filtered}")  # Debug print
            
            # If filtering removed all words, use original words
            if not filtered:
                filtered = words
            
            # Check for video files
            processed = []
            for word in filtered:
                # Try to find the video file
                file = finders.find(f"{word}.mp4")
                
                if file:
                    # Video exists - use the word
                    processed.append(word)
                else:
                    # Video doesn't exist - split into letters
                    for letter in word:
                        processed.append(letter)
            
            print(f"Final processed: {processed}")  # Debug print
            
            context['text'] = text
            context['words'] = processed
            
        except Exception as e:
            print(f"NLTK Error: {e}")
            messages.error(request, f"Error processing text: {str(e)}")
            # Fallback: just split the text
            context['text'] = text
            context['words'] = text.split()

    return render(request, 'animation.html', context)


def signup_view(request):

    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, "Account created successfully!")
            return redirect('animation')
    else:
        form = UserCreationForm()

    return render(request, 'signup.html', {'form': form})


def login_view(request):

    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, f"Welcome back, {user.username}!")
            return redirect('animation')
    else:
        form = AuthenticationForm()

    return render(request, 'login.html', {'form': form})


def logout_view(request):
    logout(request)
    messages.info(request, "Logged out successfully.")
    return redirect('home')