"""
Sign Language Recognizer — ML-based prediction.

Uses a trained Random Forest model to classify hand landmarks
into ASL alphabet letters and common sign words.

Falls back to rule-based detection if the ML model isn't available.
"""

import os
import logging
import numpy as np
from pathlib import Path

logger = logging.getLogger(__name__)

# ── Paths ──
MODEL_DIR = Path(__file__).resolve().parent / 'data' / 'models'
MODEL_PATH = MODEL_DIR / 'sign_model.pkl'
ENCODER_PATH = MODEL_DIR / 'label_encoder.pkl'

# ── Load trained model (lazy) ──
_model = None
_label_encoder = None
_model_loaded = False


def _load_model():
    """Lazy-load the trained model and label encoder."""
    global _model, _label_encoder, _model_loaded

    if _model_loaded:
        return _model is not None

    _model_loaded = True

    if not MODEL_PATH.exists() or not ENCODER_PATH.exists():
        logger.warning(
            "Trained model not found at %s. "
            "Run `python ml_models/train_sign_model.py` to train.",
            MODEL_PATH,
        )
        return False

    try:
        import joblib
        _model = joblib.load(MODEL_PATH)
        _label_encoder = joblib.load(ENCODER_PATH)
        logger.info(
            "Loaded sign recognition model with %d classes",
            len(_label_encoder.classes_),
        )
        return True
    except Exception as e:
        logger.error("Failed to load sign model: %s", e)
        return False


def normalize_landmarks(landmarks):
    """
    Normalize 21 hand landmarks:
    1. Center on wrist (landmark 0)
    2. Scale by distance from wrist to middle finger MCP (landmark 9)
    Returns flattened array of shape (42,).
    """
    lm = np.array(landmarks)

    # Use only x, y (ignore z if present)
    if lm.shape[1] >= 3:
        lm = lm[:, :2]

    wrist = lm[0]
    centered = lm - wrist

    scale = np.linalg.norm(centered[9])
    if scale < 1e-6:
        scale = 1.0
    normalized = centered / scale

    return normalized.flatten()


def predict_sign(landmarks_raw):
    """
    Predict a sign label from 21 hand landmarks.

    Args:
        landmarks_raw: List of 21 landmarks, each [x, y, z] or [x, y].

    Returns:
        str: Predicted sign label (e.g., 'A', 'HELLO') or '?' on failure.
    """
    if not landmarks_raw or len(landmarks_raw) != 21:
        return ""

    # Try ML model first
    if _load_model():
        try:
            features = normalize_landmarks(landmarks_raw)
            features = features.reshape(1, -1)
            prediction = _model.predict(features)[0]
            label = _label_encoder.inverse_transform([prediction])[0]
            return str(label)
        except Exception as e:
            logger.error("ML prediction failed: %s", e)

    # Fallback to rule-based
    return _rule_based_predict(landmarks_raw)


def predict_sign_with_confidence(landmarks_raw):
    """
    Predict sign with confidence score.

    Returns:
        tuple: (label, confidence) where confidence is 0.0–1.0
    """
    if not landmarks_raw or len(landmarks_raw) != 21:
        return ("", 0.0)

    if _load_model():
        try:
            features = normalize_landmarks(landmarks_raw)
            features = features.reshape(1, -1)

            prediction = _model.predict(features)[0]
            label = _label_encoder.inverse_transform([prediction])[0]

            # Get probability
            probabilities = _model.predict_proba(features)[0]
            confidence = float(probabilities.max())

            return (str(label), confidence)
        except Exception as e:
            logger.error("ML prediction failed: %s", e)

    label = _rule_based_predict(landmarks_raw)
    return (label, 0.5 if label != '?' else 0.0)


def _rule_based_predict(landmarks_raw):
    """
    Fallback rule-based sign prediction.
    Simple finger-up/down detection for basic ASL alphabet.
    """
    lm = [[p[0], p[1]] for p in landmarks_raw]

    def is_up(tip, pip):
        return lm[tip][1] < lm[pip][1]

    thumb = lm[4][0] > lm[3][0]
    index = is_up(8, 6)
    middle = is_up(12, 10)
    ring = is_up(16, 14)
    pinky = is_up(20, 18)

    # Basic letter detection
    if not any([index, middle, ring, pinky]) and not thumb:
        return "A"
    if all([index, middle, ring, pinky]) and not thumb:
        return "B"
    if index and not middle and not ring and not pinky:
        return "D"
    if pinky and not index and not middle and not ring:
        return "I"
    if thumb and index and not middle and not ring and not pinky:
        return "L"
    if index and middle and not ring and not pinky:
        return "V"
    if index and middle and ring and not pinky:
        return "W"
    if thumb and pinky and not index and not middle and not ring:
        return "Y"

    return "?"