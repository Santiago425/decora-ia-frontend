const env = import.meta.env;

function read(name: string, fallback = ''): string {
  const value = env[name];
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : fallback;
}

export const config = Object.freeze({
  appName: read('VITE_APP_NAME'),
  assistantName: read('VITE_ASSISTANT_NAME'),
  apiBaseUrl: read('VITE_API_URL').replace(/\/$/, '') + read('VITE_API_PREFIX'),
  requestTimeoutMs: Number(read('VITE_REQUEST_TIMEOUT_MS')) || 60000,
  currency: read('VITE_CURRENCY'),
  locale: read('VITE_LOCALE'),
  authImageUrl: read('VITE_AUTH_IMAGE_URL'),
  dashboardBannerUrl: read('VITE_DASHBOARD_BANNER_URL'),
  photoCredits: { name: read('VITE_PHOTO_CREDITS_NAME'), url: read('VITE_PHOTO_CREDITS_URL') },
});
