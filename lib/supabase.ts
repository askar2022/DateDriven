import { createClient } from '@supabase/supabase-js'

// Use environment variables for production, fallback to hardcoded for local testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jnbpiftobpbyglzrqcry.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuYnBpZnRvYnBieWdsenJxY3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NTU2NzYsImV4cCI6MjA3MzAzMTY3Nn0.sQLYqKSj2fHEAI3FrUUYsWKrO13jz927WdvYge_3HQI'

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key:', supabaseAnonKey ? 'Present' : 'Missing')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: number
  email: string
  name: string
  role: 'TEACHER' | 'LEADER'
  created_at: string
  updated_at: string
}

export interface Upload {
  id: string
  teacher_id: number
  teacher_name: string
  week_number: number
  week_label: string
  grade: string
  class_name: string
  subject: string
  total_students: number
  average_score: number
  upload_time: string
  created_at: string
}

export interface Student {
  id: string
  upload_id: string
  student_id: string
  student_name: string
  subject: string
  score: number
  grade: string
  class_name: string
  week_number: number
  created_at: string
}
