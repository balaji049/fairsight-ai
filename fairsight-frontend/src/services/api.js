// src/services/api.js
// All API calls to the FairSight FastAPI backend

import axios from 'axios';

// ── Config ────────────────────────────────────────────────────────────────────
// Set REACT_APP_API_URL in your .env file:
//   REACT_APP_API_URL=https://fairsight-api-xxxx-uc.a.run.app
// Defaults to localhost:8000 for local dev
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // Gemini can take a few seconds
});

// ── Full Audit (single call — recommended for MVP) ───────────────────────────
// Runs analyze + explain + compliance in one request
export const runFullAudit = async (file, domain) => {
  const form = new FormData();
  form.append('file', file);
  form.append('domain', domain);
  const { data } = await api.post('/full-audit', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// ── Individual endpoints (if you need granular control) ───────────────────────
export const analyzeDataset = async (file, domain) => {
  const form = new FormData();
  form.append('file', file);
  form.append('domain', domain);
  const { data } = await api.post('/analyze', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const explainBias = async (domain, biasResults) => {
  const { data } = await api.post('/explain', {
    domain,
    bias_results: biasResults,
  });
  return data;
};

export const checkCompliance = async (domain, biasResults) => {
  const { data } = await api.post('/compliance', {
    domain,
    bias_results: biasResults,
  });
  return data;
};

export const healthCheck = async () => {
  const { data } = await api.get('/health');
  return data;
};
