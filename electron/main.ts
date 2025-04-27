import { app, BrowserWindow, Tray, Menu, nativeImage, globalShortcut, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import clipboard from 'electron-clipboard-extended';
import Datastore from 'nedb';
import { getLinkPreview } from 'link-preview-js';

// Disable hardware acceleration before app is ready
app.disableHardwareAcceleration();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Datastore({ filename: path.join(__dirname, 'clipboardData.db'), autoload: true });

let win: BrowserWindow | null = null;
let tray: Tray | null = null;

// Interface for Clipboard Items
interface ClipboardItem {
  id: string;
  type: 'text' | 'image' | 'link';
  content: string;
  timestamp: number;
  pinned?: boolean;
  metadata?: any; 
}

// Start clipboard watching after app is ready
app.whenReady().then(() => {
  clipboard.startWatching();
});

// Create the main window
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(__dirname, 'icon.png'),
    frame: false,
    show: false,
    resizable: false,
    movable: true,
    modal: true,
    transparent: true,
    alwaysOnTop: true,
    vibrancy: 'under-window', // Add vibrancy effect for macOS
    visualEffectState: 'active', // Keep the effect active
    backgroundColor: '#00000000', // Transparent background
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, 'index.html'));
  }

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });
  
  // Prevent the window from closing when it loses focus
  win.on('blur', () => {
    // Don't hide the window on blur if it was just shown via shortcut
    // This will be handled by the shortcut handler
    console.log('Window blurred, but not hiding automatically');
  });
}

// Register global hotkey
function registerHotkey() {
  globalShortcut.register('Cmd+Shift+Space', () => {
    if (!win) return;

    // Toggle visibility
    if (win.isVisible()) {
      win.hide();
    } else {

      // Set a flag to prevent immediate hiding
      let justShown = true;
      
      win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      win.show();
      win.focus();

      // Reset the workspace setting
      setTimeout(() => {
        win.setVisibleOnAllWorkspaces(false);
        
        // Clear the flag after a short delay
        setTimeout(() => {
          justShown = false;
        }, 500);
      }, 100);
      
      // Prevent the window from being hidden immediately after showing
      win.once('blur', () => {
        if (justShown) {
          // If the window just got shown, don't hide it on blur
          console.log('Preventing auto-hide after shortcut activation');
          return;
        }
      });
    }
  });
}

// Create system tray
function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'tray-icon.png'));
  tray = new Tray(icon);
  tray.setToolTip('Clipboard Manager');
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Clipboard Manager',
      click: () => win?.show(),
    },
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ]);
  tray.setContextMenu(contextMenu);
}

// Save clipboard item to the database
function saveClipboardItem(item: ClipboardItem) {
  db.insert(item, (err, newDoc) => {
    if (err) {
      console.error('Error saving clipboard item:', err);
    } else {
      console.log('Clipboard item saved:', newDoc);
      // Notify frontend of new item
      if (win) {
        win.webContents.send('clipboard-item-added', newDoc);
      }
    }
  });
}

// Fetch all clipboard data
function getClipboardData(): Promise<ClipboardItem[]> {
  return new Promise((resolve, reject) => {
    db.find({}, (err, docs) => {
      if (err) {
        console.error('Error fetching clipboard data:', err);
        return reject(err);
      }
      resolve(docs.sort((a, b) => b.timestamp - a.timestamp)); // Sort by timestamp
    });
  });
}

// Helper to validate URLs
function isValidURL(content: string): boolean {
  try {
    new URL(content);
    return true;
  } catch {
    return false;
  }
}

// Watch clipboard for text changes with improved error handling
clipboard.on('text-changed', async () => {
  try {
    const content = clipboard.readText();
    if (!content || content.trim() === '') return;

    const id = Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();

    let type: 'text' | 'link' = 'text';
    let metadata: any = null;

    // Check if the content is a URL and extract metadata if it's a link
    if (isValidURL(content)) {
      type = 'link';
      try {
        metadata = await getLinkPreview(content);
      } catch (err) {
        console.error('Error getting link preview:', err);
      }
    }

    const newItem: ClipboardItem = { id, type, content, timestamp, metadata };

    // Save to database if it's not a duplicate
    db.findOne({ content }, (err, existingItem) => {
      if (err) {
        console.error('Error checking existing items:', err);
        return;
      }
      if (!existingItem) {
        saveClipboardItem(newItem);
      }
    });
  } catch (error) {
    console.error('Error handling text clipboard change:', error);
  }
});

// Watch clipboard for images with improved error handling
clipboard.on('image-changed', async (imageData: any) => {
  try {
    if (!imageData || imageData.isEmpty()) return;

    const id = Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();
    const content = imageData.toDataURL();

    const newItem: ClipboardItem = { id, type: 'image', content, timestamp };

    // Save to database if it's not a duplicate
    db.findOne({ content }, (err, existingItem) => {
      if (err) {
        console.error('Error checking existing image items:', err);
        return;
      }
      if (!existingItem) {
        saveClipboardItem(newItem);
      }
    });
  } catch (error) {
    console.error('Error handling image clipboard change:', error);
  }
});

// IPC Handlers with improved error handling
ipcMain.handle('get-clipboard-data', async () => {
  try {
    return await getClipboardData();
  } catch (error) {
    console.error('Error getting clipboard data:', error);
    throw error;
  }
});

ipcMain.handle('delete-clipboard-data', async (event, id: string) => {
  return new Promise((resolve, reject) => {
    if (!id) {
      reject(new Error('Invalid ID provided'));
      return;
    }
    
    db.remove({ id }, { multi: false }, (err, numRemoved) => {
      if (err) {
        console.error('Error deleting clipboard item:', err);
        reject(err);
        return;
      }
      resolve(numRemoved > 0);
    });
  });
});

ipcMain.handle('pin-clipboard-data', async (event, id: string) => {
  return new Promise((resolve, reject) => {
    if (!id) {
      reject(new Error('Invalid ID provided'));
      return;
    }

    db.update(
      { id },
      { $set: { pinned: true } },
      { returnUpdatedDocs: true },
      (err: Error | null, _numAffected: number, affectedDocuments: any) => {
        if (err) {
          console.error('Error pinning clipboard item:', err);
          reject(err);
          return;
        }
        resolve(affectedDocuments);
      }
    );
  });
});

ipcMain.handle('unpin-clipboard-data', async (event, id: string) => {
  return new Promise((resolve, reject) => {
    if (!id) {
      reject(new Error('Invalid ID provided'));
      return;
    }

    db.update(
      { id },
      { $set: { pinned: false } },
      { returnUpdatedDocs: true },
      (err: Error | null, _numAffected: number, affectedDocuments: any) => {
        if (err) {
          console.error('Error unpinning clipboard item:', err);
          reject(err);
          return;
        }
        resolve(affectedDocuments);
      }
    );
  });
});

ipcMain.handle('copy-to-clipboard', async (event, content: string) => {
  try {
    if (!content) throw new Error('No content provided');
    
    clipboard.writeText(content);
    const activeWindow = BrowserWindow.fromWebContents(event.sender);
    if (activeWindow) {
      activeWindow.blur();
    }
    win?.hide();
    return { success: true };
  } catch (error: any) {
    console.error('Error during copy-and-paste:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-pinned-clipboard-data', async () => {
  return new Promise((resolve, reject) => {
    db.find({ pinned: true }).sort({ timestamp: -1 }).exec((err: Error | null, docs: any[]) => {
      if (err) {
        console.error('Error getting pinned clipboard data:', err);
        reject(err);
        return;
      }
      resolve(docs);
    });
  });
});

ipcMain.handle('set-window-opacity', async (event, opacity: number) => {
  try {
    if (typeof opacity !== 'number' || opacity < 0 || opacity > 1) {
      throw new Error('Invalid opacity value');
    }

    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.setOpacity(opacity);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error setting window opacity:', error);
    throw error;
  }
});

// App Event Listeners
app.whenReady().then(async () => {
  try {
    createWindow();
    createTray();
    registerHotkey();
    
    // Periodically check if the window is responsive
    setInterval(() => {
      if (win && !win.webContents.isDestroyed()) {
        win.webContents.executeJavaScript('console.log("Window health check")')
          .catch(err => {
            console.error('Window appears to be unresponsive:', err);
            createWindow(); // Recreate window if unresponsive
          });
      }
    }, 30000); // Check every 30 seconds
  } catch (error) {
    console.error('Error during app initialization:', error);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Add this handler in the appropriate place after creating the window
// Add this handler for the hide-window event
ipcMain.on('hide-window', () => {
  if (win && win.isVisible()) {
    win.hide();
  }
});

// Add this handler for updating window transparency
ipcMain.handle('update-window-transparency', (_event, opacity) => {
  if (win) {
    win.setOpacity(opacity);
    return true;
  }
  return false;
});
