declare module 'electron-window-state' {
  import { BrowserWindow } from 'electron';

  interface WindowStateOptions {
    defaultWidth?: number;
    defaultHeight?: number;
    path?: string;
    file?: string;
    maximize?: boolean;
    fullScreen?: boolean;
  }

  interface WindowState {
    x: number;
    y: number;
    width: number;
    height: number;
    isMaximized: boolean;
    isFullScreen: boolean;
    manage(window: BrowserWindow): void;
    unmanage(): void;
    saveState(window: BrowserWindow): void;
  }

  function windowStateKeeper(options?: WindowStateOptions): WindowState;
  export = windowStateKeeper;
} 