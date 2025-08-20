'use client'

import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Eye, 
  EyeOff, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Award,
  CheckCircle
} from 'lucide-react'

export default function LandingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  })

  // If already signed in, redirect to dashboard
  if (session) {
    router.push('/dashboard-web')
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard-web' })
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Why Sign Up */}
      <div className="lg:w-1/2 bg-gray-50 relative overflow-hidden flex items-center justify-center p-12">
        <div className="max-w-md text-center">
          
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Why sign up?
          </h1>

          {/* Benefits List */}
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-700">Organize all your student performance data within Student Analytics Workspaces</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-700">Sync your assessment data across devices</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-700">Back up your data to the Student Analytics cloud</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-700">It's free!</span>
            </div>
          </div>

          {/* Illustration */}
          <div className="mt-12 relative">
            <div className="bg-white rounded-xl shadow-sm p-6 mx-auto max-w-xs">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                </div>
                <div className="h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
            
            {/* Background circles */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-orange-100 rounded-full opacity-60"></div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-blue-100 rounded-full opacity-60"></div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          
          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Student Analytics account</h2>
          </div>

          {/* Sign Up Form */}
          <form className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-sm text-gray-700 mb-1">
                Work email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder=""
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder=""
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-gray-700 mb-1">
                Password
                <span className="float-right text-blue-600 text-xs cursor-pointer">Show</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder=""
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2 text-xs">
              <label className="flex items-start">
                <input type="checkbox" className="mt-1 mr-2 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                <span className="text-gray-600">
                  Receive product updates, news, and other marketing communications
                </span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2 rounded border-gray-300 text-orange-500 focus:ring-orange-500" defaultChecked />
                <span className="text-gray-600">Stay signed in</span>
              </label>
            </div>

            {/* reCAPTCHA placeholder */}
            <div className="flex items-center p-3 border border-gray-300 rounded bg-gray-50">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm text-gray-600">Verify you are human</span>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-2.5 rounded font-medium hover:bg-orange-600 transition-colors text-sm"
            >
              Create Free Account
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Social Sign Up - Compact Icons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center py-3 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                title="Sign Up with Google"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>

              <button
                type="button"
                className="flex items-center justify-center py-3 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                title="Sign Up with GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </button>

              <button
                type="button"
                className="flex items-center justify-center py-3 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                title="Sign In with SSO"
              >
                <CheckCircle className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Labels for social buttons */}
            <div className="grid grid-cols-3 gap-3 text-xs text-center text-gray-600">
              <span>Sign Up with Google</span>
              <span>Sign Up with GitHub</span>
              <span>Sign In with SSO</span>
            </div>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center mt-6">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
            </p>
          </form>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="text-center py-8 mt-12 border-t border-gray-200">
        <p className="text-gray-500 text-sm">
          © 2025 Analytics by Dr. Askar. All rights reserved.
        </p>
      </div>
    </div>
  )
}
