import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  onClick?: () => void
}

export default function Card({ children, className = '', hover = true, glow = false, onClick }: CardProps) {
  return (
    <div
      className={`
        glass-card p-6
        ${hover ? 'hover:translate-y-[-2px] hover:shadow-lg' : ''}
        ${glow ? 'animate-pulse-glow' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function StatCard({
  label,
  value,
  sublabel,
  icon,
  trend,
  className = '',
}: {
  label: string
  value: string | number
  sublabel?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-text-muted text-xs font-medium uppercase tracking-wider">{label}</span>
        {icon && <span className="text-accent">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-text-primary">{value}</span>
        {sublabel && <span className="text-text-muted text-sm mb-1">{sublabel}</span>}
      </div>
      {trend && (
        <div className={`mt-2 text-xs font-medium ${
          trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-text-muted'
        }`}>
          {trend === 'up' ? '↑ Improving' : trend === 'down' ? '↓ Declining' : '→ Stable'}
        </div>
      )}
    </Card>
  )
}
