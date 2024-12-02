import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
  getClipboardData: () => ipcRenderer.invoke('get-clipboard-data'),
  deleteClipboardData: (id: string) => ipcRenderer.invoke('delete-clipboard-item', id),
  pinClipboardData: (id: string) => ipcRenderer.invoke('pin-clipboard-item', id),
  fetchLinkPreview: (url :any) => ipcRenderer.invoke('get-link-preview', url),
  copyToClipboard: (data :any) => ipcRenderer.invoke('copy-to-clipboard', data),
});
