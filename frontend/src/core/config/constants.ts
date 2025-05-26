export const APP_NAME = 'Volt Platform';

export const API_VERSION = 'v1';

export const DEFAULT_LOCALE = 'en';
export const SUPPORTED_LOCALES = ['en', 'ko'] as const;

export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  MATCH: '/match',
  SYNTHESIS: '/synthesis',
  LIBRARY: '/library',
  LIBRARY_DETAIL: '/library/:id',
} as const;

export const GRADIENT_BINS = {
  RANGES: ['0-5', '5-10', '10-15', '15-20', '20-25', '25-30', '30+'],
  THRESHOLDS: [0, 5, 10, 15, 20, 25, 30],
} as const;

export const ROLLING_WINDOW = {
  MIN: 10,
  MAX: 1000,
  DEFAULT: 100,
  STEP: 10,
} as const;

export const SYNTHESIS = {
  MAX_RESULTS: 50,
  DEFAULT_RESULTS: 20,
  BBOX_MIN_SIZE_KM: 1,
  BBOX_MAX_SIZE_KM: 100,
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE_MB: 50,
  ACCEPTED_TYPES: ['.gpx', 'application/gpx+xml'],
} as const;

export const CHART_OPTIONS = {
  RESPONSIVE: true,
  MAINTAIN_ASPECT_RATIO: false,
  ANIMATION_DURATION: 300,
} as const;
