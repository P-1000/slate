import React from 'react';
import { cn } from '../utils/cn';

interface DetailRowProps {
  label: string;
  value: string | number;
  isDark: boolean;
}

export const DetailRow: React.FC<DetailRowProps> = ({ label, value, isDark }) => {
  return (
    <div className={cn(
      "p-3 rounded-md",
      isDark ? "bg-dark-800/70" : "bg-gray-100/70"
    )}>
      <div className={cn(
        "text-xs font-medium mb-1",
        isDark ? "text-gray-400" : "text-gray-500"
      )}>
        {label}
      </div>
      <div className="text-sm truncate">
        {value}
      </div>
    </div>
  );
};