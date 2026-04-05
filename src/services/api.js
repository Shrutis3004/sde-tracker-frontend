import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ============================================
// CHANGE THIS after deploying backend to Render
// Example: 'https://sde-tracker-api.onrender.com/api'
// ============================================
const PRODUCTION_API = ''; // Set your deployed backend URL here

const getApiUrl = () => {
  // If production URL is set, use it everywhere
  if (PRODUCTION_API) return PRODUCTION_API;
  // Local development fallback
  if (Platform.OS === 'web') return 'http://localhost:8080/api';
  return 'http://192.168.0.57:8080/api'; // Your laptop WiFi IP for local testing
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Storage helper — SecureStore doesn't work on web, fallback to localStorage
export const storage = {
  getItem: async (key) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key, value) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  deleteItem: async (key) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

// Attach token to every request
api.interceptors.request.use(async (config) => {
  const token = await storage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (name, email, password) =>
  api.post('/register', { name, email, password });

export const login = (email, password) =>
  api.post('/login', { email, password });

export const getProfile = () => api.get('/profile');

// Sheets
export const getSheets = () => api.get('/sheets');

export const getSheetTopics = (slug) => api.get(`/sheets/${slug}`);

export const getSheetStats = (slug) => api.get(`/sheets/${slug}/stats`);

// Topics & Problems
export const getTopics = () => api.get('/topics');

export const getTopicProblems = (topicId) =>
  api.get(`/topics/${topicId}/problems`);

// Progress
export const getProgress = () => api.get('/progress');

export const updateProgress = (problemId, status, notes) =>
  api.put('/progress', { problem_id: problemId, status, notes });

// Stats
export const getStats = () => api.get('/stats');

export default api;
