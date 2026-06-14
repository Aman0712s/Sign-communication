/**
 * Shared API service for the mobile app.
 * Mirrors the web frontend's api.js but uses React Native-compatible fetch.
 */

const API_BASE = __DEV__
  ? 'http://10.0.2.2:8000/api'  // Android emulator → host machine
  : 'http://localhost:8000/api';

async function request(method, endpoint, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function textToGloss(text, language = 'en') {
  return request('POST', '/text-to-gloss/', { text, language });
}

export async function predictSign(landmarks, language = 'en') {
  return request('POST', '/predict-sign/', { landmarks, language });
}

export async function getSignsList(category = null) {
  const params = category ? `?category=${category}` : '';
  return request('GET', `/signs/${params}`);
}

export async function getSignDetail(word) {
  return request('GET', `/signs/${word}/`);
}
