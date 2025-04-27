import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('ipcRenderer', {
  // IPC communication
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, ...args)
  },
  invoke: (channel: string, ...args: any[]) => {
    return ipcRenderer.invoke(channel, ...args)
  },
  on: (channel: string, callback: Function) => {
    const newCallback = (_: any, ...args: any[]) => callback(...args)
    ipcRenderer.on(channel, newCallback)
    return () => ipcRenderer.removeListener(channel, newCallback)
  },
  off: (channel: string, callback: Function) => {
    ipcRenderer.removeListener(channel, callback as any)
  },
  // Clipboard methods with improved error handling
  getClipboardData: async () => {
    try {
      return await ipcRenderer.invoke('get-clipboard-data')
    } catch (error) {
      console.error('Error getting clipboard data:', error)
      throw error
    }
  },
  deleteClipboardData: async (id: string) => {
    try {
      return await ipcRenderer.invoke('delete-clipboard-data', id)
    } catch (error) {
      console.error('Error deleting clipboard data:', error)
      throw error
    }
  },
  pinClipboardData: async (id: string) => {
    try {
      return await ipcRenderer.invoke('pin-clipboard-data', id)
    } catch (error) {
      console.error('Error pinning clipboard data:', error)
      throw error
    }
  },
  unpinClipboardData: async (id: string) => {
    try {
      return await ipcRenderer.invoke('unpin-clipboard-data', id)
    } catch (error) {
      console.error('Error unpinning clipboard data:', error)
      throw error
    }
  },
  copyToClipboard: async (content: string) => {
    try {
      return await ipcRenderer.invoke('copy-to-clipboard', content)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      throw error
    }
  },
  getPinnedClipboardData: async () => {
    try {
      return await ipcRenderer.invoke('get-pinned-clipboard-data')
    } catch (error) {
      console.error('Error getting pinned clipboard data:', error)
      throw error
    }
  },
  setWindowOpacity: async (opacity: number) => {
    try {
      return await ipcRenderer.invoke('set-window-opacity', opacity)
    } catch (error) {
      console.error('Error setting window opacity:', error)
      throw error
    }
  },
})

// Let the main process know the preload script has loaded
ipcRenderer.send('preload-loaded')
