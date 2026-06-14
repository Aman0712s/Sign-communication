/**
 * API Service — Axios client for the Django REST API backend.
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Text → Sign ─────────────────────────────────────────
export async function textToGloss(text, language = 'en') {
  const { data } = await api.post('/text-to-gloss/', { text, language });
  return data;
}

// ── Sign → Text (landmark prediction) ───────────────────
export async function predictSign(landmarks, language = 'en') {
  const { data } = await api.post('/predict-sign/', { landmarks, language });
  return data;
}

// ── Signs Dictionary ────────────────────────────────────
export async function getSignsList(category = null) {
  const params = category ? { category } : {};
  const { data } = await api.get('/signs/', { params });
  return data;
}

export async function getSignDetail(word) {
  const { data } = await api.get(`/signs/${word}/`);
  return data;
}

export default api;
