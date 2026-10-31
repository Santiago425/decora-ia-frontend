const env = import.meta.env;

function read(name: string, fallback = ''): string {
  const value = env[name];
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : fallback;
}

export const config = Object.freeze({
  appName: read('VITE_APP_NAME'),
  assistantName: read('VITE_ASSISTANT_NAME'),
  apiOrigin: read('VITE_API_URL').replace(/\/$/, ''),
  apiBaseUrl: read('VITE_API_URL').replace(/\/$/, '') + read('VITE_API_PREFIX'),
  aiTimeoutMs: Number(read('VITE_AI_TIMEOUT_MS')) || 180000,
  maxPhotoSide: Number(read('VITE_MAX_PHOTO_SIDE')) || 2048,
  requestTimeoutMs: Number(read('VITE_REQUEST_TIMEOUT_MS')) || 60000,
  currency: read('VITE_CURRENCY'),
  locale: read('VITE_LOCALE'),
  authImageUrl: read('VITE_AUTH_IMAGE_URL'),
  dashboardBannerUrl: read('VITE_DASHBOARD_BANNER_URL'),
  photoCredits: { name: read('VITE_PHOTO_CREDITS_NAME'), url: read('VITE_PHOTO_CREDITS_URL') },
});
