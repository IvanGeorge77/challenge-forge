import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export default function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </span>
        )}
        <input
          className={`
            w-full px-4 py-2.5 rounded-lg text-sm
            bg-bg-input border border-border
            text-text-primary placeholder:text-text-muted
            focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
            transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-danger focus:border-danger focus:ring-danger/30' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-2.5 rounded-lg text-sm
          bg-bg-input border border-border
          text-text-primary placeholder:text-text-muted
          focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
          transition-all duration-200 resize-none
          ${error ? 'border-danger' : ''}
          ${className}
        `}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
