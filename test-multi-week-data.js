// Test script to check multi-week data in Supabase
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://jnbpiftobpbyglzrqcry.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuYnBpZnRvYnBieWdsenJxY3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NTU2NzYsImV4cCI6MjA3MzAzMTY3Nn0.sQLYqKSj2fHEAI3FrUUYsWKrO13jz927WdvYge_3HQI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testData() {
  console.log('Testing Supabase data...')
  
  // Check uploads table
  const { data: uploads, error: uploadsError } = await supabase
    .from('uploads')
    .select('*')
    .order('week_number', { ascending: true })
  
  if (uploadsError) {
    console.error('Uploads error:', uploadsError)
  } else {
    console.log('Uploads:', uploads.length)
    console.log('Upload details:', uploads.map(u => ({
      teacher: u.teacher_name,
      week: u.week_number,
      students: u.total_students
    })))
  }
  
  // Check students table
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('*')
    .order('week_number', { ascending: true })
  
  if (studentsError) {
    console.error('Students error:', studentsError)
  } else {
    console.log('Students:', students.length)
    console.log('Student details:', students.map(s => ({
      name: s.student_name,
      subject: s.subject,
      score: s.score,
      week: s.week_number
    })))
  }
}

testData().catch(console.error)
