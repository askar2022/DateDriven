import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  children: React.ReactNode
}

const buttonVariants = {
  variant: {
    default: 'bg-gray-900 text-white hover:bg-gray-800',
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-50',
    ghost: 'bg-transparent text-gray-900 hover:bg-gray-100',
    destructive: 'bg-red-600 text-white hover:bg-red-700'
  },
  size: {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
    icon: 'h-10 w-10'
  }
}

export function Button({ 
  className, 
  variant = 'default', 
  size = 'md', 
  children,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        buttonVariants.variant[variant],
        buttonVariants.size[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
