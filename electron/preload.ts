import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('ipcRenderer', {
  // IPC communication
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, ...args)
  },
  on: (channel: string, callback: Function) => {
    const newCallback = (_: any, ...args: any[]) => callback(...args)
    ipcRenderer.on(channel, newCallback)
    return () => ipcRenderer.removeListener(channel, newCallback)
  },
  off: (channel: string, callback: Function) => {
    ipcRenderer.removeListener(channel, callback as any)
  },
  // Clipboard methods
  getClipboardData: () => ipcRenderer.invoke('get-clipboard-data'),
  deleteClipboardData: (id: string) => ipcRenderer.invoke('delete-clipboard-data', id),
  pinClipboardData: (id: string) => ipcRenderer.invoke('pin-clipboard-data', id),
  unpinClipboardData: (id: string) => ipcRenderer.invoke('unpin-clipboard-data', id),
  copyToClipboard: (content: string) => ipcRenderer.invoke('copy-to-clipboard', content),
  getPinnedClipboardData: () => ipcRenderer.invoke('get-pinned-clipboard-data'),
  setWindowOpacity: (opacity: number) => ipcRenderer.invoke('set-window-opacity', opacity),
})

// Let the main process know the preload script has loaded
ipcRenderer.send('preload-loaded')
