import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Helper to get the correct API URL based on platform
const getApiUrl = (): string => {
  // Check if API URL is configured in app.json
  const configuredUrl = Constants.expoConfig?.extra?.apiUrl;
  if (configuredUrl && !configuredUrl.includes('localhost')) {
    return configuredUrl;
  }

  // For Android emulator, use 10.0.2.2 to access host machine
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  }

  // For iOS simulator, localhost should work
  if (Platform.OS === 'ios') {
    return 'http://localhost:3000/api';
  }

  // Default fallback
  return 'http://localhost:3000/api';
};

const getSocketUrl = (): string => {
  // Check if Socket URL is configured in app.json
  const configuredUrl = Constants.expoConfig?.extra?.socketUrl;
  if (configuredUrl && !configuredUrl.includes('localhost')) {
    return configuredUrl;
  }

  // For Android emulator, use 10.0.2.2 to access host machine
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  // For iOS simulator, localhost should work
  if (Platform.OS === 'ios') {
    return 'http://localhost:3000';
  }

  // Default fallback
  return 'http://localhost:3000';
};

// API Configuration
export const API_URL = getApiUrl();
export const SOCKET_URL = getSocketUrl();

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@pollstraw/access_token',
  REFRESH_TOKEN: '@pollstraw/refresh_token',
  USER: '@pollstraw/user',
  SESSION_ID: '@pollstraw/session_id',
  DEVICE_ID: '@pollstraw/device_id',
  THEME: '@pollstraw/theme',
};

// App Constants
export const APP_CONFIG = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_POLL_OPTIONS: 20,
  MIN_POLL_OPTIONS: 2,
  MAX_POLL_TITLE_LENGTH: 200,
  MAX_POLL_DESCRIPTION_LENGTH: 1000,
  MAX_OPTION_TEXT_LENGTH: 200,
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;

// Timeouts
export const API_TIMEOUT = 30000; // 30 seconds
export const SOCKET_TIMEOUT = 10000; // 10 seconds

// Animation durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};
