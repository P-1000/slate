import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeContext";
import { cn } from "./utils/cn";
import { Sidebar } from "./components/Sidebar";
import { ContentPanel } from "./components/ContentPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { SearchHeader } from "./components/SearchHeader";
import { useClipboard } from "./hooks/useClipboard";
import { useFilteredClipboard } from "./hooks/useFilteredClipboard";
import { useWindowManagement } from "./hooks/useWindowManagement";
import { formatDate, getTypeIcon } from "./utils/clipboardUtils";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider, useToast } from "./components/Toast";

const ClipboardManagerContent: React.FC = () => {
  const { theme, setTheme, isDark, colorPalette, setColorPalette, fontFamily, setFontFamily, blurAmount, setBlurAmount, windowOpacity, setWindowOpacity } = useTheme();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<'all' | 'text' | 'link' | 'image'>('all');
  const [showSettings, setShowSettings] = React.useState(false);
  const { showToast } = useToast();
  
  // Use custom hooks
  useWindowManagement();
  
  const {
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
  } = useClipboard();
  
  const { filteredPinnedItems, filteredUnpinnedItems } = useFilteredClipboard(
    clipboardData,
    searchQuery,
    activeTab
  );

  // Show toast for errors
  React.useEffect(() => {
    if (error) {
      showToast(error, "error");
      setError(null);
    }
  }, [error, showToast, setError]);

  // Wrap operations with error handling and toast notifications
  const handleDeleteItem = async (id: string) => {
    try {
      await deleteItem(id);
      showToast("Item deleted successfully", "success");
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      await togglePin(id);
      const item = clipboardData.find(item => item.id === id);
      showToast(
        item?.pinned 
          ? "Item unpinned successfully" 
          : "Item pinned successfully", 
        "success"
      );
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleCopyToClipboard = async (content: string) => {
    try {
      await copyToClipboard(content);
      showToast("Copied to clipboard", "success");
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  return (
    <div 
      className={cn(
        "flex h-screen overflow-hidden transition-colors duration-300",
        `font-${fontFamily}`,
        isDark 
          ? "bg-dark-950/90 text-white" 
          : "bg-gray-50/90 text-gray-900"
      )}
      style={{ 
        "--blur-amount": `${blurAmount}px` 
      } as React.CSSProperties}
    >
      {/* Add a loading indicator */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4 mx-auto"></div>
            <p className="text-lg">Loading clipboard data...</p>
          </div>
        </div>
      )}

      {/* Electron availability check */}
      {!isElectronAvailable && !isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-dark-900/80 backdrop-blur-md">
          <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-xl max-w-md text-center">
            <h2 className="text-xl font-semibold mb-4">Electron Environment Required</h2>
            <p className="mb-4">
              The clipboard manager requires the Electron environment to function properly. 
              It appears you're running the app in a browser or the Electron IPC bridge is not available.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      )}

      {/* Unified Search Header */}
      <ErrorBoundary>
        <SearchHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDark={isDark}
          setShowSettings={setShowSettings}
        />
      </ErrorBoundary>

      {/* Left Sidebar */}
      <ErrorBoundary>
        <Sidebar 
          isDark={isDark}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isLoading={isLoading}
          error={error}
          filteredPinnedItems={filteredPinnedItems}
          filteredUnpinnedItems={filteredUnpinnedItems}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          deleteItem={handleDeleteItem}
          togglePin={handleTogglePin}
          copyToClipboard={handleCopyToClipboard}
          fetchClipboardData={fetchClipboardData}
          formatDate={formatDate}
          getTypeIcon={getTypeIcon}
          setShowSettings={setShowSettings}
        />
      </ErrorBoundary>

      {/* Content Panel */}
      <ErrorBoundary>
        <ContentPanel 
          selectedItem={selectedItem}
          isDark={isDark}
          togglePin={handleTogglePin}
          copyToClipboard={handleCopyToClipboard}
          deleteItem={handleDeleteItem}
          formatDate={formatDate}
        />
      </ErrorBoundary>

      {/* Settings Panel - Pass all required props */}
      <AnimatePresence>
        {showSettings && (
          <ErrorBoundary>
            <SettingsPanel 
              theme={theme}
              setTheme={setTheme}
              isDark={isDark}
              colorPalette={colorPalette}
              setColorPalette={setColorPalette}
              fontFamily={fontFamily}
              setFontFamily={setFontFamily}
              blurAmount={blurAmount}
              setBlurAmount={setBlurAmount}
              windowOpacity={windowOpacity}
              setWindowOpacity={setWindowOpacity}
              onClose={() => setShowSettings(false)}
            />
          </ErrorBoundary>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ClipboardManager() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ClipboardManagerContent />
      </ToastProvider>
    </ErrorBoundary>
  );
}