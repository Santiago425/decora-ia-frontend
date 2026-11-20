import { parseFloorSizes } from './utils/measure';

const env = import.meta.env;

function read(name: string, fallback = ''): string {
  const value = env[name];
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : fallback;
}

function list(name: string): string[] {
  return read(name)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export const config = Object.freeze({
  appName: read('VITE_APP_NAME'),
  assistantName: read('VITE_ASSISTANT_NAME'),
  apiOrigin: read('VITE_API_URL').replace(/\/$/, ''),
  apiBaseUrl: read('VITE_API_URL').replace(/\/$/, '') + read('VITE_API_PREFIX'),
  aiTimeoutMs: Number(read('VITE_AI_TIMEOUT_MS')) || 180000,
  maxPhotoSide: Number(read('VITE_MAX_PHOTO_SIDE')) || 2048,
  requestTimeoutMs: Number(read('VITE_REQUEST_TIMEOUT_MS')) || 60000,
  editor: {
    snap: Number(read('VITE_EDITOR_SNAP')) || 0.05,
    moveStep: Number(read('VITE_EDITOR_MOVE_STEP')) || 0.1,
    rotateStep: Number(read('VITE_EDITOR_ROTATE_STEP')) || 15,
    historyLimit: Number(read('VITE_EDITOR_HISTORY_LIMIT')) || 100,
    autosaveMs: Number(read('VITE_EDITOR_AUTOSAVE_MS')) || 1500,
    duplicateOffset: Number(read('VITE_EDITOR_DUPLICATE_OFFSET')) || 0.3,
    overlapTolerance: Number(read('VITE_EDITOR_OVERLAP_TOLERANCE')) || 0.02,
    eyeHeight: Number(read('VITE_EDITOR_EYE_HEIGHT')) || 1.6,
    roomSizePresets: parseFloorSizes(list('VITE_ROOM_SIZE_PRESETS')),
    resizeFactors: [
      Number(read('VITE_EDITOR_RESIZE_MIN_FACTOR')) || 0.5,
      Number(read('VITE_EDITOR_RESIZE_MAX_FACTOR')) || 2,
    ] as [number, number],
  },
  currency: read('VITE_CURRENCY'),
  locale: read('VITE_LOCALE'),
  authImageUrls: list('VITE_AUTH_IMAGE_URL'),
  sidebarPhotoUrls: list('VITE_SIDEBAR_PHOTO_URL').length
    ? list('VITE_SIDEBAR_PHOTO_URL')
    : list('VITE_AUTH_IMAGE_URL'),
  dashboardBannerUrl: list('VITE_DASHBOARD_BANNER_URL')[0] ?? '',
  dashboardBackdropUrl: read('VITE_DASHBOARD_BACKDROP_URL'),
  emptyStateImageUrl: read('VITE_EMPTY_STATE_IMAGE_URL'),
  photo: {
    widths: list('VITE_PHOTO_WIDTHS')
      .map(Number)
      .filter((width) => width > 0),
    defaultWidth: Number(read('VITE_PHOTO_DEFAULT_WIDTH')) || 1920,
    quality: Number(read('VITE_PHOTO_QUALITY')) || 80,
  },
  photoIntervalMs: Number(read('VITE_PHOTO_INTERVAL_MS')) || 6000,
  recentRedesignsLimit: Number(read('VITE_RECENT_REDESIGNS_LIMIT')) || 6,
  photoCredits: { name: read('VITE_PHOTO_CREDITS_NAME'), url: read('VITE_PHOTO_CREDITS_URL') },
});
