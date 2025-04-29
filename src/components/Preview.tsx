import * as React from "react";
import { motion } from "framer-motion";
import { Pin, Trash2 } from "lucide-react";
import { cn } from "../utils/cn";
import { ClipboardItem } from "../types";
import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";

interface PreviewProps {
  isDark: boolean;
  selectedItem: ClipboardItem | null;
  formatDate: (timestamp: number) => string;
  getTypeIcon: (type: string) => React.ReactNode;
  togglePin: (id: string) => void;
  deleteItem: (id: string) => void;
}

export const Preview: React.FC<PreviewProps> = ({
  isDark,
  selectedItem,
  formatDate,
  getTypeIcon,
  togglePin,
  deleteItem,
}) => {
  if (!selectedItem) {
    return (
      <div className={cn(
        "h-full flex items-center justify-center w-1/2",
        isDark ? "bg-dark-900" : "bg-white"
      )}>
        <EmptyState
          message="Select an item to preview"
          isDark={isDark}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "h-full flex flex-col w-1/2",
        isDark ? "bg-dark-900" : "bg-white"
      )}
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "text-2xl",
              isDark ? "text-primary-400" : "text-primary-500"
            )}>
              {getTypeIcon(selectedItem.type)}
            </div>
            <div>
              <div className={cn(
                "text-sm font-medium",
                isDark ? "text-gray-400" : "text-gray-500"
              )}>
                {formatDate(selectedItem.timestamp)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => togglePin(selectedItem.id)}
              className={cn(
                "p-2 rounded-md transition-colors",
                isDark ? "hover:bg-white/10" : "hover:bg-black/5",
                selectedItem.pinned ? "text-primary-500" : "text-gray-400"
              )}
              title={selectedItem.pinned ? "Unpin item" : "Pin item"}
            >
              <Pin className="h-4 w-4" />
            </button>
            <button
              onClick={() => deleteItem(selectedItem.id)}
              className={cn(
                "p-2 rounded-md transition-colors",
                isDark ? "hover:bg-white/10" : "hover:bg-black/5",
                "text-red-500"
              )}
              title="Delete item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className={cn(
          "prose prose-sm max-w-none",
          isDark ? "prose-invert" : "",
          "whitespace-pre-wrap break-words"
        )}>
          {selectedItem.type === 'image' ? (
            <img
              src={selectedItem.content}
              alt="Clipboard image"
              className="max-w-full rounded-lg"
            />
          ) : (
            <div className="text-base leading-relaxed">
              {selectedItem.content}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}; 