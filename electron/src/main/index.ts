import { app, BrowserWindow } from 'electron';
import { join } from 'node:path';
import { authClient } from './lib/auth-client';

// MUST be called before app.whenReady() to register the protocol handler,
// user-image proxy, CSP headers, and IPC bridges (including better-auth:requestAuth
// which opens the frontend PKCE sign-in URL with code_challenge + state).
authClient.setupMain();

function createWindow(): void {
  const win = new BrowserWindow({
    width: 960,
    height: 720,
    title: 'NestAuth — Electron Testing Client',
    webPreferences: {
      // Required security settings — never change these.
      // electron-vite v3 with CJS package compiles preload to index.js (not .mjs)
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // electron-vite hot-reload URL in dev mode
  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
