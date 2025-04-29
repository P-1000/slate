import * as React from "react";

export function useWindowManagement() {
  React.useEffect(() => {
    let isHotkeyTriggered = false;
    const appWindow = document.getElementById('app-window');

    const handleClickOutside = (event: MouseEvent) => {
      if (appWindow && !appWindow.contains(event.target as Node)) {
        window.ipcRenderer.send('hide-window');
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Cmd/Ctrl + Shift + Space to toggle window
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.code === 'Space') {
        event.preventDefault();
        isHotkeyTriggered = true;
        window.ipcRenderer.send('toggle-window');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}