const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://jnbpiftobpbyglzrqcry.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuYnBpZnRvYnBieWdsenJxY3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NTU2NzYsImV4cCI6MjA3MzAzMTY3Nn0.sQLYqKSj2fHEAI3FrUUYsWKrO13jz927WdvYge_3HQI'
)

async function testReportsData() {
  console.log('Testing reports data...')
  
  try {
    // Test students data
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
    
    console.log('Students query result:', { 
      count: students?.length || 0, 
      error: studentsError 
    })
    
    if (students && students.length > 0) {
      console.log('Sample student:', students[0])
    }
    
    // Test uploads data
    const { data: uploads, error: uploadsError } = await supabase
      .from('uploads')
      .select('*')
    
    console.log('Uploads query result:', { 
      count: uploads?.length || 0, 
      error: uploadsError 
    })
    
    if (uploads && uploads.length > 0) {
      console.log('Sample upload:', uploads[0])
    }
    
    // Calculate summary like the API does
    if (students && students.length > 0) {
      const uniqueStudents = new Set(students.map(s => s.student_id)).size
      const totalAssessments = students.length
      const averageScore = students.reduce((sum, s) => sum + s.score, 0) / students.length
      
      console.log('Calculated summary:', {
        uniqueStudents,
        totalAssessments,
        averageScore: Math.round(averageScore * 10) / 10
      })
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

testReportsData()

