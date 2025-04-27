import { app, BrowserWindow, Tray, Menu, nativeImage, globalShortcut, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import clipboard from 'electron-clipboard-extended';
import Datastore from 'nedb';
import { getLinkPreview } from 'link-preview-js';

// Disable hardware acceleration before app is ready
app.disableHardwareAcceleration();

// Performance optimizations
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Datastore({ filename: path.join(__dirname, 'clipboardData.db'), autoload: true });

let win: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

// Interface for Clipboard Items
interface ClipboardItem {
  id: string;
  type: 'text' | 'image' | 'link';
  content: string;
  timestamp: number;
  pinned?: boolean;
  metadata?: any; 
}

function createWindow() {
  win = new BrowserWindow({
    width: 680,
    height: 450,
    show: false,
    frame: false,
    resizable: true,
    maximizable: false,
    minimizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: false,
    },
  });

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    const distPath = process.env.DIST || path.join(__dirname, '../dist');
    win.loadFile(path.join(distPath, 'index.html'));
  }

  // Show window when ready
  win.once('ready-to-show', () => {
    win?.show();
    win?.focus();
  });

  // Handle window blur
  win.on('blur', () => {
    if (!isQuitting) {
      win?.hide();
    }
  });

  // Handle window close
  win.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      win?.hide();
    }
  });

  // Create tray icon
  const icon = nativeImage.createFromPath(path.join(__dirname, 'icon.png'));
  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        showWindow();
      }
    },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('Slate Clipboard Manager');
  
  tray.on('click', () => {
    showWindow();
  });
}

function showWindow() {
  if (!win) return;
  
  // Get the mouse position
  const { screen } = require('electron');
  const mousePos = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(mousePos);
  
  // Calculate window position
  const windowBounds = win.getBounds();
  const x = Math.round(mousePos.x - (windowBounds.width / 2));
  const y = Math.round(mousePos.y - 10);
  
  // Ensure window is within screen bounds
  const adjustedX = Math.max(
    display.bounds.x,
    Math.min(x, display.bounds.x + display.bounds.width - windowBounds.width)
  );
  const adjustedY = Math.max(
    display.bounds.y,
    Math.min(y, display.bounds.y + display.bounds.height - windowBounds.height)
  );
  
  win.setPosition(adjustedX, adjustedY);
  win.show();
  win.focus();
}

// Register global hotkey
function registerHotkey() {
  const success = globalShortcut.register('CommandOrControl+Shift+V', () => {
    if (win?.isVisible()) {
      win.hide();
    } else {
      showWindow();
    }
  });

  if (!success) {
    console.error('Failed to register hotkey');
  }
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

// App lifecycle handlers
app.on('ready', () => {
  createWindow();
  registerHotkey();
  clipboard.startWatching();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});
