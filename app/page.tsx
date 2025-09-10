'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Only redirect when session status is determined
    if (status === 'loading') return
    
    // Redirect based on user role
    if (session) {
      const userRole = (session.user as any)?.role
      console.log('User role:', userRole, 'User name:', session.user?.name)
      if (userRole === 'LEADER') {
        router.push('/beautiful-dashboard')
      } else {
        // Teachers go to their dashboard (default for non-LEADER roles)
        router.push('/teacher-dashboard')
      }
    } else {
      router.push('/auth')
    }
  }, [session, status, router])

  // Show loading while determining session status
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // This should never be reached due to redirects
  return null
}
