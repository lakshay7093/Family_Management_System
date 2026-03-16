import React from "react"

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string
  subtitle?: string
  footer?: React.ReactNode
}

export default function Card({ title, subtitle, footer, className = "", children, ...props }: CardProps) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`} {...props}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
        </div>
      )}
      {children}
      {footer && <div className="mt-6 text-sm text-slate-500">{footer}</div>}
    </div>
  )
}
