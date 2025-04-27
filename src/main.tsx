import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './ThemeContext.tsx'

// Add debugging for Electron availability
console.log("Initializing app...");
console.log("Window IPC availability:", !!window.ipcRenderer);

// Create a fallback if ipcRenderer is not available
if (!window.ipcRenderer) {
  console.warn("IPC Renderer not available, creating mock implementation");
  window.ipcRenderer = {
    on: (channel, listener) => {
      console.log(`Mock IPC: Registered listener for ${channel}`);
      return window.ipcRenderer;
    },
    off: (channel, listener) => {
      console.log(`Mock IPC: Removed listener for ${channel}`);
      return window.ipcRenderer;
    },
    send: (channel, ...args) => {
      console.log(`Mock IPC: Sent message to ${channel}`, args);
    },
    getClipboardData: async () => {
      console.log("Mock IPC: getClipboardData called");
      return [
        {
          id: 'mock-1',
          content: 'This is mock clipboard data',
          type: 'text',
          timestamp: Date.now(),
          pinned: false
        }
      ];
    },
    // Add other required methods
    deleteClipboardData: async () => true,
    pinClipboardData: async (id) => ({ id, content: 'Mock', type: 'text', timestamp: Date.now(), pinned: true }),
    unpinClipboardData: async (id) => ({ id, content: 'Mock', type: 'text', timestamp: Date.now(), pinned: false }),
    copyToClipboard: async () => true,
    getPinnedClipboardData: async () => [],
    setWindowOpacity: async (opacity) => {
      console.log(`Mock IPC: setWindowOpacity called with opacity ${opacity}`);
      return true;
    }
  } as any;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)

// Use contextBridge
if (window.ipcRenderer) {
  window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log("Received message from main process:", message);
  });
}
