import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardItem } from "../types";
import { cn } from "../utils/cn";
import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";

interface SidebarProps {
  isDark: boolean;
  isLoading: boolean;
  error: string | null;
  filteredPinnedItems: ClipboardItem[];
  filteredUnpinnedItems: ClipboardItem[];
  selectedItem: ClipboardItem | null;
  setSelectedItem: (item: ClipboardItem | null) => void;
  copyToClipboard: (content: string) => Promise<void>;
  formatDate: (timestamp: number) => string;
  getTypeIcon: (type: string) => React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isDark,
  isLoading,
  error,
  filteredPinnedItems,
  filteredUnpinnedItems,
  selectedItem,
  setSelectedItem,
  copyToClipboard,
  formatDate,
  getTypeIcon,
}) => {
  const handleItemClick = async (item: ClipboardItem) => {
    setSelectedItem(item);
    await copyToClipboard(item.content);
  };

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={cn(
      "w-64 h-full overflow-hidden flex flex-col",
      isDark ? "bg-dark-900/50" : "bg-white/50"
    )}>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Pinned Items Section */}
        {filteredPinnedItems.length > 0 && (
          <div className="p-4">
            <h2 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">
              Pinned Items
            </h2>
            <div className="space-y-2">
              {filteredPinnedItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-colors",
                    selectedItem?.id === item.id
                      ? isDark
                        ? "bg-dark-800"
                        : "bg-gray-100"
                      : isDark
                      ? "hover:bg-dark-800/50"
                      : "hover:bg-gray-100/50"
                  )}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">{getTypeIcon(item.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-1">
                        {item.content}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(item.timestamp)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Items Section */}
        <div className="p-4">
          <h2 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">
            Recent Items
          </h2>
          {filteredUnpinnedItems.length === 0 ? (
            <EmptyState message="No items found" isDark={isDark} />
          ) : (
            <div className="space-y-2">
              {filteredUnpinnedItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-colors",
                    selectedItem?.id === item.id
                      ? isDark
                        ? "bg-dark-800"
                        : "bg-gray-100"
                      : isDark
                      ? "hover:bg-dark-800/50"
                      : "hover:bg-gray-100/50"
                  )}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">{getTypeIcon(item.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-1">
                        {item.content}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(item.timestamp)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};