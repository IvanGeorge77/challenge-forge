import React from 'react'

interface SkeletonProps {
  className?: string
}

export default function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-bg-elevated rounded-md ${className}`} />
  )
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`glass-card p-6 flex flex-col gap-4 ${className}`}>
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <Skeleton className="h-20 w-full mt-2" />
    </div>
  )
}

export function SkeletonStatCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`glass-card p-6 flex flex-col justify-between h-28 ${className}`}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="w-5 h-5 rounded-md" />
      </div>
      <Skeleton className="h-8 w-1/2" />
    </div>
  )
}
