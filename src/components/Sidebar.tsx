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
      transition={{ duration: 0.15 }}
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
      layout="position"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-primary-500 flex-shrink-0">
              {getTypeIcon(item.type)}
            </div>
            <span className="text-xs opacity-70 flex-shrink-0">
              {formatDate(item.timestamp)}
            </span>
          </div>
          {item.pinned && (
            <Pin className="h-3 w-3 text-primary-500 flex-shrink-0" />
          )}
        </div>
        <div className="line-clamp-2 text-sm break-all">
          {item.type === 'image' ? 'Image' : item.content}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded">
        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : !hasItems ? (
            <EmptyState
              message="No clipboard items yet"
              actionLabel="Refresh"
              onAction={fetchClipboardData}
              isDark={isDark}
            />
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredPinnedItems.length > 0 && (
                <div className="mb-6">
                  <h3 className={cn(
                    "text-xs uppercase font-semibold mb-3 px-2 sticky top-0 z-10 py-2",
                    isDark ? "text-gray-400 bg-dark-900/80" : "text-gray-500 bg-white/80",
                    "backdrop-blur-sm"
                  )}>
                    Pinned
                  </h3>
                  {filteredPinnedItems.map(renderClipboardItem)}
                </div>
              )}
              
              {filteredUnpinnedItems.length > 0 && (
                <div>
                  <h3 className={cn(
                    "text-xs uppercase font-semibold mb-3 px-2 sticky top-0 z-10 py-2",
                    isDark ? "text-gray-400 bg-dark-900/80" : "text-gray-500 bg-white/80",
                    "backdrop-blur-sm"
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
    </div>
  );
};