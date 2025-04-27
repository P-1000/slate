import * as React from "react";
import { Clipboard, RefreshCw } from "lucide-react";
import { cn } from "../utils/cn";

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  isDark?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  icon = <Clipboard className="h-12 w-12 opacity-20" />,
  actionLabel,
  onAction,
  isDark = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className={cn(
        "mb-4",
        isDark ? "text-gray-400" : "text-gray-500"
      )}>
        {icon}
      </div>
      <p className={cn(
        "mb-4 text-lg",
        isDark ? "text-gray-300" : "text-gray-600"
      )}>
        {message}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg",
            "transition-colors duration-200",
            "bg-primary-500/10 hover:bg-primary-500/20",
            "text-primary-600 dark:text-primary-400"
          )}
        >
          <RefreshCw className="h-4 w-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};