import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-white hover:bg-primary-600",
        secondary: "bg-dark-200 text-dark-900 hover:bg-dark-300 dark:bg-dark-800 dark:text-dark-100 dark:hover:bg-dark-700",
        ghost: "hover:bg-dark-100 hover:text-dark-900 dark:hover:bg-dark-800 dark:hover:text-dark-100",
        glass: "backdrop-blur-md bg-white/10 dark:bg-dark-900/30 hover:bg-white/20 dark:hover:bg-dark-800/40 text-dark-900 dark:text-white border border-white/20 dark:border-dark-700/50",
        destructive: "bg-red-500 text-white hover:bg-red-600",
      },
      size: {
        sm: "h-8 px-3 rounded-md",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 py-3 rounded-md",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };