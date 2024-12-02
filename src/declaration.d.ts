declare module 'electron-clipboard-extended';

declare module 'electron-clipboard-extended' {
    export function startWatching(): void;
    export function stopWatching(): void;
    export function getText(): string;
    export function setText(text: string): void;
  }

//declare nedb

declare module 'nedb' {
    export default class Datastore {
        constructor(options: { filename: string, autoload: boolean });
        loadDatabase(callback: (err: Error) => void): void;
        insert<T>(doc: T, callback: (err: Error, newDoc: T) => void): void;
        find<T>(query: any, callback: (err: Error, docs: T[]) => void): void;
        findOne<T>(query: any, callback: (err: Error, doc: T) => void): void;
        update<T>(query: any, updateQuery: any, options: { multi: boolean }, callback: (err: Error, numAffected: number) => void): void;
        remove<T>(query: any, options: { multi: boolean }, callback: (err: Error, numRemoved: number) => void): void;
    }
}

// src/types/electron.d.ts
// src/types/electron.d.ts
declare global {
  interface Window {
    ipcRenderer: {
      getClipboardData: () => Promise<ClipboardItem[]>;
      deleteClipboardData: (id: string) => Promise<boolean>;
      pinClipboardData: (id: string) => Promise<ClipboardItem>;
      copyToClipboard: (data: string) => Promise<boolean>;
      unpinClipboardData: (id: string) => Promise<boolean>;
      getPinnedClipboardData: () => Promise<ClipboardItem[]>;
    };
  }
}

export interface IElectronAPI {
  getClipboardData: () => Promise<ClipboardItem[]>;
  deleteClipboardData: (id: string) => Promise<boolean>;
  pinClipboardData: (id: string) => Promise<ClipboardItem>;
  copyToClipboard: (data: string) => Promise<boolean>;
  unpinClipboardData: (id: string) => Promise<boolean>;
  getPinnedClipboardData: () => Promise<ClipboardItem[]>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}


// Ensure that the file is considered a module
export {};

  
  // Ensure that the `electron.d.ts` file is included in your tsconfig.json
  
