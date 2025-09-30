'use client'

import React, { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  BarChart3,
  AlertCircle
} from 'lucide-react'

export default function AuthPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // Redirect if already signed in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      const userRole = (session.user as any)?.role
      
      // Redirect based on role
      if (userRole === 'LEADER') {
        router.push('/admin-overview')
      } else if (userRole === 'TEACHER') {
        router.push('/teacher-dashboard')
      } else {
        router.push('/teacher-dashboard') // Default to teacher dashboard
      }
    }
  }, [status, session, router])

  // Show loading while checking session status
  if (status === 'loading') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '3px solid #e2e8f0',
            borderTop: '3px solid #0ea5e9',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'authenticated' && session) {
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('') // Clear error when user types
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })
      
      if (result?.error) {
        setError('Invalid credentials. Please try again.')
      } else {
        // Successful sign in - let NextAuth handle the redirect
        console.log('Login successful')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '1rem',
      marginTop: '-2rem' // Remove top margin since no navigation
    }}>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        
        {/* Beautiful Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', paddingTop: '2.5rem', paddingBottom: '2rem', paddingLeft: '2rem', paddingRight: '2rem' }}>
            
            {/* School Logo */}
            <div style={{
              width: '6rem',
              height: '6rem',
              margin: '0 auto 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src="/hba.png" 
                alt="HBA School Logo" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
            
            {/* Title */}
            <h1 style={{ 
              fontSize: '1.875rem', 
              fontWeight: '700', 
              color: '#111827', 
              marginBottom: '0.5rem',
              margin: 0
            }}>
              HBA Data Driven
            </h1>
            
            {/* Subtitle */}
            <p style={{ 
              color: '#6B7280', 
              fontSize: '0.875rem', 
              lineHeight: '1.6',
              margin: '0.5rem auto 0'
            }}>
              K-8 Student Analytics Portal
            </p>
          </div>

          {/* Content */}
          <div style={{ padding: '0 2rem 2rem' }}>
            
            {/* Error Message */}
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem'
              }}>
                <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#dc2626' }} />
                <span style={{ color: '#dc2626', fontSize: '0.875rem', fontWeight: '500' }}>
                  {error}
                </span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
              
              {/* Email Field */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="email" style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '0.5rem' 
                }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '1rem',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}>
                    <Mail style={{ width: '1.25rem', height: '1.25rem' }} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem 0.875rem 3rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#111827',
                      backgroundColor: 'white',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                    placeholder="your.email@school.edu"
                    required
                    onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                    onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="password" style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '0.5rem' 
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '1rem',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}>
                    <Lock style={{ width: '1.25rem', height: '1.25rem' }} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.875rem 3rem 0.875rem 3rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#111827',
                      backgroundColor: 'white',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                    placeholder="Enter your password"
                    required
                    onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                    onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: '1rem',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      zIndex: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff style={{ width: '1.25rem', height: '1.25rem' }} /> : <Eye style={{ width: '1.25rem', height: '1.25rem' }} />}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button 
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isLoading ? 0.7 : 1,
                  boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
                }}
                onMouseOver={(e) => !isLoading && (e.currentTarget.style.opacity = '0.9')}
                onMouseOut={(e) => !isLoading && (e.currentTarget.style.opacity = '1')}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>




            {/* Footer Text */}
            <div style={{ textAlign: 'center', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
              <p style={{ 
                fontSize: '0.75rem', 
                color: '#64748b', 
                lineHeight: '1.5',
                margin: 0
              }}>
                By signing in, you agree to our{' '}
                <a href="#" style={{ color: '#0ea5e9', fontWeight: '500', textDecoration: 'none' }}>Terms of Service</a>
                {' '}and{' '}
                <a href="#" style={{ color: '#0ea5e9', fontWeight: '500', textDecoration: 'none' }}>Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>

        {/* App Branding */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>
            www.hbadatadriven.com
          </p>
        </div>

        {/* Copyright Footer */}
        <div style={{
          textAlign: 'center',
          padding: '2rem 0',
          marginTop: '3rem',
          borderTop: '1px solid #E5E7EB'
        }}>
          <p style={{
            color: '#6B7280',
            fontSize: '0.875rem',
            margin: 0
          }}>
            © 2025 Data Driven by Dr. Askar. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
