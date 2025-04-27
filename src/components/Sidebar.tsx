import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Pin } from "lucide-react";
import { cn } from "../utils/cn";
import { ClipboardItem } from "../types";
import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";
import { useTheme } from "../ThemeContext";

interface SidebarProps {
  isDark: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: 'all' | 'text' | 'link' | 'image';
  setActiveTab: (tab: 'all' | 'text' | 'link' | 'image') => void;
  isLoading: boolean;
  error: string | null;
  filteredPinnedItems: ClipboardItem[];
  filteredUnpinnedItems: ClipboardItem[];
  selectedItem: ClipboardItem | null;
  setSelectedItem: (item: ClipboardItem | null) => void;
  deleteItem: (id: string) => void;
  togglePin: (id: string) => void;
  copyToClipboard: (content: string) => void;
  fetchClipboardData: () => void;
  formatDate: (timestamp: number) => string;
  getTypeIcon: (type: string) => React.ReactNode;
  setShowSettings: (show: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isDark,
  isLoading,
  error,
  filteredPinnedItems,
  filteredUnpinnedItems,
  selectedItem,
  setSelectedItem,
  fetchClipboardData,
  formatDate,
  getTypeIcon,
}) => {
  const { colorPalette } = useTheme();
  const hasItems = filteredPinnedItems.length > 0 || filteredUnpinnedItems.length > 0;
  
  const renderClipboardItem = (item: ClipboardItem) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "p-3 rounded-lg cursor-pointer mb-2",
        "transition-colors duration-200",
        "glass-morphism glass-panel",
        isDark ? "glass-morphism-dark" : "glass-morphism-light",
        selectedItem?.id === item.id 
          ? "ring-2 ring-primary-500/50 border-primary-500/30" 
          : "hover:bg-primary-500/5 border-transparent",
        "border"
      )}
      onClick={() => setSelectedItem(item)}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="text-primary-500">
            {getTypeIcon(item.type)}
          </div>
          <span className="text-xs opacity-70">
            {formatDate(item.timestamp)}
          </span>
        </div>
        {item.pinned && (
          <Pin className="h-3 w-3 text-primary-500" />
        )}
      </div>
      <div className="line-clamp-2 text-sm">
        {item.type === 'image' 
          ? 'Image' 
          : item.content}
      </div>
    </motion.div>
  );

  return (
    <div className={cn(
      "w-96 h-full overflow-hidden flex flex-col",
      "border-r",
      isDark ? "border-dark-800" : "border-gray-200"
    )}>
      <div className={cn(
        "flex-1 overflow-y-auto p-4 pt-24", // Increased top padding to fix overlap
        "scrollbar-thin scrollbar-thumb-rounded",
        isDark 
          ? "scrollbar-thumb-dark-700 scrollbar-track-dark-900" 
          : "scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      )}>
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner className="text-primary-500" />
          </div>
        ) : error ? (
          <EmptyState
            message={error}
            icon={<RefreshCw className="h-12 w-12 opacity-20 text-primary-500" />}
            actionLabel="Try Again"
            onAction={fetchClipboardData}
            isDark={isDark}
          />
        ) : !hasItems ? (
          <EmptyState
            message="No clipboard items found"
            actionLabel="Refresh"
            onAction={fetchClipboardData}
            isDark={isDark}
          />
        ) : (
          <AnimatePresence>
            {filteredPinnedItems.length > 0 && (
              <div className="mb-6">
                <h3 className={cn(
                  "text-xs uppercase font-semibold mb-2 px-2 flex items-center",
                  isDark ? "text-primary-400" : "text-primary-600"
                )}>
                  <Pin className="h-3 w-3 mr-1" />
                  Pinned
                </h3>
                {filteredPinnedItems.map(renderClipboardItem)}
              </div>
            )}
            
            {filteredUnpinnedItems.length > 0 && (
              <div>
                <h3 className={cn(
                  "text-xs uppercase font-semibold mb-2 px-2",
                  isDark ? "text-gray-400" : "text-gray-500"
                )}>
                  Recent
                </h3>
                {filteredUnpinnedItems.map(renderClipboardItem)}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};