import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
