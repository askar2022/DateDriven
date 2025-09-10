import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Starting admin cleanup...')
    
    // Get all uploads
    const { data: uploads, error: uploadsError } = await supabase
      .from('uploads')
      .select('*')
      .order('upload_time', { ascending: false })
    
    if (uploadsError) {
      console.error('❌ Error fetching uploads:', uploadsError)
      return NextResponse.json({ error: 'Failed to fetch uploads' }, { status: 500 })
    }
    
    console.log(`📊 Found ${uploads.length} uploads`)
    
    // Keep only uploads from Mr. Adams (real teacher)
    const realUploads = uploads.filter(upload => 
      upload.teacher_name === 'Mr. Adams' || 
      upload.teacher_name === 'mr.adams' ||
      upload.teacher_name?.toLowerCase().includes('adams')
    )
    
    console.log(`✅ Found ${realUploads.length} real uploads from Mr. Adams`)
    
    if (realUploads.length === 0) {
      return NextResponse.json({ 
        message: 'No real uploads found from Mr. Adams',
        uploads: uploads.length,
        students: 0
      })
    }
    
    // Get upload IDs to keep
    const realUploadIds = realUploads.map(upload => upload.id)
    
    // Delete all students not from real uploads
    const { error: studentsDeleteError } = await supabase
      .from('students')
      .delete()
      .not('upload_id', 'in', `(${realUploadIds.join(',')})`)
    
    if (studentsDeleteError) {
      console.error('❌ Error deleting test student data:', studentsDeleteError)
      return NextResponse.json({ error: 'Failed to delete test student data' }, { status: 500 })
    }
    
    // Delete all uploads not from real teachers
    const { error: uploadsDeleteError } = await supabase
      .from('uploads')
      .delete()
      .not('id', 'in', `(${realUploadIds.join(',')})`)
    
    if (uploadsDeleteError) {
      console.error('❌ Error deleting test upload data:', uploadsDeleteError)
      return NextResponse.json({ error: 'Failed to delete test upload data' }, { status: 500 })
    }
    
    // Get final counts
    const { data: finalUploads } = await supabase
      .from('uploads')
      .select('*')
    
    const { data: finalStudents } = await supabase
      .from('students')
      .select('*')
    
    const uniqueStudents = new Set(finalStudents?.map(s => s.student_id) || [])
    
    console.log(`✅ Cleanup completed! Final state: ${finalUploads?.length || 0} uploads, ${uniqueStudents.size} unique students`)
    
    return NextResponse.json({
      message: 'Cleanup completed successfully',
      uploads: finalUploads?.length || 0,
      students: finalStudents?.length || 0,
      uniqueStudents: uniqueStudents.size,
      realUploads: realUploads.length
    })
    
  } catch (error) {
    console.error('❌ Cleanup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get current data for debugging
    const { data: uploads, error: uploadsError } = await supabase
      .from('uploads')
      .select('*')
      .order('upload_time', { ascending: false })
    
    if (uploadsError) {
      return NextResponse.json({ error: 'Failed to fetch uploads' }, { status: 500 })
    }
    
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
    
    if (studentsError) {
      return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
    }
    
    const uniqueStudents = new Set(students?.map(s => s.student_id) || [])
    
    return NextResponse.json({
      uploads: uploads?.length || 0,
      students: students?.length || 0,
      uniqueStudents: uniqueStudents.size,
      uploadDetails: uploads?.map(upload => ({
        id: upload.id,
        teacher: upload.teacher_name,
        students: upload.total_students,
        week: upload.week_number,
        date: upload.upload_time
      })) || []
    })
    
  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
