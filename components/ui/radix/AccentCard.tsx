import React from 'react'
import { cn } from '@/lib/utils'

interface AccentCardProps {
  children: React.ReactNode
  className?: string
  accentColor?: 'blue' | 'green' | 'cyan' | 'purple' | 'orange' | 'red'
}

const accentColors = {
  blue: 'border-l-blue-400',
  green: 'border-l-green-400', 
  cyan: 'border-l-cyan-400',
  purple: 'border-l-purple-400',
  orange: 'border-l-orange-400',
  red: 'border-l-red-400'
}

export function AccentCard({ 
  children, 
  className = '', 
  accentColor = 'cyan' 
}: AccentCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-100 shadow-sm',
        'border-l-4', 
        accentColors[accentColor],
        'hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      {children}
    </div>
  )
}

interface AccentCardContentProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  badge?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function AccentCardContent({
  icon,
  title,
  subtitle,
  badge,
  action,
  className = ''
}: AccentCardContentProps) {
  return (
    <div className={cn('p-6 flex items-center justify-between', className)}>
      <div className="flex items-center gap-4 flex-1">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
          {badge && (
            <div className="mt-2">
              {badge}
            </div>
          )}
        </div>
      </div>
      
      {action && (
        <div className="flex-shrink-0 ml-4">
          {action}
        </div>
      )}
    </div>
  )
}
