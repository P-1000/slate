import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pin, Search, Moon, Sun, Settings } from "lucide-react";
import { cn } from "../utils/cn";
import { ClipboardItem } from "../types";
import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";
import { Button } from "./ui/Button";

interface SidebarProps {
  isDark: boolean;
  isLoading: boolean;
  error: string | null;
  filteredPinnedItems: ClipboardItem[];
  filteredUnpinnedItems: ClipboardItem[];
  selectedItem: ClipboardItem | null;
  setSelectedItem: (item: ClipboardItem | null) => void;
  fetchClipboardData: () => void;
  formatDate: (timestamp: number) => string;
  getTypeIcon: (type: string) => React.ReactNode;
  onThemeToggle: () => void;
  onSettingsClick: () => void;
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
  onThemeToggle,
  onSettingsClick,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const hasItems = filteredPinnedItems.length > 0 || filteredUnpinnedItems.length > 0;

  // Focus search input on mount and when window is shown
  React.useEffect(() => {
    searchInputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const renderClipboardItem = (item: ClipboardItem) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={cn(
        "group p-3 rounded-md cursor-pointer mb-1",
        "transition-all duration-150 ease-out",
        selectedItem?.id === item.id 
          ? isDark 
            ? "bg-primary-500/20 text-white" 
            : "bg-primary-500/10 text-primary-900"
          : isDark
            ? "hover:bg-white/5 text-gray-300"
            : "hover:bg-black/5 text-gray-700",
      )}
      onClick={() => setSelectedItem(item)}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "text-lg flex-shrink-0 mt-0.5",
          selectedItem?.id === item.id
            ? "text-primary-500"
            : isDark ? "text-gray-400" : "text-gray-500",
          "group-hover:text-primary-500 transition-colors"
        )}>
          {getTypeIcon(item.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="line-clamp-2 text-sm break-all font-medium">
            {item.type === 'image' ? 'Image' : item.content}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={cn(
              "text-xs",
              isDark ? "text-gray-500" : "text-gray-400"
            )}>
              {formatDate(item.timestamp)}
            </span>
            {item.pinned && (
              <Pin className="h-3 w-3 text-primary-500" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={cn(
      "h-full flex flex-col",
      isDark ? "bg-dark-900" : "bg-white",
      "border-r",
      isDark ? "border-dark-800" : "border-gray-200"
    )}>
      <div className={cn(
        "p-3 border-b flex items-center gap-2 sticky top-0 z-10",
        isDark ? "bg-dark-900/80" : "bg-white/80",
        "backdrop-blur-sm"
      )}>
        <div className={cn(
          "flex-1 flex items-center gap-2 px-3 py-2 rounded-md",
          isDark ? "bg-dark-800" : "bg-gray-100",
          "transition-colors duration-150"
        )}>
          <Search className="h-4 w-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search clipboard... (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "bg-transparent w-full text-sm outline-none placeholder:text-gray-400",
              isDark ? "text-white" : "text-gray-900",
              "transition-colors duration-150"
            )}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onThemeToggle}
          className={cn(
            "p-2 rounded-md transition-colors",
            isDark 
              ? "hover:bg-white/5 text-gray-400" 
              : "hover:bg-black/5 text-gray-500"
          )}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onSettingsClick}
          className={cn(
            "p-2 rounded-md transition-colors",
            isDark 
              ? "hover:bg-white/5 text-gray-400" 
              : "hover:bg-black/5 text-gray-500"
          )}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          {error && (
            <div className={cn(
              "mb-4 p-3 rounded-md text-sm",
              isDark ? "bg-red-500/10 text-red-400" : "bg-red-500/10 text-red-600"
            )}>
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner className="text-primary-500" />
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
                    "text-xs font-medium mb-2 px-2",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    Pinned
                  </h3>
                  {filteredPinnedItems.map(renderClipboardItem)}
                </div>
              )}
              
              {filteredUnpinnedItems.length > 0 && (
                <div>
                  <h3 className={cn(
                    "text-xs font-medium mb-2 px-2",
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
    </div>
  );
};