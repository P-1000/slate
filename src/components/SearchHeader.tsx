import React from "react";
import { cn } from "../utils/cn";
import { SearchBar } from "./SearchBar";
import { TypeDropdown } from "./TypeDropdown";
import { Grip, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/Button";

interface SearchHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: 'all' | 'text' | 'link' | 'image';
  setActiveTab: (tab: 'all' | 'text' | 'link' | 'image') => void;
  isDark: boolean;
  setShowSettings: (show: boolean) => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  isDark,
  setShowSettings,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);

  return (
    <motion.div
      className={cn(
        "absolute top-0 left-0 right-0 p-4 z-10",
        isDark ? "bg-dark-900" : "bg-white",
        "border-b",
        isDark ? "border-dark-800" : "border-gray-200"
      )}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      style={{ cursor: isDragging ? 'grabbing' : 'auto' }}
    >
      <div className="flex items-center gap-3">
        <div 
          className={cn(
            "p-1.5 rounded cursor-grab active:cursor-grabbing",
            "hover:bg-primary-500/10",
            "transition-colors duration-200"
          )}
        >
          <Grip className="h-5 w-5 text-primary-500/70" />
        </div>
        
        <SearchBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          isDark={isDark} 
        />
        
        <TypeDropdown 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isDark={isDark} 
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings(true)}
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
    </motion.div>
  );
};