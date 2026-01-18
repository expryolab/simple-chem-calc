"use client";

import * as React from "react";

type ButtonVariant = "outline" | "solid";
type ButtonSize = "md";
type ButtonTextSize = "sm" | "base" | "lg" | "xl" | "2xl";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  textSize?: ButtonTextSize;
  fullWidth?: boolean;
  loading?: boolean;
};

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

const base =
  "inline-flex items-center justify-center font-medium " +
  "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  outline:
    "border-2 border-solid border-indigo-500 text-indigo-600 " +
    "hover:bg-indigo-50",
  solid: "bg-indigo-600 text-white hover:bg-indigo-700",
};

const sizes: Record<ButtonSize, string> = {
  md: "rounded-lg px-4 w-36 h-10",
};

const textSizes: Record<ButtonTextSize, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
};

export function Button({
  variant = "outline",
  size = "md",
  textSize = "base",
  fullWidth,
  loading,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        base,
        variants[variant],
        sizes[size],
        textSizes[textSize],
        fullWidth && "w-full",
        className
      )}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? "計算中..." : children}
    </button>
  );
}
