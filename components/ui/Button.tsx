"use client"

import React from "react"

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: "sm" | "md" | "lg"
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500",
  secondary:
    "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 focus-visible:ring-indigo-500",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-indigo-500",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
}

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-sm",
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const variantClass = variantStyles[variant]
  const sizeClass = sizeStyles[size]

  return (
    <button
      className={`inline-flex items-center justify-center rounded-full font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled}
      {...props}
    />
  )
}
