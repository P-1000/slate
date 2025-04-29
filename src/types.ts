import { IpcRenderer } from 'electron';

export type Theme = 'light' | 'dark' | 'system';
export type ColorPalette = 
  | 'default' 
  | 'blue' 
  | 'purple' 
  | 'green' 
  | 'orange' 
  | 'pink' 
  | 'cyan' 
  | 'amber' 
  | 'indigo' 
  | 'rose' 
  | 'teal' 
  | 'emerald' 
  | 'violet' 
  | 'fuchsia' 
  | 'lime';
export type FontFamily = 
  | 'system' 
  | 'inter' 
  | 'roboto' 
  | 'poppins' 
  | 'montserrat' 
  | 'playfair' 
  | 'source-code-pro' 
  | 'open-sans' 
  | 'lato' 
  | 'merriweather' 
  | 'raleway' 
  | 'ubuntu' 
  | 'nunito' 
  | 'fira-code' 
  | 'mono';

export interface ClipboardItem {
  id: string;
  content: string;
  type: "text" | "image" | "link";
  timestamp: number;
  pinned?: boolean;
  metadata?: any;
}