import React from 'react'

interface CleanCardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  background?: 'white' | 'gray'
}

export function CleanCard({ children, className = '', padding = 'md', background = 'white' }: CleanCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50'
  }

  return (
    <div 
      className={`
        ${backgroundClasses[background]} rounded-2xl
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      {action && (
        <div>{action}</div>
      )}
    </div>
  )
}

interface InsightCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  chart?: React.ReactNode
}

export function InsightCard({ title, value, change, changeType = 'neutral', chart }: InsightCardProps) {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600', 
    neutral: 'text-gray-600'
  }

  return (
    <CleanCard background="gray" padding="md">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          {change && (
            <span className={`text-xs font-medium ${changeColors[changeType]}`}>
              {change}
            </span>
          )}
        </div>
        <div className="text-lg font-bold text-gray-900">{value}</div>
        {chart && (
          <div className="h-12">
            {chart}
          </div>
        )}
      </div>
    </CleanCard>
  )
}

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  className = '' 
}: ButtonProps) {
  const variants = {
    primary: 'bg-black text-white hover:bg-gray-800',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-50'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center justify-center rounded-full font-medium
        transition-colors duration-200
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
