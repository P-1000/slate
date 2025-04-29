import { IpcRenderer } from 'electron';
import { ClipboardItem } from './types';
import { g } from 'framer-motion/client';

declare module 'electron-clipboard-extended';
declare module 'nedb';
declare module 'link-preview-js';

declare global {
  interface Window {
    ipcRenderer: IpcRenderer & {
      getClipboardData(): Promise<ClipboardItem[]>;
      deleteClipboardData(id: string): Promise<boolean>;
      pinClipboardData(id: string): Promise<ClipboardItem>;
      unpinClipboardData(id: string): Promise<ClipboardItem>;
      copyToClipboard(content: string): Promise<boolean>;
      getPinnedClipboardData(): Promise<ClipboardItem[]>;
      setWindowOpacity(opacity: number): Promise<void>;
      invoke(channel: string, ...args: any[]): Promise<any>;
      send(channel: string, ...args: any[]): void;
      on(channel: string, listener: (...args: any[]) => void): IpcRenderer;
      once(channel: string, listener: (...args: any[]) => void): IpcRenderer;
      off(channel: string, listener: (...args: any[]) => void): IpcRenderer;
    };
  }
}

interface ClipboardItem {
  _id?: string;
  id: string;
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

export {};