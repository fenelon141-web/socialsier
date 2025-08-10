import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, style, ...props }, ref) => {
    const iosStyle: React.CSSProperties = {
      fontSize: '16px', // Prevents iOS zoom on focus
      WebkitAppearance: 'none',
      borderRadius: '8px',
      touchAction: 'manipulation',
      ...style
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]",
          className
        )}
        style={iosStyle}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }