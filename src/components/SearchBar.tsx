import React from "react";
import { Search } from "lucide-react";
import { cn } from "../utils/cn";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDark: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  isDark 
}) => {
  return (
    <div className="relative flex-1">
      <Search className={cn(
        "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2",
        isDark ? "text-gray-400" : "text-gray-500"
      )} />
      <input
        type="text"
        placeholder="Search clipboard..."
        className={cn(
          "w-full pl-10 pr-4 py-3 rounded-lg text-base focus:outline-none transition-all",
          isDark ? "bg-dark-800 text-white" : "bg-gray-100 text-gray-900",
          "border",
          isDark ? "border-dark-700" : "border-gray-200"
        )}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};