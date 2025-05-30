"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  // IPC communication
  send: (channel, ...args) => {
    electron.ipcRenderer.send(channel, ...args);
  },
  invoke: (channel, ...args) => {
    return electron.ipcRenderer.invoke(channel, ...args);
  },
  on: (channel, callback) => {
    const newCallback = (_, ...args) => callback(...args);
    electron.ipcRenderer.on(channel, newCallback);
    return () => electron.ipcRenderer.removeListener(channel, newCallback);
  },
  off: (channel, callback) => {
    electron.ipcRenderer.removeListener(channel, callback);
  },
  // Clipboard methods with improved error handling
  getClipboardData: async () => {
    try {
      return await electron.ipcRenderer.invoke("get-clipboard-data");
    } catch (error) {
      console.error("Error getting clipboard data:", error);
      throw error;
    }
  },
  deleteClipboardData: async (id) => {
    try {
      return await electron.ipcRenderer.invoke("delete-clipboard-data", id);
    } catch (error) {
      console.error("Error deleting clipboard data:", error);
      throw error;
    }
  },
  pinClipboardData: (id) => electron.ipcRenderer.invoke('pin-clipboard-item', id),
  unpinClipboardData: (id) => electron.ipcRenderer.invoke('pin-clipboard-item', id),
  copyToClipboard: async (content) => {
    try {
      return await electron.ipcRenderer.invoke("copy-to-clipboard", content);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      throw error;
    }
  },
  getPinnedClipboardData: async () => {
    try {
      return await electron.ipcRenderer.invoke("get-pinned-clipboard-data");
    } catch (error) {
      console.error("Error getting pinned clipboard data:", error);
      throw error;
    }
  },
  setWindowOpacity: async (opacity) => {
    try {
      return await electron.ipcRenderer.invoke("set-window-opacity", opacity);
    } catch (error) {
      console.error("Error setting window opacity:", error);
      throw error;
    }
  }
});
electron.ipcRenderer.send("preload-loaded");
