import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'green' | 'orange' | 'red' | 'blue' | 'purple' | 'gray'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className = '' 
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200', 
    red: 'bg-red-100 text-red-800 border-red-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    gray: 'bg-gray-100 text-gray-600 border-gray-200'
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  return (
    <span 
      className={`
        inline-flex items-center font-medium rounded-full border
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}

interface TierBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showScore?: boolean
}

export function TierBadge({ score, size = 'md', showScore = false }: TierBadgeProps) {
  const getTierData = (score: number) => {
    if (score >= 85) return { variant: 'green' as const, label: 'Green', emoji: '🟢' }
    if (score >= 75) return { variant: 'orange' as const, label: 'Orange', emoji: '🟠' }
    if (score >= 65) return { variant: 'red' as const, label: 'Red', emoji: '🔴' }
    return { variant: 'gray' as const, label: 'Gray', emoji: '⚪' }
  }

  const { variant, label, emoji } = getTierData(score)

  return (
    <Badge variant={variant} size={size}>
      <span className="flex items-center gap-1">
        <span>{emoji}</span>
        <span>{label}</span>
        {showScore && <span>({score})</span>}
      </span>
    </Badge>
  )
}
