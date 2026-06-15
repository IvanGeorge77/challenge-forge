import React from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  className?: string
  dot?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-bg-elevated text-text-secondary border-border',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  info: 'bg-info/10 text-info border-info/20',
  accent: 'bg-accent-muted text-accent border-accent/20',
}

export default function Badge({ children, variant = 'default', size = 'sm', className = '', dot = false }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-medium
        ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          variant === 'success' ? 'bg-success' :
          variant === 'warning' ? 'bg-warning' :
          variant === 'danger' ? 'bg-danger' :
          variant === 'accent' ? 'bg-accent' :
          'bg-text-muted'
        }`} />
      )}
      {children}
    </span>
  )
}

export function DifficultyBadge({ difficulty }: { difficulty: 'EASY' | 'MEDIUM' | 'HARD' }) {
  const config = {
    EASY: { variant: 'success' as BadgeVariant, label: 'Easy' },
    MEDIUM: { variant: 'warning' as BadgeVariant, label: 'Medium' },
    HARD: { variant: 'danger' as BadgeVariant, label: 'Hard' },
  }
  const { variant, label } = config[difficulty]
  return <Badge variant={variant} dot>{label}</Badge>
}

export function StatusBadge({ status }: { status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' }) {
  const config = {
    ACTIVE: { variant: 'accent' as BadgeVariant, label: 'Active' },
    COMPLETED: { variant: 'success' as BadgeVariant, label: 'Completed' },
    ARCHIVED: { variant: 'default' as BadgeVariant, label: 'Archived' },
  }
  const { variant, label } = config[status]
  return <Badge variant={variant} dot>{label}</Badge>
}

export function CategoryBadge({ category }: { category: string }) {
  return <Badge variant="default">{category.charAt(0) + category.slice(1).toLowerCase()}</Badge>
}
