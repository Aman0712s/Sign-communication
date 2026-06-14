import numpy as np

def normalize_landmarks(landmarks):
    wrist = landmarks[0]
    centered = [[lm[0] - wrist[0], lm[1] - wrist[1]] for lm in landmarks]
    scale = np.linalg.norm(centered[9]) or 1
    normalized = [[x / scale, y / scale] for x, y in centered]
    return np.array(normalized).flatten()


def predict_sign(landmarks_raw):
    if not landmarks_raw or len(landmarks_raw) != 21:
        return ""

    lm = [[p[0], p[1]] for p in landmarks_raw]

    # ---------- Helpers ----------
    def is_up(tip, pip):
        return lm[tip][1] < lm[pip][1]

    def distance(a, b):
        return np.linalg.norm(np.array(lm[a]) - np.array(lm[b]))

    # Finger states
    thumb = lm[4][0] > lm[3][0]
    index = is_up(8, 6)
    middle = is_up(12, 10)
    ring = is_up(16, 14)
    pinky = is_up(20, 18)

    # ---------- RULES (IMAGE BASED) ----------

    # A → fist
    if not any([index, middle, ring, pinky]) and not thumb:
        return "A"

    # B → all fingers straight, thumb inside
    if all([index, middle, ring, pinky]) and not thumb:
        return "B"

    # C → curved shape (wide gap between index & pinky)
    if all([index, middle, ring, pinky]):
        if distance(8, 20) > 0.3:
            return "C"

    # D → index up only
    if index and not middle and not ring and not pinky:
        return "D"

    # E → curled fingers, thumb in front
    if not index and not middle and not ring and not pinky and thumb:
        return "E"

    # F → thumb + index touching (OK sign)
    if distance(4, 8) < 0.05:
        return "F"

    # G → sideways index
    if index and not middle and not ring and not pinky:
        if abs(lm[8][0] - lm[6][0]) > 0.1:
            return "G"

    # H → index + middle extended sideways
    if index and middle and not ring and not pinky:
        if abs(lm[8][0] - lm[12][0]) > 0.1:
            return "H"

    # I → pinky only
    if pinky and not index and not middle and not ring:
        return "I"
    
    # J → pinky and index only
    if pinky and index and not middle and not ring:
        return "J"

    # K → index + middle with gap
    if index and middle and not ring and not pinky:
        if distance(8, 12) > 0.1:
            return "K"

    # L → thumb + index
    if thumb and index and not middle and not ring and not pinky:
        return "L"

    # M → thumb under fingers (hard → approximate)
    if not index and not middle and not ring and pinky:
        return "M"

    # N → thumb under 2 fingers
    if not index and not middle and ring:
        return "N"

    # O → round (thumb + index close + others curved)
    if distance(4, 8) < 0.1 and not pinky:
        return "O"

    # P → downward K (approx)
    if index and middle and not ring:
        return "P"

    # Q → downward G
    if index and not middle:
        return "Q"

    # R → crossed index & middle (approx)
    if index and middle:
        return "R"

    # S → fist with thumb over
    if not any([index, middle, ring, pinky]) and thumb:
        return "S"

    # T → thumb between fingers (approx)
    if not index and middle:
        return "T"

    # U → index + middle together
    if index and middle and not ring:
        if distance(8, 12) < 0.05:
            return "U"

    # V → index + middle spread
    if index and middle and not ring:
        if distance(8, 12) > 0.1:
            return "V"

    # W → 3 fingers
    if index and middle and ring and not pinky:
        return "W"

    # X → bent index (approx)
    if index and not middle:
        return "X"

    # Y → thumb + pinky
    if thumb and pinky and not index:
        return "Y"

    # Z → motion based (fallback)
    if index:
        return "Z"

    return "?"