import * as React from "react";
import { ClipboardItem } from "../types";

// Make sure we're using the correct window type with our extended ipcRenderer
declare global {
  interface Window {
    ipcRenderer: Electron.IpcRenderer & {
      getClipboardData(): Promise<ClipboardItem[]>;
      deleteClipboardData(id: string): Promise<boolean>;
      pinClipboardData(id: string): Promise<ClipboardItem>;
      unpinClipboardData(id: string): Promise<ClipboardItem>;
      copyToClipboard(content: string): Promise<boolean>;
      getPinnedClipboardData(): Promise<ClipboardItem[]>;
      setWindowOpacity(opacity: number): Promise<void>;
    };
  }
}

export function useClipboard() {
  const [clipboardData, setClipboardData] = React.useState<ClipboardItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedItem, setSelectedItem] = React.useState<ClipboardItem | null>(null);
  const [isElectronAvailable, setIsElectronAvailable] = React.useState<boolean>(false);

  // Check if Electron IPC is available
  React.useEffect(() => {
    const checkElectronAvailability = () => {
      const available = typeof window !== 'undefined' && 
                        window.ipcRenderer !== undefined && 
                        typeof window.ipcRenderer.getClipboardData === 'function';
      
      setIsElectronAvailable(available);
      
      if (!available) {
        console.error("Electron IPC is not available. Running in browser mode?");
        setError("Clipboard manager requires Electron environment");
        setIsLoading(false);
      }
    };
    
    checkElectronAvailability();
  }, []);

  // Fetch clipboard data
  const fetchClipboardData = React.useCallback(async () => {
    if (!isElectronAvailable) {
      // If we're not in Electron, set some mock data for development
      setClipboardData([
        {
          id: 'mock-1',
          content: 'This is mock clipboard data for development',
          type: 'text',
          timestamp: Date.now(),
          pinned: false
        }
      ]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await window.ipcRenderer.getClipboardData();
      
      // Ensure we have valid data before setting state
      if (Array.isArray(data)) {
        setClipboardData(data.sort((a, b) => b.timestamp - a.timestamp));
      } else {
        console.error("Invalid clipboard data format:", data);
        setError("Received invalid clipboard data format");
      }
    } catch (error) {
      console.error("Error fetching clipboard data:", error);
      setError("Failed to load clipboard data. Please try again.");
      
      // Set empty array to prevent undefined errors
      setClipboardData([]);
    } finally {
      setIsLoading(false);
    }
  }, [isElectronAvailable]);

  React.useEffect(() => {
    fetchClipboardData();
    
    // Only set up event listeners if Electron is available
    if (isElectronAvailable) {
      // Set up event listener for clipboard updates
      const handleClipboardUpdate = () => {
        fetchClipboardData();
      };
      
      window.ipcRenderer.on('clipboard-item-added', handleClipboardUpdate);
      
      return () => {
        window.ipcRenderer.off('clipboard-item-added', handleClipboardUpdate);
      };
    }
  }, [fetchClipboardData, isElectronAvailable]);

  const deleteItem = async (id: string) => {
    if (!isElectronAvailable) {
      setError("Cannot delete items in browser mode");
      throw new Error("Electron IPC not available");
    }
    
    try {
      const success = await window.ipcRenderer.invoke('delete-clipboard-data', id);
      if (success) {
        setClipboardData(prevData => prevData.filter(item => item.id !== id));
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
      } else {
        throw new Error(`Failed to delete clipboard item with ID: ${id}`);
      }
    } catch (error) {
      console.error("Error deleting clipboard item:", error);
      setError(`Failed to delete item: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const togglePin = async (id: string) => {
    if (!isElectronAvailable) {
      setError("Cannot pin items in browser mode");
      throw new Error("Electron IPC not available");
    }
    
    try {
      const item = clipboardData.find(item => item.id === id);
      if (!item) {
        throw new Error(`Item with ID ${id} not found`);
      }
      
      const updatedItem = item.pinned 
        ? await window.ipcRenderer.invoke('unpin-clipboard-data', id)
        : await window.ipcRenderer.invoke('pin-clipboard-data', id);
        
      if (!updatedItem) {
        throw new Error(`Failed to ${item.pinned ? 'unpin' : 'pin'} clipboard item with ID: ${id}`);
      }

      setClipboardData(prevData =>
        prevData.map(item => item.id === id ? updatedItem : item)
      );
      
      if (selectedItem?.id === id) {
        setSelectedItem(updatedItem);
      }

      return updatedItem;
    } catch (error) {
      console.error("Error toggling pin status:", error);
      setError(`Failed to toggle pin status: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const copyToClipboard = async (content: string) => {
    if (!isElectronAvailable) {
      // Fallback to browser clipboard API if available
      try {
        await navigator.clipboard.writeText(content);
        return;
      } catch (browserError) {
        console.error("Browser clipboard API failed:", browserError);
        setError("Cannot access clipboard in this environment");
        throw new Error("Clipboard access not available");
      }
    }
    
    try {
      const success = await window.ipcRenderer.copyToClipboard(content);
      if (!success) {
        throw new Error("Failed to copy to clipboard");
      }
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      setError("Failed to copy to clipboard. Please try again.");
      throw error; // Re-throw for error boundary
    }
  };

  return {
    clipboardData,
    isLoading,
    error,
    setError,
    selectedItem,
    setSelectedItem,
    fetchClipboardData,
    deleteItem,
    togglePin,
    copyToClipboard,
    isElectronAvailable
  };
}