import * as React from "react";
import { Clipboard, RefreshCw } from "lucide-react";
import { cn } from "../utils/cn";
import { Button } from "./ui/Button";

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  isDark: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  actionLabel,
  onAction,
  isDark,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center mb-4",
        isDark ? "bg-dark-800" : "bg-gray-100"
      )}>
        {onAction ? (
          <RefreshCw className={cn(
            "h-6 w-6",
            isDark ? "text-gray-400" : "text-gray-500"
          )} />
        ) : (
          <Clipboard className={cn(
            "h-6 w-6",
            isDark ? "text-gray-400" : "text-gray-500"
          )} />
        )}
      </div>
      <p className={cn(
        "text-sm text-center mb-4",
        isDark ? "text-gray-400" : "text-gray-500"
      )}>
        {message}
      </p>
      {actionLabel && onAction && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onAction}
          className={cn(
            isDark ? "text-primary-400" : "text-primary-500"
          )}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};