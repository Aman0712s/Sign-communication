"""
Sign Language Recognition — ML Model Training Pipeline

This script:
1. Generates synthetic training data from MediaPipe hand landmark patterns
2. Trains a Random Forest classifier for ASL alphabet + common words
3. Saves the trained model and label encoder

Usage:
    python ml_models/train_sign_model.py
    python ml_models/train_sign_model.py --evaluate
"""

import os
import sys
import json
import argparse
import numpy as np
from pathlib import Path

# Ensure project root is on the path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

DATA_DIR = Path(__file__).resolve().parent / 'data'
MODEL_DIR = DATA_DIR / 'models'
MODEL_DIR.mkdir(parents=True, exist_ok=True)


# ────────────────────────────────────────────────────────────────
# 1. SYNTHETIC LANDMARK DATA GENERATION
# ────────────────────────────────────────────────────────────────
#
# Since we don't have a real dataset yet, we define canonical
# hand landmark positions for each ASL letter based on the
# actual hand configurations used in ASL fingerspelling.
# Each configuration is represented as 21 (x, y) landmarks
# following the MediaPipe Hands model.
#
# In production, this would be replaced by actual collected data.
# ────────────────────────────────────────────────────────────────

# MediaPipe landmark indices:
# 0: WRIST
# 1-4: THUMB (CMC, MCP, IP, TIP)
# 5-8: INDEX (MCP, PIP, DIP, TIP)
# 9-12: MIDDLE (MCP, PIP, DIP, TIP)
# 13-16: RING (MCP, PIP, DIP, TIP)
# 17-20: PINKY (MCP, PIP, DIP, TIP)


def _make_hand(
    thumb_extended=False,
    index_extended=False,
    middle_extended=False,
    ring_extended=False,
    pinky_extended=False,
    thumb_index_touch=False,
    spread_factor=1.0,
):
    """
    Generate a synthetic 21-landmark hand configuration.
    Returns shape (21, 2) with (x, y) normalized coordinates.
    """
    # Base wrist position
    wrist = np.array([0.5, 0.8])

    # Palm base points (MCP joints)
    thumb_cmc = wrist + np.array([-0.08, -0.05])
    index_mcp = wrist + np.array([-0.04, -0.15])
    middle_mcp = wrist + np.array([0.0, -0.16])
    ring_mcp = wrist + np.array([0.04, -0.15])
    pinky_mcp = wrist + np.array([0.07, -0.13])

    def _finger_landmarks(mcp, direction, extended, length=0.12):
        """Generate PIP, DIP, TIP from MCP."""
        d = np.array(direction) * length
        if extended:
            pip = mcp + d * 0.4
            dip = mcp + d * 0.7
            tip = mcp + d * 1.0
        else:
            # Curled finger
            pip = mcp + d * 0.3
            dip = mcp + np.array([d[0] * 0.2, d[1] * 0.1])
            tip = mcp + np.array([d[0] * 0.0, d[1] * -0.02])
        return pip, dip, tip

    # Thumb
    thumb_mcp = thumb_cmc + np.array([-0.03, -0.04])
    if thumb_extended:
        thumb_ip = thumb_mcp + np.array([-0.04, -0.03])
        thumb_tip = thumb_ip + np.array([-0.03, -0.02])
    else:
        thumb_ip = thumb_mcp + np.array([-0.01, -0.02])
        thumb_tip = thumb_ip + np.array([0.01, 0.0])

    if thumb_index_touch:
        # Move thumb tip close to index tip
        thumb_tip = index_mcp + np.array([-0.02, -0.12])

    # Finger directions (pointing up/slightly outward)
    sp = spread_factor
    idx_pip, idx_dip, idx_tip = _finger_landmarks(
        index_mcp, [-0.02 * sp, -1], index_extended
    )
    mid_pip, mid_dip, mid_tip = _finger_landmarks(
        middle_mcp, [0.0, -1], middle_extended
    )
    rng_pip, rng_dip, rng_tip = _finger_landmarks(
        ring_mcp, [0.02 * sp, -1], ring_extended
    )
    pnk_pip, pnk_dip, pnk_tip = _finger_landmarks(
        pinky_mcp, [0.04 * sp, -1], pinky_extended
    )

    landmarks = np.array([
        wrist,                                          # 0
        thumb_cmc, thumb_mcp, thumb_ip, thumb_tip,      # 1-4
        index_mcp, idx_pip, idx_dip, idx_tip,            # 5-8
        middle_mcp, mid_pip, mid_dip, mid_tip,           # 9-12
        ring_mcp, rng_pip, rng_dip, rng_tip,             # 13-16
        pinky_mcp, pnk_pip, pnk_dip, pnk_tip,           # 17-20
    ])

    return landmarks


# Define canonical hand configs for ASL alphabet
ASL_CONFIGS = {
    'A': dict(thumb_extended=False, index_extended=False, middle_extended=False, ring_extended=False, pinky_extended=False),
    'B': dict(thumb_extended=False, index_extended=True, middle_extended=True, ring_extended=True, pinky_extended=True),
    'C': dict(thumb_extended=True, index_extended=True, middle_extended=True, ring_extended=True, pinky_extended=True, spread_factor=1.5),
    'D': dict(thumb_extended=False, index_extended=True, middle_extended=False, ring_extended=False, pinky_extended=False),
    'E': dict(thumb_extended=True, index_extended=False, middle_extended=False, ring_extended=False, pinky_extended=False),
    'F': dict(thumb_extended=True, index_extended=True, middle_extended=True, ring_extended=True, pinky_extended=True, thumb_index_touch=True),
    'G': dict(thumb_extended=True, index_extended=True, middle_extended=False, ring_extended=False, pinky_extended=False),
    'H': dict(thumb_extended=False, index_extended=True, middle_extended=True, ring_extended=False, pinky_extended=False),
    'I': dict(thumb_extended=False, index_extended=False, middle_extended=False, ring_extended=False, pinky_extended=True),
    'J': dict(thumb_extended=False, index_extended=False, middle_extended=False, ring_extended=False, pinky_extended=True),  # motion-based
    'K': dict(thumb_extended=True, index_extended=True, middle_extended=True, ring_extended=False, pinky_extended=False, spread_factor=1.3),
    'L': dict(thumb_extended=True, index_extended=True, middle_extended=False, ring_extended=False, pinky_extended=False, spread_factor=1.5),
    'M': dict(thumb_extended=False, index_extended=False, middle_extended=False, ring_extended=False, pinky_extended=False),
    'N': dict(thumb_extended=False, index_extended=False, middle_extended=False, ring_extended=False, pinky_extended=False),
    'O': dict(thumb_extended=True, index_extended=False, middle_extended=False, ring_extended=False, pinky_extended=False, thumb_index_touch=True),
    'P': dict(thumb_extended=True, index_extended=True, middle_extended=True, ring_extended=False, pinky_extended=False),
    'Q': dict(thumb_extended=True, index_extended=True, middle_extended=False, ring_extended=False, pinky_extended=False),
    'R': dict(thumb_extended=False, index_extended=True, middle_extended=True, ring_extended=False, pinky_extended=False, spread_factor=0.3),
    'S': dict(thumb_extended=True, index_extended=False, middle_extended=False, ring_extended=False, pinky_extended=False),
    'T': dict(thumb_extended=True, index_extended=False, middle_extended=False, ring_extended=False, pinky_extended=False),
    'U': dict(thumb_extended=False, index_extended=True, middle_extended=True, ring_extended=False, pinky_extended=False, spread_factor=0.2),
    'V': dict(thumb_extended=False, index_extended=True, middle_extended=True, ring_extended=False, pinky_extended=False, spread_factor=1.8),
    'W': dict(thumb_extended=False, index_extended=True, middle_extended=True, ring_extended=True, pinky_extended=False, spread_factor=1.5),
    'X': dict(thumb_extended=False, index_extended=True, middle_extended=False, ring_extended=False, pinky_extended=False),
    'Y': dict(thumb_extended=True, index_extended=False, middle_extended=False, ring_extended=False, pinky_extended=True, spread_factor=2.0),
    'Z': dict(thumb_extended=False, index_extended=True, middle_extended=False, ring_extended=False, pinky_extended=False),
}

# Common words (reuse some letter configs + unique ones)
WORD_CONFIGS = {
    'HELLO': dict(thumb_extended=False, index_extended=True, middle_extended=True, ring_extended=True, pinky_extended=True, spread_factor=2.0),
    'THANK YOU': dict(thumb_extended=True, index_extended=True, middle_extended=True, ring_extended=True, pinky_extended=True),
    'YES': dict(thumb_extended=True, index_extended=False, middle_extended=False, ring_extended=False, pinky_extended=False),
    'NO': dict(thumb_extended=True, index_extended=True, middle_extended=True, ring_extended=False, pinky_extended=False),
    'PLEASE': dict(thumb_extended=False, index_extended=False, middle_extended=False, ring_extended=False, pinky_extended=False),
    'SORRY': dict(thumb_extended=False, index_extended=False, middle_extended=False, ring_extended=False, pinky_extended=False),
    'HELP': dict(thumb_extended=True, index_extended=False, middle_extended=False, ring_extended=False, pinky_extended=False),
    'LOVE': dict(thumb_extended=True, index_extended=True, middle_extended=False, ring_extended=False, pinky_extended=True, spread_factor=2.0),
    'GOOD': dict(thumb_extended=True, index_extended=True, middle_extended=True, ring_extended=True, pinky_extended=True),
    'BAD': dict(thumb_extended=False, index_extended=True, middle_extended=True, ring_extended=True, pinky_extended=True),
}


def normalize_landmarks(landmarks):
    """
    Normalize 21 hand landmarks:
    1. Center on wrist (landmark 0)
    2. Scale by distance from wrist to middle finger MCP (landmark 9)
    Returns flattened array of shape (42,).
    """
    wrist = landmarks[0]
    centered = landmarks - wrist

    # Scale by wrist-to-middle-MCP distance
    scale = np.linalg.norm(centered[9])
    if scale < 1e-6:
        scale = 1.0
    normalized = centered / scale

    return normalized.flatten()


def generate_training_data(n_samples_per_class=200, noise_std=0.015):
    """
    Generate synthetic training data with random perturbations.
    """
    all_configs = {}
    all_configs.update(ASL_CONFIGS)
    all_configs.update(WORD_CONFIGS)

    X = []
    y = []

    for label, config in all_configs.items():
        canonical = _make_hand(**config)

        for _ in range(n_samples_per_class):
            # Add random noise
            noisy = canonical + np.random.normal(0, noise_std, canonical.shape)
            # Random scale variation (±10%)
            scale = np.random.uniform(0.9, 1.1)
            noisy = noisy * scale
            # Random translation
            noisy += np.random.uniform(-0.05, 0.05, (1, 2))

            features = normalize_landmarks(noisy)
            X.append(features)
            y.append(label)

    return np.array(X), np.array(y)


# ────────────────────────────────────────────────────────────────
# 2. TRAIN MODEL
# ────────────────────────────────────────────────────────────────

def train_model(evaluate_only=False):
    """Train or evaluate the sign recognition model."""
    from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
    from sklearn.model_selection import train_test_split, cross_val_score
    from sklearn.metrics import classification_report, accuracy_score
    from sklearn.preprocessing import LabelEncoder
    import joblib

    print("=" * 60)
    print("  Sign Language Recognition — Model Training")
    print("=" * 60)

    # Generate data
    print("\n📊 Generating training data...")
    X, y = generate_training_data(n_samples_per_class=300, noise_std=0.015)
    print(f"   Total samples: {len(X)}")
    print(f"   Feature dimension: {X.shape[1]}")
    print(f"   Classes: {len(set(y))}")

    # Encode labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    print(f"   Train: {len(X_train)}, Test: {len(X_test)}")

    # Train Random Forest
    print("\n🌲 Training Random Forest classifier...")
    model = RandomForestClassifier(
        n_estimators=150,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n✅ Test Accuracy: {accuracy:.4f} ({accuracy * 100:.1f}%)")

    # Cross validation
    print("\n🔄 Cross-validation (5-fold)...")
    cv_scores = cross_val_score(model, X, y_encoded, cv=5, scoring='accuracy')
    print(f"   CV Accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    if evaluate_only:
        # Detailed report
        print("\n📋 Classification Report:")
        print(classification_report(
            y_test, y_pred,
            target_names=le.classes_,
            zero_division=0,
        ))
        return

    # Save model and label encoder
    model_path = MODEL_DIR / 'sign_model.pkl'
    encoder_path = MODEL_DIR / 'label_encoder.pkl'
    joblib.dump(model, model_path)
    joblib.dump(le, encoder_path)

    print(f"\n💾 Model saved to: {model_path}")
    print(f"   Encoder saved to: {encoder_path}")

    # Save label map as JSON (for TF.js / frontend use)
    label_map = {int(i): label for i, label in enumerate(le.classes_)}
    label_map_path = MODEL_DIR / 'label_map.json'
    with open(label_map_path, 'w') as f:
        json.dump(label_map, f, indent=2)
    print(f"   Label map saved to: {label_map_path}")

    # Save model metadata
    metadata = {
        'model_type': 'RandomForestClassifier',
        'n_estimators': 150,
        'n_classes': len(le.classes_),
        'n_features': X.shape[1],
        'test_accuracy': float(accuracy),
        'cv_accuracy_mean': float(cv_scores.mean()),
        'cv_accuracy_std': float(cv_scores.std()),
        'classes': list(le.classes_),
    }
    meta_path = MODEL_DIR / 'model_metadata.json'
    with open(meta_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"   Metadata saved to: {meta_path}")

    print("\n✨ Training complete!")
    return model, le


# ────────────────────────────────────────────────────────────────
# 3. MAIN
# ────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Train sign language recognition model')
    parser.add_argument('--evaluate', action='store_true', help='Only evaluate, don\'t save')
    parser.add_argument('--samples', type=int, default=300, help='Samples per class')
    args = parser.parse_args()

    train_model(evaluate_only=args.evaluate)
