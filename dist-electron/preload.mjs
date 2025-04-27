"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  // IPC communication
  send: (channel, ...args) => {
    electron.ipcRenderer.send(channel, ...args);
  },
  on: (channel, callback) => {
    const newCallback = (_, ...args) => callback(...args);
    electron.ipcRenderer.on(channel, newCallback);
    return () => electron.ipcRenderer.removeListener(channel, newCallback);
  },
  off: (channel, callback) => {
    electron.ipcRenderer.removeListener(channel, callback);
  },
  // Clipboard methods
  getClipboardData: () => electron.ipcRenderer.invoke("get-clipboard-data"),
  deleteClipboardData: (id) => electron.ipcRenderer.invoke("delete-clipboard-data", id),
  pinClipboardData: (id) => electron.ipcRenderer.invoke("pin-clipboard-data", id),
  unpinClipboardData: (id) => electron.ipcRenderer.invoke("unpin-clipboard-data", id),
  copyToClipboard: (content) => electron.ipcRenderer.invoke("copy-to-clipboard", content),
  getPinnedClipboardData: () => electron.ipcRenderer.invoke("get-pinned-clipboard-data"),
  setWindowOpacity: (opacity) => electron.ipcRenderer.invoke("set-window-opacity", opacity)
});
electron.ipcRenderer.send("preload-loaded");
