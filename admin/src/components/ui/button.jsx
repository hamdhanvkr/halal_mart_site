import * as React from "react";

import { cn } from "../../lib/utils";

const Button = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      ...props
    },
    ref
  ) => {
    const variants = {
      default:
        "bg-slate-900 text-white hover:bg-slate-800",
      outline:
        "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
      secondary:
        "bg-slate-100 text-slate-900 hover:bg-slate-200",
      destructive:
        "bg-red-600 text-white hover:bg-red-700",
      ghost:
        "text-slate-700 hover:bg-slate-100",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-6",
      icon: "h-10 w-10",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };