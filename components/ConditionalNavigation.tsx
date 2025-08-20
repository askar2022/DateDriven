'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Navigation } from './Navigation'

export function ConditionalNavigation() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Don't show navigation on auth page or when loading
  if (status === 'loading' || pathname === '/auth') {
    return null
  }

  // Only show navigation if user is authenticated
  if (session) {
    return <Navigation />
  }

  // Don't show navigation for unauthenticated users
  return null
}
