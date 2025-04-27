import React from 'react';
import { motion } from 'framer-motion';
import { Pin, File, FileText, Image, Link, Copy, Trash2 } from 'lucide-react';
import { cn } from '../utils/cn';

interface ClipboardItem {
  id: string;
  content: string;
  timestamp: number;
  type: "text" | "image" | "link";
  pinned?: boolean;
  metadata?: any;
}

interface ClipboardEntryProps {
  item: ClipboardItem;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (id: string) => Promise<void>;
  onPin: (id: string) => Promise<void>;
  onCopy: (content: string) => Promise<void>;
  isDark: boolean;
  formatDate: (timestamp: number) => string;
  getTypeIcon: (type: string) => JSX.Element;
}

export const ClipboardEntry: React.FC<ClipboardEntryProps> = ({
  item,
  isSelected,
  onClick,
  onDelete,
  onPin,
  onCopy,
  isDark,
  formatDate,
  getTypeIcon
}) => {
  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPin(item.id);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy(item.content);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        "p-2 mx-2 my-1 rounded-md cursor-pointer transition-all duration-200",
        "backdrop-blur-sm border",
        isSelected 
          ? isDark 
            ? "bg-dark-800/80 border-primary-600/50 text-primary-400" 
            : "bg-primary-50/80 border-primary-200 text-primary-700"
          : isDark 
            ? "hover:bg-dark-800/50 border-dark-800/50" 
            : "hover:bg-gray-100/70 border-gray-200/50",
        "flex items-center space-x-2"
      )}
    >
      <div className={cn(
        "p-1.5 rounded",
        isDark ? "bg-dark-800" : "bg-gray-100"
      )}>
        {item.pinned ? (
          <Pin className={cn(
            "h-3.5 w-3.5",
            isDark ? "text-primary-400" : "text-primary-500"
          )} />
        ) : (
          getTypeIcon(item.type)
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className={cn(
          "text-sm truncate",
          isDark ? "text-gray-200" : "text-gray-800"
        )}>
          {item.content.replace(/\s+/g, ' ').substring(0, 30)}
          {item.content.length > 30 && "..."}
        </div>
        <div className={cn(
          "text-xs",
          isDark ? "text-gray-500" : "text-gray-500"
        )}>
          {formatDate(item.timestamp)}
        </div>
      </div>
      
      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={handlePin}
          className={cn(
            "p-1 rounded-full",
            isDark ? "hover:bg-dark-700" : "hover:bg-gray-200"
          )}
        >
          <Pin className={cn(
            "h-3 w-3",
            item.pinned 
              ? isDark ? "text-primary-400" : "text-primary-500" 
              : isDark ? "text-gray-400" : "text-gray-500"
          )} />
        </button>
        <button 
          onClick={handleCopy}
          className={cn(
            "p-1 rounded-full",
            isDark ? "hover:bg-dark-700" : "hover:bg-gray-200"
          )}
        >
          <Copy className={cn(
            "h-3 w-3",
            isDark ? "text-gray-400" : "text-gray-500"
          )} />
        </button>
        <button 
          onClick={handleDelete}
          className={cn(
            "p-1 rounded-full",
            isDark ? "hover:bg-dark-700" : "hover:bg-gray-200"
          )}
        >
          <Trash2 className="h-3 w-3 text-red-500" />
        </button>
      </div>
    </motion.div>
  );
};