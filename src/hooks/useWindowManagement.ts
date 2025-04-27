import * as React from "react";

export function useWindowManagement() {
  React.useEffect(() => {
    const handleWindowBlur = () => {
      // Send a message to the main process to hide the window
      window.ipcRenderer.send('hide-window');
    };

    window.addEventListener('blur', handleWindowBlur);
    
    return () => {
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);
}