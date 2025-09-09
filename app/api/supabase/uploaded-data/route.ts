import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userRole = searchParams.get('role')
    const userName = searchParams.get('user')
    const weekFilter = searchParams.get('week')

    console.log('Supabase API: Fetching data for role:', userRole, 'user:', userName)

    // Fetch uploads with related data
    let query = supabase
      .from('uploads')
      .select(`
        *,
        students (*)
      `)
      .order('upload_time', { ascending: false })

    // Apply week filter if provided
    if (weekFilter) {
      query = query.eq('week_number', parseInt(weekFilter))
    }

    const { data: uploads, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    console.log('Supabase: Fetched uploads:', uploads?.length || 0)

    // Filter by role
    let filteredUploads = uploads || []
    if (userRole === 'TEACHER' && userName) {
      filteredUploads = uploads?.filter(upload => upload.teacher_name === userName) || []
    }

    // Get week options
    const weekOptions = Array.from(new Set(uploads?.map(upload => ({
      week: upload.week_number,
      label: upload.week_label
    })) || [])).sort((a, b) => a.week - b.week)

    return NextResponse.json({
      uploads: filteredUploads,
      weekOptions,
      totalUploads: filteredUploads.length,
      totalStudents: filteredUploads.reduce((sum, upload) => sum + upload.total_students, 0)
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
