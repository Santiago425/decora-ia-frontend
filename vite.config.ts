import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const VENDOR_CHUNKS: Record<string, string[]> = {
  react: ['react', 'react-dom', 'react-router', 'react-router-dom', 'scheduler', 'use-sync-external-store'],
  three: ['three', '@react-three/fiber', '@react-three/drei', 'three-stdlib'],
};

const SHARED_HELPERS = ['vite/preload-helper', 'commonjsHelpers'];

function vendorChunk(id: string): string | undefined {
  if (SHARED_HELPERS.some((helper) => id.includes(helper))) return 'react';
  const match = id.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
  if (!match) return undefined;
  return Object.keys(VENDOR_CHUNKS).find((chunk) => VENDOR_CHUNKS[chunk].includes(match[1]));
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_');
  return {
    plugins: [react()],
    server: { port: Number(env.VITE_DEV_PORT) || undefined },
    build: { chunkSizeWarningLimit: 1000, rollupOptions: { output: { manualChunks: vendorChunk } } },
    test: { environment: 'node' },
  };
});
