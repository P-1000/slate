import * as React from "react";
import { motion } from "framer-motion";
import { Pin, Copy, Trash, ExternalLink } from "lucide-react";
import { cn } from "../utils/cn";
import { ClipboardItem } from "../types";
import { Button } from "./ui/Button";

interface ContentPanelProps {
  selectedItem: ClipboardItem | null;
  isDark: boolean;
  onPin: (id: string) => void;
  onCopy: (content: string) => void;
  onDelete: (id: string) => void;
  formatDate: (timestamp: number) => string;
}

export const ContentPanel: React.FC<ContentPanelProps> = ({
  selectedItem,
  isDark,
  onPin,
  onCopy,
  onDelete,
  formatDate,
}) => {
  const isLink = selectedItem?.content?.startsWith('http');

  if (!selectedItem) {
    return (
      <div className={cn(
        "h-full flex items-center justify-center",
        isDark ? "bg-dark-900" : "bg-gray-50"
      )}>
        <p className={cn(
          "text-sm",
          isDark ? "text-gray-400" : "text-gray-500"
        )}>
          Select an item to view details
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "h-full flex flex-col",
        isDark ? "bg-dark-900" : "bg-white"
      )}
    >
      <div className={cn(
        "p-4 border-b flex items-center justify-between sticky top-0 z-10",
        isDark ? "bg-dark-900/80 border-dark-800" : "bg-white/80 border-gray-200",
        "backdrop-blur-sm"
      )}>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-medium",
            isDark ? "text-gray-200" : "text-gray-700"
          )}>
            {formatDate(selectedItem.timestamp)}
          </span>
          {selectedItem.pinned && (
            <Pin className="h-4 w-4 text-primary-500" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPin(selectedItem.id)}
            className={cn(
              selectedItem.pinned && "text-primary-500"
            )}
          >
            <Pin className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCopy(selectedItem.content)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          {isLink && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open(selectedItem.content, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(selectedItem.id)}
            className="text-red-500 hover:text-red-600"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {selectedItem.type === 'image' ? (
          <div className="flex items-center justify-center h-full">
            <img
              src={selectedItem.content}
              alt="Clipboard content"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        ) : (
          <pre className={cn(
            "whitespace-pre-wrap break-all text-sm font-mono p-4 rounded-lg",
            isDark 
              ? "bg-dark-800 text-gray-200" 
              : "bg-gray-50 text-gray-700"
          )}>
            {selectedItem.content}
          </pre>
        )}
      </div>
    </motion.div>
  );
};