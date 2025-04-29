import { app, BrowserWindow, Tray, Menu, nativeImage, globalShortcut, ipcMain, screen } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import clipboard from 'electron-clipboard-extended';
import Datastore from 'nedb';
import { getLinkPreview } from 'link-preview-js';

// --- Configuration ---
const WINDOW_WIDTH = 420; // Adjusted width for a sleeker look
const WINDOW_HEIGHT = 550; // Adjusted height
const HOTKEY = 'CommandOrControl+Shift+V'; // Or your preferred shortcut

// --- Setup ---
// Determine the correct __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database
const dbPath = path.join(app.getPath('userData'), 'slateClipboardData.db');
const db = new Datastore({ filename: dbPath, autoload: true });
console.log(`Database path: ${dbPath}`);

let win: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;
let windowIsVisible = false; // Track window visibility state

// --- Type Definition ---
interface ClipboardItem {
  _id?: string; // NeDB adds _id automatically
  id: string; // Keep original ID for frontend consistency if needed
  type: 'text' | 'image' | 'link';
  content: string;
  timestamp: number;
  pinned?: boolean;
  metadata?: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    error?: string;
  };
}

// --- Core Functions ---

function createWindow() {
  win = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    show: false,
    frame: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false,
    },
    backgroundColor: '#ffffff',
  });

  // Load the frontend app
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    const indexPath = path.join(__dirname, '..', 'index.html');
    win.loadFile(indexPath);
  }

  // Handle window blur with improved logic
  win.on('blur', () => {
    if (!isQuitting) {
      // Only hide if not triggered by tray click
      const isTrayClick = global.trayClick;
      if (!isTrayClick) {
        setTimeout(() => {
          if (win && !win.isFocused() && !isQuitting) {
            hideWindow();
          }
        }, 100);
      }
      global.trayClick = false;
    }
  });

  // Handle window close event
  win.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      hideWindow();
    } else {
      win = null;
    }
  });

  // Make window draggable
  win.setMovable(true);
  win.setPosition(0, 0); // Initial position

  win.webContents.on('did-finish-load', () => {
    console.log('Window content loaded');
  });
}

function createTray() {
  const iconPath = path.join(__dirname, '..', 'public', 'tray-iconTemplate.png');
  const icon = nativeImage.createFromPath(iconPath);
  
  tray = new Tray(icon);
  tray.setToolTip('Slate Clipboard Manager');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Clipboard',
      click: () => {
        global.trayClick = true;
        showWindow();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit Slate',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  // Show window on single click
  tray.on('click', () => {
    global.trayClick = true;
    toggleWindowVisibility();
  });
}

function getWindowPosition() {
  if (!tray) return { x: 0, y: 0 }; // Default position if tray not available

  const trayBounds = tray.getBounds();
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (WINDOW_WIDTH / 2));
  const y = Math.round(trayBounds.y + trayBounds.height + 4); // Position below tray

  // Adjust if window goes off-screen
  const adjustedX = Math.min(screenWidth - WINDOW_WIDTH, Math.max(0, x));
  const adjustedY = Math.min(screenHeight - WINDOW_HEIGHT, Math.max(0, y)); // Basic adjustment, might need refinement based on OS/dock position

  return { x: adjustedX, y: adjustedY };
}

function showWindow() {
  if (!win) {
    console.log('Window not created yet, creating...');
    createWindow(); // Create if it doesn't exist
    if (!win) {
      console.error('Failed to create window.');
      return;
    }
    // Wait for the window to be ready before showing
    win.once('ready-to-show', () => {
      console.log('Window ready to show.');
      positionAndShow();
    });
  } else {
    positionAndShow();
  }
}

function positionAndShow() {
  if (!win) return;
  const { x, y } = getWindowPosition();
  win.setPosition(x, y);
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.show();
  win.focus();
  windowIsVisible = true;
  // Reset workspace visibility after a short delay
  setTimeout(() => {
    win?.setVisibleOnAllWorkspaces(false);
  }, 150);
}

function hideWindow() {
  if (win && !win.isDestroyed()) {
    win.hide();
    windowIsVisible = false;
  }
}

function toggleWindowVisibility() {
  if (windowIsVisible) {
    hideWindow();
  } else {
    showWindow();
  }
}

function registerHotkey() {
  const ret = globalShortcut.register(HOTKEY, () => {
    console.log('Hotkey pressed');
    toggleWindowVisibility();
  });

  if (!ret) {
    console.error('Failed to register hotkey:', HOTKEY);
  } else {
    console.log('Hotkey registered successfully:', HOTKEY);
  }
}

// --- Clipboard Handling ---

async function handleClipboardChange(type: 'text' | 'image', data: string | Electron.NativeImage) {
  try {
    let content: string;
    let itemType: ClipboardItem['type'];
    let metadata: any = null;

    if (type === 'text') {
      content = data as string;
      if (!content || content.trim() === '') return; // Ignore empty text
      itemType = isValidURL(content) ? 'link' : 'text';
      if (itemType === 'link') {
        try {
          // Fetch link preview - consider adding a timeout
          metadata = await getLinkPreview(content, { timeout: 3000 }); // 3 second timeout
        } catch (previewError) {
          console.warn(`Error fetching link preview for ${content}:`, previewError);
          metadata = { url: content, error: 'Preview unavailable' }; // Store basic info on error
        }
      }
    } else { // Image
      const image = data as Electron.NativeImage;
      if (image.isEmpty()) return; // Ignore empty images
      content = image.toDataURL(); // Store as base64
      itemType = 'image';
    }

    // Check for duplicates based on content
    db.findOne({ content }, (err: Error | null, existingItem: ClipboardItem | null) => {
      if (err) {
        console.error('Error checking for existing clipboard item:', err);
        return;
      }
      if (!existingItem) {
        const id = Math.random().toString(36).substring(2, 11); // Unique ID
        const timestamp = Date.now();
        const newItem: ClipboardItem = { id, type: itemType, content, timestamp, metadata, pinned: false };
        saveClipboardItem(newItem);
      } else {
        console.log('Duplicate clipboard item ignored.');
        // Optional: Update timestamp of existing item?
        // db.update({ _id: existingItem._id }, { $set: { timestamp: Date.now() } }, {}, (updateErr) => {
        //   if (updateErr) console.error('Error updating timestamp:', updateErr);
        // });
      }
    });
  } catch (error) {
    console.error(`Error handling ${type} clipboard change:`, error);
  }
}

function saveClipboardItem(item: ClipboardItem) {
  db.insert(item, (err: Error | null, newDoc: ClipboardItem) => {
    if (err) {
      console.error('Error saving clipboard item:', err);
    } else {
      console.log('Clipboard item saved:', newDoc.id, newDoc.type);
      // Notify frontend of new item
      if (win && win.webContents && !win.isDestroyed()) {
        win.webContents.send('clipboard-item-added', newDoc);
      }
      // Optional: Prune old entries if DB gets too large
      // pruneDatabase();
    }
  });
}

function getClipboardData(): Promise<ClipboardItem[]> {
  return new Promise((resolve, reject) => {
    // Find all items, sort by timestamp descending
    db.find<ClipboardItem>({}).sort({ timestamp: -1 }).exec((err, docs) => {
      if (err) {
        console.error('Error fetching clipboard data:', err);
        return reject(err);
      }
      // Ensure pinned items come first, then sort by timestamp
      const sortedDocs = docs.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.timestamp - a.timestamp;
      });
      resolve(sortedDocs);
    });
  });
}

function isValidURL(content: string): boolean {
  if (!content.startsWith('http://') && !content.startsWith('https://')) {
    return false;
  }
  try {
    new URL(content);
    return true;
  } catch {
    return false;
  }
}

// --- IPC Handlers ---

// Fetch all data
ipcMain.handle('get-clipboard-data', async () => {
  try {
    return await getClipboardData();
  } catch (error) {
    console.error('[IPC] Error getting clipboard data:', error);
    return []; // Return empty array on error
  }
});

// Delete item
ipcMain.handle('delete-clipboard-item', async (event, id: string): Promise<boolean> => {
  if (!id) {
    console.error('[IPC] Delete request missing ID');
    return false;
  }
  return new Promise((resolve) => {
    // Use NeDB's _id if available, otherwise fallback to original id
    db.remove({ $or: [{ id: id }, { _id: id }] }, { multi: false }, (err, numRemoved) => {
      if (err) {
        console.error('[IPC] Error deleting clipboard item:', id, err);
        return resolve(false);
      }
      console.log('[IPC] Deleted item:', id, 'Success:', numRemoved > 0);
      resolve(numRemoved > 0);
    });
  });
});

// Toggle Pin Status (Combined Pin/Unpin)
ipcMain.handle('toggle-pin-item', async (event, id: string): Promise<ClipboardItem | null> => {
  try {
    const db = await getDatabase();
    const item = await db.findOne({ _id: id });
    
    if (!item) {
      throw new Error('Item not found');
    }

    const updatedItem = await db.update(
      { _id: id },
      { $set: { isPinned: !item.isPinned } },
      { returnUpdatedDocs: true }
    );

    if (!updatedItem) {
      throw new Error('Failed to update item');
    }

    return updatedItem;
  } catch (error) {
    console.error('Error toggling pin status:', error);
    throw error;
  }
});

// Copy content to clipboard
ipcMain.handle('copy-to-clipboard', async (event, content: string): Promise<{ success: boolean; error?: string }> => {
  if (typeof content !== 'string') {
     console.error('[IPC] Copy request received non-string content');
     return { success: false, error: 'Invalid content type' };
  }
  try {
    clipboard.writeText(content);
    hideWindow(); // Hide window after copying
    // Optional: Simulate paste or notify user
    return { success: true };
  } catch (error: any) {
    console.error('[IPC] Error copying to clipboard:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
});

// Get Link Preview (if needed directly from frontend)
ipcMain.handle('get-link-preview', async (event, url: string): Promise<any | null> => {
  if (!isValidURL(url)) {
    return null;
  }
  try {
    // Consider adding a timeout here as well
    const metadata = await getLinkPreview(url, { timeout: 3000 });
    return metadata;
  } catch (error) {
    console.error('[IPC] Error fetching link preview:', url, error);
    return { url: url, error: 'Preview unavailable' }; // Return basic info on error
  }
});

// Hide window (called from frontend)
ipcMain.on('hide-window', () => {
  hideWindow();
});

// Add this after the other IPC handlers
ipcMain.handle('set-window-opacity', async (_, opacity: number) => {
  if (win && !win.isDestroyed()) {
    win.setOpacity(opacity);
  }
});

// --- App Lifecycle ---

app.on('ready', () => {
  console.log('App ready.');
  createWindow();
  createTray();
  registerHotkey();

  // Start watching clipboard after a small delay to ensure setup is complete
  setTimeout(() => {
    clipboard.startWatching();
    console.log('Clipboard watching started.');

    clipboard.on('text-changed', () => {
      const text = clipboard.readText();
      handleClipboardChange('text', text);
    });

    clipboard.on('image-changed', () => {
      const image = clipboard.readImage();
      handleClipboardChange('image', image);
    });
  }, 500);
});

app.on('window-all-closed', () => {
  // On macOS, apps usually stay active until explicitly quit
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // Re-create window if dock icon is clicked and no windows are open
  if (BrowserWindow.getAllWindows().length === 0) {
    showWindow(); // Use showWindow to handle creation and positioning
  } else {
    showWindow(); // Show existing window if it was hidden
  }
});

app.on('will-quit', () => {
  console.log('App quitting.');
  // Unregister hotkey and stop watching
  globalShortcut.unregisterAll();
  clipboard.stopWatching();
  // Ensure DB changes are flushed (NeDB usually handles this, but explicit compaction can help)
  db.persistence.compactDatafile();
});

// Handle potential unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Add global variable for tray click tracking
declare global {
  var trayClick: boolean;
}
global.trayClick = false;
