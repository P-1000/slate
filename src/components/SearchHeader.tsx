import React from "react";
import { cn } from "../utils/cn";
import { SearchBar } from "./SearchBar";
import { TypeDropdown } from "./TypeDropdown";
import { SettingsButton } from "./SettingsButton";
import { Grip } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../ThemeContext";

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
  setShowSettings
}) => {
  const { colorPalette } = useTheme();
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);

  return (
    <motion.div
      className={cn(
        "absolute top-0 left-0 right-0 p-4 z-10",
        "glass-morphism glass-panel",
        isDark ? "glass-morphism-dark" : "glass-morphism-light",
        "border-b border-primary-500/20"
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
        
        <SettingsButton onClick={() => setShowSettings(true)} />
      </div>
    </motion.div>
  );
};