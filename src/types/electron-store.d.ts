declare module 'electron-store' {
  class Store<T = any> {
    constructor(options?: {
      name?: string;
      cwd?: string;
      defaults?: T;
      encryptionKey?: string | Buffer;
      fileExtension?: string;
      clearInvalidConfig?: boolean;
      serialize?: (value: T) => string;
      deserialize?: (value: string) => T;
    });

    get(key: string): any;
    set(key: string, value: any): void;
    delete(key: string): void;
    clear(): void;
    has(key: string): boolean;
    reset(): void;
    get size(): number;
    store: T;
  }

  export = Store;
} 