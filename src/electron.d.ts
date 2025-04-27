import { IpcRenderer } from 'electron';
import { ClipboardItem } from './types';
import { g } from 'framer-motion/client';

declare global {
  interface Window {
    ipcRenderer: IpcRenderer & {
      getClipboardData(): Promise<ClipboardItem[]>;
      deleteClipboardData(id: string): Promise<boolean>;
      pinClipboardData(id: string): Promise<ClipboardItem>;
      copyToClipboard(content: string): Promise<boolean>;
      unpinClipboardData(id: string): Promise<ClipboardItem>;
      getPinnedClipboardData(): Promise<ClipboardItem[]>;
      invoke(channel: string, ...args: any[]): Promise<any>;
      send(channel: string, ...args: any[]): void;
      on(channel: string, listener: (...args: any[]) => void): IpcRenderer;
      once(channel: string, listener: (...args: any[]) => void): IpcRenderer;
      off(channel: string, listener: (...args: any[]) => void): IpcRenderer;
    };
  }
}

export {};