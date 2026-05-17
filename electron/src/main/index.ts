import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { join } from 'node:path';
import { authClient } from './lib/auth-client';

// MUST be called before app.whenReady() to register the protocol handler,
// user-image proxy, CSP headers, and IPC bridges.
authClient.setupMain();

// Custom IPC handler: renderer requests the main process to open the
// sign-in URL in the user's default browser.
ipcMain.handle(
  'better-auth:request-auth',
  async (_, opts?: { provider?: string }) => {
    const signInURL = new URL(
      process.env['BETTER_AUTH_SIGN_IN_URL'] ?? 'http://localhost:3001',
    );
    if (opts?.provider) {
      signInURL.searchParams.set('provider', opts.provider);
    }
    await shell.openExternal(signInURL.toString());
  },
);

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
