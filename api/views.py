"""
API Views for the Sign Language Communication Platform.

Endpoints:
  POST /api/text-to-gloss/   — Convert text to sign language gloss
  POST /api/predict-sign/    — Predict sign from hand landmarks
  GET  /api/signs/           — List available signs
  GET  /api/signs/<word>/    — Get details for a specific sign
"""
import os
import glob
import json
import logging

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.staticfiles import finders
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .serializers import (
    TextToGlossSerializer,
    GlossResponseSerializer,
    PredictSignSerializer,
    PredictSignResponseSerializer,
    SignDictionarySerializer,
    SignDetailSerializer,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# AUTH — Login / Signup
# ---------------------------------------------------------------------------

@api_view(['POST'])
@permission_classes([AllowAny])
def auth_login(request):
    """
    POST /api/auth/login/
    Body: { "username": "...", "password": "..." }
    Returns: { "token": "...", "username": "..." }
    """
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()

    if not username or not password:
        return Response({'error': 'Username and password are required.'},
                        status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({'error': 'Invalid username or password.'},
                        status=status.HTTP_401_UNAUTHORIZED)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'username': user.username},
                    status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def auth_signup(request):
    """
    POST /api/auth/signup/
    Body: { "username": "...", "password": "..." }
    Returns: { "token": "...", "username": "..." }
    """
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()

    if not username or not password:
        return Response({'error': 'Username and password are required.'},
                        status=status.HTTP_400_BAD_REQUEST)

    if len(password) < 8:
        return Response({'error': 'Password must be at least 8 characters.'},
                        status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken. Please choose another.'},
                        status=status.HTTP_409_CONFLICT)

    user = User.objects.create_user(username=username, password=password)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'username': user.username},
                    status=status.HTTP_201_CREATED)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_available_signs():
    """
    Scan the assets directory and return a set of sign words for which
    a .mp4 video file exists (filename without extension, lowered).
    """
    signs = set()
    assets_dir = os.path.join(settings.BASE_DIR, 'assets')
    if os.path.isdir(assets_dir):
        for f in os.listdir(assets_dir):
            if f.lower().endswith('.mp4'):
                signs.add(os.path.splitext(f)[0].lower())
    return signs


def _get_animation_data(word):
    """
    Look up pre-built animation keyframe data for a word.
    Returns a dict with bone rotations / keyframes, or None.
    """
    anim_path = os.path.join(
        settings.BASE_DIR, 'ml_models', 'data', 'animations', f'{word.lower()}.json'
    )
    if os.path.isfile(anim_path):
        with open(anim_path, 'r') as f:
            return json.load(f)
    return None


# ---------------------------------------------------------------------------
# TEXT  ➜  GLOSS
# ---------------------------------------------------------------------------

@api_view(['POST'])
@permission_classes([AllowAny])
def text_to_gloss(request):
    """
    Convert a text sentence into sign-language gloss ordering.
    Supports English (ASL) and Hindi (ISL).
    """
    serializer = TextToGlossSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    text = serializer.validated_data['text']
    language = serializer.validated_data['language']
    available_signs = _get_available_signs()

    if language == 'hi':
        # Hindi NLP pipeline — will be upgraded in Phase 7
        gloss = _hindi_text_to_gloss(text)
    else:
        gloss = _english_text_to_gloss(text)

    # Separate words that have videos vs need fingerspelling
    sign_words = []
    fingerspell_words = []
    for word in gloss:
        if word.lower() in available_signs:
            sign_words.append(word)
        else:
            fingerspell_words.append(word)

    response_data = {
        'original_text': text,
        'language': language,
        'gloss': gloss,
        'available_signs': sign_words,
        'fingerspell': fingerspell_words,
    }
    return Response(response_data, status=status.HTTP_200_OK)


def _english_text_to_gloss(text):
    """
    Convert English text to ASL gloss using NLP pipeline.
    Uses the improved nlp_converter module.
    """
    try:
        from ml_models.nlp_converter import text_to_gloss
        return text_to_gloss(text)
    except ImportError:
        logger.warning("nlp_converter not available, falling back to basic split")
        return [w.upper() for w in text.split() if w.strip()]


def _hindi_text_to_gloss(text):
    """
    Convert Hindi (Devanagari) text to ISL gloss.
    Uses the hindi_nlp module for tokenization and word mapping.
    """
    try:
        from ml_models.hindi_nlp import hindi_to_isl_gloss
        return hindi_to_isl_gloss(text)
    except ImportError:
        logger.warning("hindi_nlp not available, falling back to character split")
        return [ch for ch in text if ch.strip()]


# ---------------------------------------------------------------------------
# SIGN  ➜  TEXT  (landmark prediction)
# ---------------------------------------------------------------------------

@api_view(['POST'])
@permission_classes([AllowAny])
def predict_sign(request):
    """
    Predict a sign label from 21 MediaPipe hand landmarks.
    """
    serializer = PredictSignSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    landmarks = serializer.validated_data['landmarks']
    language = serializer.validated_data['language']

    # Convert [{x, y, z}, ...] ➜ [[x, y, z], ...]
    lm_list = [[p.get('x', 0), p.get('y', 0), p.get('z', 0)] for p in landmarks]

    try:
        from ml_models.sign_recognizer import predict_sign_with_confidence
        label, confidence = predict_sign_with_confidence(lm_list)
    except Exception as e:
        logger.error(f"Sign prediction error: {e}")
        label = "?"
        confidence = 0.0

    response_data = {
        'label': label,
        'confidence': confidence,
        'language': language,
    }
    return Response(response_data, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# SIGNS DICTIONARY
# ---------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([AllowAny])
def signs_list(request):
    """
    Return all available signs with metadata.
    Optional query param: ?category=alphabet|word|number
    """
    category_filter = request.query_params.get('category', None)
    available_signs = _get_available_signs()

    results = []
    for word in sorted(available_signs):
        # Categorize
        if len(word) == 1 and word.isalpha():
            category = 'alphabet'
        elif word.isdigit():
            category = 'number'
        else:
            category = 'word'

        if category_filter and category != category_filter:
            continue

        has_animation = _get_animation_data(word) is not None
        results.append({
            'word': word,
            'has_video': True,
            'has_animation': has_animation,
            'video_url': f'/static/{word}.mp4',
            'category': category,
        })

    return Response(results, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def sign_detail(request, word):
    """
    Return detailed info for a specific sign, including animation data.
    """
    word_lower = word.lower()
    available_signs = _get_available_signs()

    has_video = word_lower in available_signs
    animation_data = _get_animation_data(word_lower)

    data = {
        'word': word_lower,
        'has_video': has_video,
        'has_animation': animation_data is not None,
        'video_url': f'/static/{word_lower}.mp4' if has_video else '',
        'animation_data': animation_data or {},
    }
    return Response(data, status=status.HTTP_200_OK)
