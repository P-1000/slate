import React from "react";
import { FileText, Image, Link, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../utils/cn";

interface TypeDropdownProps {
  activeTab: 'all' | 'text' | 'link' | 'image';
  setActiveTab: (tab: 'all' | 'text' | 'link' | 'image') => void;
  isDark: boolean;
}

export const TypeDropdown: React.FC<TypeDropdownProps> = ({
  activeTab,
  setActiveTab,
  isDark
}) => {
  const [showTypeDropdown, setShowTypeDropdown] = React.useState(false);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.type-dropdown-container')) {
        setShowTypeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative type-dropdown-container">
      <button
        onClick={() => setShowTypeDropdown(!showTypeDropdown)}
        className={cn(
          "flex items-center gap-2 px-4 py-3 rounded-lg",
          "glass-button"
        )}
      >
        {activeTab === 'all' ? (
          <span>All Types</span>
        ) : activeTab === 'text' ? (
          <><FileText className="h-4 w-4 mr-1" /> Text</>
        ) : activeTab === 'link' ? (
          <><Link className="h-4 w-4 mr-1" /> Links</>
        ) : (
          <><Image className="h-4 w-4 mr-1" /> Images</>
        )}
        <ChevronDown className="h-4 w-4" />
      </button>
      
      {showTypeDropdown && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className={cn(
            "absolute right-0 mt-1 w-40 rounded-lg shadow-lg z-20",
            "glass-morphism glass-panel",
            isDark ? "glass-morphism-dark" : "glass-morphism-light"
          )}
        >
          <div className="py-1">
            <button
              onClick={() => {
                setActiveTab('all');
                setShowTypeDropdown(false);
              }}
              className={cn(
                "flex items-center w-full px-4 py-2 text-left",
                activeTab === 'all' ? "bg-primary-500/20" : "hover:bg-white/10 dark:hover:bg-dark-800/30"
              )}
            >
              All Types
            </button>
            <button
              onClick={() => {
                setActiveTab('text');
                setShowTypeDropdown(false);
              }}
              className={cn(
                "flex items-center w-full px-4 py-2 text-left",
                activeTab === 'text' ? "bg-primary-500/20" : "hover:bg-white/10 dark:hover:bg-dark-800/30"
              )}
            >
              <FileText className="h-4 w-4 mr-2 text-blue-500" />
              Text
            </button>
            <button
              onClick={() => {
                setActiveTab('link');
                setShowTypeDropdown(false);
              }}
              className={cn(
                "flex items-center w-full px-4 py-2 text-left",
                activeTab === 'link' ? "bg-primary-500/20" : "hover:bg-white/10 dark:hover:bg-dark-800/30"
              )}
            >
              <Link className="h-4 w-4 mr-2 text-green-500" />
              Links
            </button>
            <button
              onClick={() => {
                setActiveTab('image');
                setShowTypeDropdown(false);
              }}
              className={cn(
                "flex items-center w-full px-4 py-2 text-left",
                activeTab === 'image' ? "bg-primary-500/20" : "hover:bg-white/10 dark:hover:bg-dark-800/30"
              )}
            >
              <Image className="h-4 w-4 mr-2 text-purple-500" />
              Images
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};