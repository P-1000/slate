import React from "react";
import { cn } from "../utils/cn";
import { ClipboardItem } from "../types";
import { Button } from "./ui/Button";
import { Pin, Copy, Trash2 } from "lucide-react";

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
  if (!selectedItem) {
    return (
      <div className={cn(
        "flex-1 flex items-center justify-center",
        isDark ? "bg-dark-900" : "bg-white"
      )}>
        <div className="text-center">
          <h2 className={cn(
            "text-xl font-medium mb-2",
            isDark ? "text-gray-400" : "text-gray-500"
          )}>
            No item selected
          </h2>
          <p className={cn(
            "text-sm",
            isDark ? "text-gray-500" : "text-gray-400"
          )}>
            Select an item from the sidebar to view its details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex-1 flex flex-col",
      isDark ? "bg-dark-900" : "bg-white"
    )}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPin(selectedItem.id)}
              className={cn(
                "p-2 rounded-md transition-colors",
                isDark 
                  ? "hover:bg-white/5 text-gray-400" 
                  : "hover:bg-black/5 text-gray-500"
              )}
            >
              <Pin className={cn(
                "h-4 w-4",
                selectedItem.pinned ? "text-primary-500" : ""
              )} />
            </Button>
            <span className={cn(
              "text-xs",
              isDark ? "text-gray-500" : "text-gray-400"
            )}>
              {formatDate(selectedItem.timestamp)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCopy(selectedItem.content)}
              className={cn(
                "p-2 rounded-md transition-colors",
                isDark 
                  ? "hover:bg-white/5 text-gray-400" 
                  : "hover:bg-black/5 text-gray-500"
              )}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(selectedItem.id)}
              className={cn(
                "p-2 rounded-md transition-colors",
                isDark 
                  ? "hover:bg-white/5 text-gray-400" 
                  : "hover:bg-black/5 text-gray-500"
              )}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-auto">
        {selectedItem.type === 'image' ? (
          <img 
            src={selectedItem.content} 
            alt="Clipboard image" 
            className="max-w-full h-auto rounded-lg"
          />
        ) : (
          <pre className={cn(
            "whitespace-pre-wrap break-words",
            isDark ? "text-gray-300" : "text-gray-700"
          )}>
            {selectedItem.content}
          </pre>
        )}
      </div>
    </div>
  );
};