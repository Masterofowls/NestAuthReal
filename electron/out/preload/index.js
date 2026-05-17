"use strict";
const electron = require("electron");
var BetterAuthError = class extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "BetterAuthError";
    this.message = message;
    this.stack = "";
  }
};
function isProcessType(type) {
  return typeof process !== "undefined" && process.type === type;
}
function getChannelPrefixWithDelimiter(ns = "better-auth") {
  return ns.length > 0 ? ns + ":" : ns;
}
const { ipcRenderer } = electron;
function listenerFactory(channel, listener) {
  ipcRenderer.on(channel, listener);
  return () => {
    ipcRenderer.off(channel, listener);
  };
}
function exposeBridges(opts) {
  if (!process.contextIsolated) throw new BetterAuthError("Context isolation must be enabled to use IPC bridges securely.");
  const prefix = getChannelPrefixWithDelimiter(opts.channelPrefix);
  const bridges = {
    getUser: async () => {
      return await ipcRenderer.invoke(`${prefix}getUser`);
    },
    requestAuth: async (options) => {
      await ipcRenderer.invoke(`${prefix}requestAuth`, options);
    },
    signOut: async () => {
      await ipcRenderer.invoke(`${prefix}signOut`);
    },
    authenticate: async (data) => {
      await ipcRenderer.invoke(`${prefix}authenticate`, data);
    },
    onAuthenticated: (callback) => {
      return listenerFactory(`${prefix}authenticated`, async (_evt, user) => {
        await callback(user);
      });
    },
    onUserUpdated: (callback) => {
      return listenerFactory(`${prefix}user-updated`, async (_evt, user) => {
        await callback(user);
      });
    },
    onAuthError: (callback) => {
      return listenerFactory(`${prefix}error`, async (_evt, context) => {
        await callback(context);
      });
    }
  };
  for (const [key, value] of Object.entries(bridges)) electron.contextBridge.exposeInMainWorld(key, value);
  return {};
}
function setupRenderer(options = {}) {
  if (!isProcessType("renderer")) throw new BetterAuthError("setupRenderer can only be called in the renderer process.");
  exposeBridges(options);
}
setupRenderer();
electron.contextBridge.exposeInMainWorld(
  "requestAuth",
  (opts) => electron.ipcRenderer.invoke("better-auth:request-auth", opts)
);
