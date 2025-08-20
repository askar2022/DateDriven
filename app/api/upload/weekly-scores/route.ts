import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { processExcelFile } from '@/lib/excel-processor'

export async function POST(request: NextRequest) {
  try {
    // Temporary: Skip authentication for development
    const user = await getCurrentUser()
    
    // If no user found (no auth configured), use mock user for development
    const mockUser = user || {
      id: 'mock-user-id',
      email: 'demo@school.edu',
      name: 'Demo User',
      role: 'STAFF'
    }
    
    if (!mockUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has upload permissions (TEACHER, STAFF roles)
    if (!['TEACHER', 'STAFF'].includes(mockUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json({ error: 'Invalid file type. Please upload an Excel file.' }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Process the Excel file
    const result = await processExcelFile(buffer, mockUser.id)

    if (!result.success && result.errors.length > 0) {
      return NextResponse.json({
        success: false,
        errors: result.errors,
        processedCount: result.processedCount,
        unmatchedStudents: result.unmatchedStudents,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      processedCount: result.processedCount,
      unmatchedStudents: result.unmatchedStudents,
      message: `Successfully processed ${result.processedCount} scores`,
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
