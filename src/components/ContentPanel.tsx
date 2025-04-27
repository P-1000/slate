import * as React from "react";
import { motion } from "framer-motion";
import { Copy, Pin, Trash, Clock, FileType, ExternalLink } from "lucide-react";
import { cn } from "../utils/cn";
import { ClipboardItem } from "../types";
import { EmptyState } from "./EmptyState";
import { useTheme } from "../ThemeContext";

interface ContentPanelProps {
  selectedItem: ClipboardItem | null;
  isDark: boolean;
  togglePin: (id: string) => void;
  copyToClipboard: (content: string) => void;
  deleteItem: (id: string) => void;
  formatDate: (timestamp: number) => string;
}

export const ContentPanel: React.FC<ContentPanelProps> = ({
  selectedItem,
  isDark,
  togglePin,
  copyToClipboard,
  deleteItem,
  formatDate,
}) => {
  const { colorPalette } = useTheme();
  
  if (!selectedItem) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <EmptyState 
          message="Select an item to view details"
          isDark={isDark}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 h-full overflow-hidden flex flex-col">
      <div className={cn(
        "p-4 flex items-center justify-between",
        "border-b",
        isDark ? "border-dark-800" : "border-gray-200"
      )}>
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
            isDark ? "bg-dark-800/70" : "bg-gray-100/70",
            "border border-primary-500/20"
          )}>
            <FileType className="h-4 w-4 text-primary-500" />
            <span className="capitalize">{selectedItem.type}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm opacity-70">
            <Clock className="h-4 w-4 text-primary-400" />
            <span>{formatDate(selectedItem.timestamp)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => copyToClipboard(selectedItem.content)}
            className={cn(
              "p-2 rounded-lg",
              "transition-colors duration-200",
              "glass-button hover:bg-primary-500/10"
            )}
            title="Copy to clipboard"
          >
            <Copy className="h-5 w-5 text-primary-500" />
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => togglePin(selectedItem.id)}
            className={cn(
              "p-2 rounded-lg",
              "transition-colors duration-200",
              "glass-button hover:bg-primary-500/10",
              selectedItem.pinned && "text-primary-500 bg-primary-500/10"
            )}
            title={selectedItem.pinned ? "Unpin" : "Pin"}
          >
            <Pin className="h-5 w-5" />
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => deleteItem(selectedItem.id)}
            className={cn(
              "p-2 rounded-lg",
              "transition-colors duration-200",
              "glass-button hover:bg-red-500/10 text-red-500"
            )}
            title="Delete"
          >
            <Trash className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
      
      <div className={cn(
        "flex-1 p-6 overflow-auto",
        "scrollbar-thin scrollbar-thumb-rounded",
        isDark 
          ? "scrollbar-thumb-dark-700 scrollbar-track-dark-900" 
          : "scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      )}>
        {selectedItem.type === 'image' ? (
          <div className="flex flex-col items-center">
            <div className={cn(
              "rounded-lg overflow-hidden max-w-full shadow-lg",
              "glass-morphism glass-panel",
              isDark ? "glass-morphism-dark" : "glass-morphism-light",
              "border border-primary-500/20"
            )}>
              <img 
                src={selectedItem.content} 
                alt="Clipboard image" 
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            <p className="mt-4 text-sm opacity-70">
              Image copied at {formatDate(selectedItem.timestamp)}
            </p>
          </div>
        ) : selectedItem.type === 'link' ? (
          <div className="flex flex-col">
            <div className={cn(
              "p-6 rounded-lg",
              "glass-morphism glass-panel",
              isDark ? "glass-morphism-dark" : "glass-morphism-light",
              "border border-primary-500/20"
            )}>
              <a 
                href={selectedItem.content}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-500 hover:underline break-all"
              >
                {selectedItem.content}
              </a>
            </div>
            <div className="mt-4 flex justify-end">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open(selectedItem.content, '_blank')}
                className={cn(
                  "px-4 py-2 rounded-lg",
                  "transition-colors duration-200",
                  "bg-primary-500 hover:bg-primary-600 text-white",
                  "flex items-center gap-2"
                )}
              >
                <ExternalLink className="h-4 w-4" />
                Open Link
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className={cn(
              "p-6 rounded-lg flex-1",
              "glass-morphism glass-panel",
              isDark ? "glass-morphism-dark" : "glass-morphism-light",
              "border border-primary-500/20"
            )}>
              <pre className={cn(
                "whitespace-pre-wrap break-words font-mono text-sm",
                "h-full overflow-auto",
                "scrollbar-thin scrollbar-thumb-rounded",
                isDark 
                  ? "scrollbar-thumb-dark-700 scrollbar-track-transparent" 
                  : "scrollbar-thumb-gray-300 scrollbar-track-transparent"
              )}>
                {selectedItem.content}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};