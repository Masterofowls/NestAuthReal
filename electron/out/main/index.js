"use strict";
const electron = require("electron");
const node_path = require("node:path");
const client = require("better-auth/client");
const client$1 = require("@better-auth/electron/client");
const storage = require("@better-auth/electron/storage");
const authClient = client.createAuthClient({
  baseURL: process.env["BETTER_AUTH_BACKEND_URL"] ?? "http://localhost:3000",
  basePath: "/api/auth",
  plugins: [
    client$1.electronClient({
      // The Next.js page that calls ensureElectronRedirect()
      signInURL: process.env["BETTER_AUTH_SIGN_IN_URL"] ?? "http://localhost:3001",
      protocol: {
        // Must match trustedOrigins in the backend and electronProxyClient
        scheme: "com.example.nestauth"
      },
      // Default conf-based storage persisted in userData directory
      storage: storage.storage()
    })
  ]
});
authClient.setupMain();
electron.ipcMain.handle(
  "better-auth:request-auth",
  async (_, opts) => {
    const signInURL = new URL(
      process.env["BETTER_AUTH_SIGN_IN_URL"] ?? "http://localhost:3001"
    );
    if (opts?.provider) {
      signInURL.searchParams.set("provider", opts.provider);
    }
    await electron.shell.openExternal(signInURL.toString());
  }
);
function createWindow() {
  const win = new electron.BrowserWindow({
    width: 960,
    height: 720,
    title: "NestAuth — Electron Testing Client",
    webPreferences: {
      // Required security settings — never change these.
      // electron-vite v3 with CJS package compiles preload to index.js (not .mjs)
      preload: node_path.join(__dirname, "../preload/index.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  if (process.env["ELECTRON_RENDERER_URL"]) {
    win.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    win.loadFile(node_path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") electron.app.quit();
});
