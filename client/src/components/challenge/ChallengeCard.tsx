import React from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'
import Card from '../ui/Card'
import { StatusBadge } from '../ui/Badge'
import { formatDate } from '../../lib/constants'
import type { Challenge } from '../../types'

interface ChallengeCardProps {
  challenge: Challenge
}

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  return (
    <Link to={`/challenges/${challenge.id}`}>
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between group gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            challenge.status === 'COMPLETED' ? 'bg-success/10' : 'bg-accent/10'
          }`}>
            {challenge.status === 'COMPLETED' ? (
              <CheckCircle size={20} className="text-success" />
            ) : (
              <span className="text-lg font-bold text-accent">
                {challenge.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold group-hover:text-accent transition-colors line-clamp-1">
                {challenge.name}
              </span>
              <StatusBadge status={challenge.status} />
            </div>
            <p className="text-xs text-text-muted mt-0.5 whitespace-nowrap">
              {formatDate(challenge.startDate)} — {formatDate(challenge.endDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-border pt-3 sm:pt-0">
          <div className="text-left sm:text-right">
            <p className="text-xs text-text-muted">Longest Streak</p>
            <p className="text-sm font-semibold">{challenge.longestStreak} days</p>
          </div>
          <ArrowRight size={16} className="text-text-muted group-hover:text-accent transition-colors flex-shrink-0" />
        </div>
      </Card>
    </Link>
  )
}
