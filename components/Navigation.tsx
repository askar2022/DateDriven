'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { 
  BarChart3, 
  Upload, 
  Users, 
  FileText, 
  Settings,
  LogOut,
  User,
  Home,
  TrendingUp,
  PieChart
} from 'lucide-react'

export function Navigation() {
  const { data: session, status } = useSession()

  // Use the actual session
  const currentSession = session

  if (status === 'loading') {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="animate-pulse bg-gray-200 h-8 w-48 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
          </div>
        </div>
      </nav>
    )
  }

  if (!currentSession) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">
                Student Performance Analytics
              </span>
            </div>
            <button
              onClick={() => signIn('google')}
              className="btn-primary flex items-center space-x-2"
            >
              <User className="h-4 w-4" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </nav>
    )
  }

  const userRole = (currentSession.user as any)?.role || 'LEADER'

  return (
    <nav style={{ 
      backgroundColor: 'white', 
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      borderBottom: '1px solid #e5e7eb'
    }}>
      <div style={{ 
        maxWidth: '80rem', 
        margin: '0 auto', 
        padding: '0 1.5rem'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          height: '4rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link 
              href="/beautiful-dashboard" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                textDecoration: 'none'
              }}
            >
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BarChart3 style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
              </div>
              <span style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#111827',
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Grades 3-5 Analytics
              </span>
            </Link>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1.5rem',
              marginLeft: '1rem'
            }}>
              <Link 
                href="/beautiful-dashboard" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#374151',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6'
                  e.currentTarget.style.color = '#111827'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#374151'
                }}
              >
                <Home style={{ width: '1rem', height: '1rem' }} />
                <span>Dashboard</span>
              </Link>
              
              <Link 
                href="/students" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#374151',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6'
                  e.currentTarget.style.color = '#111827'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#374151'
                }}
              >
                <Users style={{ width: '1rem', height: '1rem' }} />
                <span>Students</span>
              </Link>
              
              <Link 
                href="/beautiful-upload" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#374151',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6'
                  e.currentTarget.style.color = '#111827'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#374151'
                }}
              >
                <Upload style={{ width: '1rem', height: '1rem' }} />
                <span>Upload</span>
              </Link>
              
              {userRole === 'LEADER' && (
                <Link 
                  href="/beautiful-reports" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#374151',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#F3F4F6'
                    e.currentTarget.style.color = '#111827'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#374151'
                  }}
                >
                  <FileText style={{ width: '1rem', height: '1rem' }} />
                  <span>Reports</span>
                </Link>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600'
              }}>
                {currentSession.user?.name?.charAt(0).toUpperCase() || 'D'}
              </div>
              <div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: '#111827' 
                }}>
                  {currentSession.user?.name}
                </div>
                <div style={{
                  backgroundColor: '#EFF6FF',
                  color: '#1D4ED8',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  textTransform: 'capitalize'
                }}>
                  {userRole.toLowerCase()}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => signOut()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#6B7280',
                background: 'none',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#FEF2F2'
                e.currentTarget.style.color = '#DC2626'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#6B7280'
              }}
            >
              <LogOut style={{ width: '1rem', height: '1rem' }} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
