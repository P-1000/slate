import React, { useEffect, useRef } from 'react';
import { useWindowManagement } from '../hooks/useWindowManagement';

export function MainWindow() {
  const windowRef = useRef<HTMLDivElement>(null);
  useWindowManagement();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Cmd/Ctrl + Shift + Space to toggle window
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.code === 'Space') {
        event.preventDefault();
        window.ipcRenderer.send('toggle-window');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      ref={windowRef}
      className="fixed inset-0 bg-white dark:bg-gray-900"
      onBlur={(e) => {
        // Only hide if the blur event is not from a child element
        if (!windowRef.current?.contains(e.relatedTarget as Node)) {
          window.ipcRenderer.send('hide-window');
        }
      }}
    >
      {/* ... existing code ... */}
    </div>
  );
} 