// src/config/apiConfig.js — Resolves the OTP backend URL for web, emulator, and devices.
//
// Physical Android builds cannot use 10.0.2.2 (that is emulator-only).
// They use EXPO_PUBLIC_API_URL, app.json extra.apiBaseUrl, or Expo's LAN host.

import { Platform } from 'react-native';
import Constants from 'expo-constants';

const AUTH_PATH = '/api/auth';
const API_PORT = 5001;

function trimUrl(value) {
  return String(value || '').trim().replace(/\/$/, '');
}

function lanHostFromExpo() {
  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    Constants.linkingUri,
  ];

  for (const value of candidates) {
    const match = String(value || '').match(/(\d{1,3}(?:\.\d{1,3}){3})/);
    if (match) return match[1];
  }

  return null;
}

function resolveApiBaseUrl() {
  const envUrl = trimUrl(process.env.EXPO_PUBLIC_API_URL);
  const extraUrl = trimUrl(
    Constants.expoConfig?.extra?.apiBaseUrl ||
      Constants.manifest?.extra?.apiBaseUrl
  );

  if (envUrl) return envUrl;
  if (extraUrl) return extraUrl;

  if (Platform.OS === 'web') {
    const hostname =
      typeof window !== 'undefined' && window.location?.hostname
        ? window.location.hostname
        : 'localhost';
    return `http://${hostname}:${API_PORT}${AUTH_PATH}`;
  }

  const lanHost = lanHostFromExpo();
  if (lanHost && lanHost !== '10.0.2.2' && lanHost !== '127.0.0.1') {
    return `http://${lanHost}:${API_PORT}${AUTH_PATH}`;
  }

  if (Platform.OS === 'android' && lanHost === '10.0.2.2') {
    return `http://10.0.2.2:${API_PORT}${AUTH_PATH}`;
  }

  return `http://localhost:${API_PORT}${AUTH_PATH}`;
}

export const API_BASE_URL = resolveApiBaseUrl();

console.log(`[API Config] Platform: ${Platform.OS} | API_BASE_URL: ${API_BASE_URL}`);
