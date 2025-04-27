import { IpcRenderer } from 'electron';

export interface ClipboardItem {
  id: string;
  content: string;
  timestamp: number;
  type: "text" | "image" | "link";
  pinned?: boolean;
  metadata?: any;
}