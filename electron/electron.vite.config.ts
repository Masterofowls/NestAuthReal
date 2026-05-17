import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [
      externalizeDepsPlugin({
        // Must NOT externalize @better-auth/electron so it bundles
        // into the preload script for sandbox-mode compatibility.
        exclude: ['@better-auth/electron'],
      }),
    ],
  },
  renderer: {
    plugins: [react()],
  },
});
