import { app, BrowserWindow, Tray, Menu, nativeImage, globalShortcut, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import clipboard from 'electron-clipboard-extended';
import Datastore from 'nedb';
import { getLinkPreview } from 'link-preview-js';

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

clipboard.startWatching();

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
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
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
}

// Register global hotkey
function registerHotkey() {
  globalShortcut.register('Cmd+Shift+Space', () => {
    if (!win) return;

    // Toggle visibility
    if (win.isVisible()) {
      win.hide();
    } else {
      win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      win.show();
      win.focus();

      setTimeout(() => {
        win.setVisibleOnAllWorkspaces(false);
      }, 100);
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

clipboard.on('text-changed', async () => {
  const content = clipboard.readText();
  if (content) {
    const id = Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();

    let type: 'text' | 'link' = 'text';
    let metadata: any = null;

    // Check if the content is a URL and extract metadata if it's a link
    if (isValidURL(content)) {
      type = 'link';
      console.log(type)
    }

    const newItem: ClipboardItem = { id, type, content, timestamp, metadata };

    // Save to database if it's not a duplicate
    db.findOne({ content }, (err, existingItem) => {
      if (err) return console.error('Error checking existing items:', err);
      if (!existingItem) {
        saveClipboardItem(newItem);
      }
    });
  }
});

clipboard.on('')

// Watch clipboard for images
clipboard.on('image-changed', (imageData: any) => {
  console.log('Image data:', imageData);
  const id = Math.random().toString(36).substr(2, 9);
  const timestamp = Date.now();
  const content = imageData.toDataURL(); // Store image as base64 string

  const newItem: ClipboardItem = { id, type: 'image', content, timestamp };

  // Save to database if it's not a duplicate
  db.findOne({ content }, (err, existingItem) => {
    if (err) return console.error('Error checking existing image items:', err);
    if (!existingItem) {
      saveClipboardItem(newItem);
    }
  });
});

// IPC Handlers
ipcMain.handle('get-clipboard-data', async () => {
  return await getClipboardData();
});

ipcMain.handle('delete-clipboard-item', async (event, id: string) => {
  return new Promise((resolve, reject) => {
    db.remove({ id }, { multi: false }, (err, numRemoved) => {
      if (err) {
        console.error('Error deleting clipboard item:', err);
        return reject(false);
      }
      resolve(numRemoved > 0);
    });
  });
});

ipcMain.handle('get-link-preview', async (event, url: string) => {
  try {
    const metadata = await fetchLinkMetadata(url);
    return metadata;
  } catch (error) {
    console.error('Error fetching link preview:', error);
    return null;
  }
});

ipcMain.handle('copy-to-clipboard', async (event: any, data: string) => {
  try {
    clipboard.writeText(data);
    const activeWindow = BrowserWindow.getFocusedWindow();
    if (activeWindow) {
      activeWindow.blur();
    }
    win?.hide()
    return { success: true };
  } catch (error: any) {
    console.error('Error during copy-and-paste:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('pin-clipboard-item', async (event, id: string) => {
  return new Promise((resolve, reject) => {
    if (!id) return reject(new Error('Invalid ID'));

    db.findOne({ id }, (err: any, item: any) => {
      if (err) return reject(new Error('Error finding clipboard item'));
      if (!item) return reject(new Error('Clipboard item not found'));

      const updatedPinnedState = !item.pinned;
      db.update({ id }, { $set: { pinned: updatedPinnedState } }, { multi: false }, (err) => {
        if (err) return reject(new Error('Error updating pinned state'));
        resolve({ ...item, pinned: updatedPinnedState });
      });
    });
  });
});

// App Event Listeners
app.on('ready', () => {
  createWindow();
  createTray();
  registerHotkey();
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
