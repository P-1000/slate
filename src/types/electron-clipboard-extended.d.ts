declare module 'electron-clipboard-extended' {
  import { EventEmitter } from 'events';

  class ClipboardExtended extends EventEmitter {
    constructor();
    startWatching(): void;
    stopWatching(): void;
    readText(): string;
    readImage(): Electron.NativeImage;
    writeText(text: string): void;
    writeImage(image: Electron.NativeImage): void;
    clear(): void;
  }

  export default ClipboardExtended;
} 