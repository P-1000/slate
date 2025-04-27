import React, { Component, ErrorInfo, ReactNode } from "react";
import { cn } from "../utils/cn";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    
    // Add more detailed logging
    console.log("Component stack:", errorInfo.componentStack);
    console.log("Error name:", error.name);
    console.log("Error message:", error.message);
    console.log("Error stack:", error.stack);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className={cn(
          "flex flex-col items-center justify-center h-full p-6",
          "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
        )}>
          <div className="text-3xl mb-4">😕</div>
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="mb-4 text-center max-w-md">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className={cn(
              "px-4 py-2 rounded-lg",
              "bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700",
              "transition-colors duration-200"
            )}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}