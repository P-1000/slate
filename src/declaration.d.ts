declare module 'electron-clipboard-extended';

declare module 'electron-clipboard-extended' {
    export function startWatching(): void;
    export function stopWatching(): void;
    export function getText(): string;
    export function setText(text: string): void;
}

//declare nedb

declare module 'nedb' {
    interface DatastoreOptions {
        filename?: string;
        autoload?: boolean;
        onload?: (error: Error | null) => void;
    }

    interface Datastore {
        find: (query: any, callback: (err: Error | null, docs: any[]) => void) => void;
        findOne: (query: any, callback: (err: Error | null, doc: any) => void) => void;
        insert: (doc: any, callback: (err: Error | null, newDoc: any) => void) => void;
        update: (query: any, update: any, options: any, callback: (err: Error | null, numAffected: number) => void) => void;
        remove: (query: any, options: any, callback: (err: Error | null, n: number) => void) => void;
        ensureIndex: (options: any) => void;
    }

    class Datastore {
        constructor(options?: DatastoreOptions);
    }

    export default Datastore;
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
  

declare module 'link-preview-js' {
  interface LinkPreviewData {
    url: string;
    title?: string;
    description?: string;
    images?: string[];
    mediaType?: string;
    contentType?: string;
    favicons?: string[];
  }

  function getLinkPreview(url: string, options?: { timeout?: number }): Promise<LinkPreviewData>;
  export { getLinkPreview };
}
