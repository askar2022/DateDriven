import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { promises as fs } from 'fs'
import path from 'path'
import { supabase } from '@/lib/supabase'

// Force dynamic rendering to prevent build-time data collection
export const dynamic = 'force-dynamic'
export const revalidate = 0

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'uploads.json')

// Ensure data directory exists
async function ensureDataDirectory(): Promise<void> {
  const dataDir = path.dirname(DATA_FILE_PATH)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Extract assessment name from week_label (format: "Assessment Name - Date")
function extractAssessmentNameFromLabel(weekLabel: string): string | null {
  if (!weekLabel) return null
  
  // Look for pattern: "Assessment Name - Date"
  const match = weekLabel.match(/^(.+?)\s*-\s*\w+\s+\d+$/)
  if (match && match[1]) {
    return match[1].trim()
  }
  
  return null
}

// Load uploaded data from Supabase
async function loadUploadedData(): Promise<any[]> {
  try {
    if (!supabase) {
      console.error('Supabase not configured')
      return []
    }
    
    // Use Supabase instead of embedded data
    const { data: uploads, error } = await supabase
      .from('uploads')
      .select(`
        *,
        students (
          student_id,
          student_name,
          subject,
          score,
          grade,
          class_name,
          week_number
        )
      `)
      .order('upload_time', { ascending: false })

    if (error) {
      console.error('Supabase fetch error:', error)
      return []
    }

    // Format data to match expected structure
    return uploads.map(upload => {
      // Use actual upload time from database, formatted properly
      const uploadTime = new Date(upload.upload_time).toLocaleString('en-US', { 
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
      
      return {
        id: upload.id,
        teacherName: upload.teacher_name,
        uploadTime: uploadTime,
        weekNumber: upload.week_number,
        weekLabel: upload.week_label,
        assessmentName: upload.assessment_name || extractAssessmentNameFromLabel(upload.week_label) || `Week ${upload.week_number} Assessment`,
        assessmentType: upload.assessment_type || 'custom',
        assessmentDate: upload.assessment_date || upload.upload_time,
        totalStudents: upload.total_students,
        averageScore: upload.average_score,
        grade: upload.grade,
        className: upload.class_name,
        subject: upload.subject,
        students: upload.students.map((s: any) => ({
          studentId: s.student_id,
          studentName: s.student_name,
          subject: s.subject,
          score: s.score,
          grade: s.grade,
          className: s.class_name,
          weekNumber: s.week_number,
          uploadDate: uploadTime
        })),
        errors: []
      }
    })
  } catch (error) {
    console.error('Error loading data from Supabase:', error)
    // Return empty array if Supabase fails
    return []
  }
}

// Save uploaded data to file
async function saveUploadedData(data: any[]): Promise<void> {
  await ensureDataDirectory()
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2))
}

// GET endpoint to retrieve uploaded data
export async function GET(request: NextRequest) {
  try {
    console.log('API: GET /api/upload/weekly-scores called')
    
    const { searchParams } = new URL(request.url)
    const userRole = searchParams.get('role') || 'TEACHER'
    const userName = searchParams.get('user') || ''
    const weekFilter = searchParams.get('week')
    
    console.log('API: User role:', userRole, 'User name:', userName)
    console.log('API: User name length:', userName.length)
    console.log('API: User name characters:', userName.split('').map(c => c.charCodeAt(0)))
    const uploadedData = await loadUploadedData()
    console.log('API: Loaded uploads:', uploadedData.length)
    console.log('API: First upload:', uploadedData[0])
    
    // Filter data based on user role and name
    let filteredData = uploadedData
    
    if (userRole === 'TEACHER' && userName) {
      console.log('API: Filtering for teacher:', userName)
      console.log('API: Available teacher names:', [...new Set(uploadedData.map(u => u.teacherName))])
      filteredData = uploadedData.filter(upload => 
        upload.teacherName === userName
      )
      console.log('API: Filtered data for teacher:', filteredData.length, 'uploads')
    }
    
    // Apply week filter if specified
    if (weekFilter && weekFilter !== 'current') {
      filteredData = filteredData.filter(upload => 
        upload.weekNumber === parseInt(weekFilter)
      )
    }
    
    // Get unique weeks for dropdown
    const weekOptions = [...new Set(uploadedData.map(upload => ({
      value: upload.weekNumber.toString(),
      label: upload.weekLabel
    })))].sort((a, b) => parseInt(b.value) - parseInt(a.value))
    
    console.log('API: Filtered data:', filteredData.length, 'Week options:', weekOptions.length)
    
    // Calculate unique students across all uploads
    // Group students by studentId to avoid double counting when students have multiple subjects
    const studentMap = new Map()
    filteredData.forEach(upload => {
      if (upload.students) {
        upload.students.forEach((student: any) => {
          if (student.studentId) {
            // Only add each student once, regardless of how many subjects they have
            if (!studentMap.has(student.studentId)) {
              studentMap.set(student.studentId, student)
            }
          }
        })
      }
    })
    const uniqueStudents = new Set(studentMap.keys())
    
    console.log('API: Student map after deduplication:', studentMap.size)
    console.log('API: Student IDs in map:', Array.from(studentMap.keys()))
    
    console.log('API: Total uploads:', filteredData.length)
    console.log('API: Unique students:', uniqueStudents.size)
    console.log('API: Student map size:', studentMap.size)
    console.log('API: Student IDs:', Array.from(studentMap.keys()))
    console.log('API: Old calculation would be:', filteredData.reduce((sum, upload) => sum + (upload.totalStudents || 0), 0))
    
    // Debug: Check each upload's students
    filteredData.forEach((upload, index) => {
      console.log(`API: Upload ${index + 1} (${upload.teacherName}):`, {
        totalStudents: upload.totalStudents,
        studentsCount: upload.students?.length || 0,
        studentIds: upload.students?.map(s => s.studentId) || [],
        weekNumber: upload.weekNumber,
        subject: upload.subject
      })
    })
    
    // Debug: Check if student IDs are unique across uploads
    const allStudentIds: string[] = []
    filteredData.forEach(upload => {
      if (upload.students) {
        upload.students.forEach(student => {
          allStudentIds.push(student.studentId)
        })
      }
    })
    console.log('API: All student IDs from all uploads:', allStudentIds)
    console.log('API: Unique student IDs count:', new Set(allStudentIds).size)
    
    // Debug: Check if this is the issue - same student IDs across uploads
    const uniqueIds = [...new Set(allStudentIds)]
    console.log('API: Unique student IDs:', uniqueIds)
    console.log('API: Total student records:', allStudentIds.length)
    console.log('API: This means we have', allStudentIds.length, 'student records but only', uniqueIds.length, 'unique students')
    
    if (allStudentIds.length > uniqueIds.length) {
      console.log('API: ISSUE DETECTED - Same student IDs across multiple uploads!')
      console.log('API: This means the same students appear in multiple uploads (different weeks)')
      console.log('API: For teacher dashboard, we should count total students across all uploads, not unique students')
    }
    
    // Both teachers and admins should count unique students (not individual score records)
    const totalStudents = uniqueStudents.size
    
    console.log('API: Final totalStudents calculation:')
    console.log('API: User role:', userRole)
    console.log('API: Total student records:', allStudentIds.length)
    console.log('API: Unique students:', uniqueStudents.size)
    console.log('API: Final totalStudents:', totalStudents)
    
    console.log('=== API RESPONSE DEBUG ===')
    console.log('Total uploads:', filteredData.length)
    console.log('Assessment names:', filteredData.map(u => ({ 
      id: u.id, 
      assessmentName: u.assessmentName, 
      weekNumber: u.weekNumber,
      teacherName: u.teacherName
    })))
    
    const response = NextResponse.json({
      uploads: filteredData,
      weekOptions,
      totalUploads: filteredData.length,
      totalStudents: totalStudents
    })
    
    // Add cache-busting headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 })
  }
}

// POST endpoint to handle file uploads
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const teacherName = formData.get('teacherName') as string
    const weekNumber = parseInt(formData.get('weekNumber') as string)
    const weekStart = formData.get('weekStart') as string
    const subject = formData.get('subject') as string
    const grade = formData.get('grade') as string
    const className = formData.get('className') as string
    const assessmentName = formData.get('assessmentName') as string
    const assessmentType = formData.get('assessmentType') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    console.log('=== UPLOAD START ===')
    console.log('File:', file.name, 'Size:', file.size)
    console.log('Teacher:', teacherName, 'Week:', weekNumber)
    console.log('Subject:', subject, 'Grade:', grade, 'Class:', className)

    // Read and parse Excel file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

    console.log('=== FILE PARSED ===')
    console.log('Sheet:', sheetName, 'Rows:', jsonData.length)
    console.log('Headers:', jsonData[0])

    if (jsonData.length < 2) {
      return NextResponse.json({ error: 'File must contain at least a header row and one data row' }, { status: 400 })
    }

    const headers = jsonData[0] as string[]
    const rows = jsonData.slice(1) as any[][]

    console.log('=== VALIDATING COLUMNS ===')
    console.log('Available columns:', headers)

    // Check for required columns - PRIORITIZE STUDENT NAMES
    const hasStudentName = headers.some(h => h && h.toLowerCase().replace(/[^a-z]/g, '').includes('studentname') || 
                                            h && h.toLowerCase().replace(/[^a-z]/g, '') === 'name')
    const hasStudentId = headers.some(h => h && h.toLowerCase().includes('student') && h.toLowerCase().includes('id'))
    const hasScore = headers.some(h => h && h.toLowerCase().includes('score'))
    const hasMathGrade = headers.some(h => h && h.toLowerCase().includes('math') && h.toLowerCase().includes('grade'))
    const hasReadingGrade = headers.some(h => h && h.toLowerCase().includes('reading') && h.toLowerCase().includes('grade'))

    console.log('Column checks:', {
      hasStudentName,
      hasStudentId,
      hasScore,
      hasMathGrade,
      hasReadingGrade
    })
    
    // REQUIRE STUDENT NAME (not ID)
    if (!hasStudentName) {
      return NextResponse.json({ 
        error: `Invalid file format. Need 'Student Name' column. Found columns: ${headers.join(', ')}. Please use student names, not ID numbers.` 
      }, { status: 400 })
    }
    
    // We now only process ONE subject at a time as selected by the teacher
    console.log(`=== PROCESSING ${subject.toUpperCase()} ONLY ===`)
    console.log('Selected subject:', subject)
    
    // Find the score column - prioritize generic 'Score' column
    let scoreColumnIndex = -1
    let scoreColumnName = ''
    
    if (hasScore) {
      scoreColumnIndex = headers.findIndex(h => h && h.toLowerCase().includes('score'))
      scoreColumnName = headers[scoreColumnIndex]
    } else if (subject === 'Math' && hasMathGrade) {
      scoreColumnIndex = headers.findIndex(h => h && h.toLowerCase().includes('math') && h.toLowerCase().includes('grade'))
      scoreColumnName = headers[scoreColumnIndex]
    } else if (subject === 'Reading' && hasReadingGrade) {
      scoreColumnIndex = headers.findIndex(h => h && h.toLowerCase().includes('reading') && h.toLowerCase().includes('grade'))
      scoreColumnName = headers[scoreColumnIndex]
    }
    
    if (scoreColumnIndex === -1) {
      return NextResponse.json({ 
        error: `Invalid file format. Need 'Score' column. Found columns: ${headers.join(', ')}` 
      }, { status: 400 })
    }
    
    // Process only the selected subject
    const subjectsToProcess = [{ subject, columnIndex: scoreColumnIndex, columnName: scoreColumnName }]
    
    console.log(`=== COLUMN SELECTION ===`)
    console.log(`Subjects to process:`, subjectsToProcess.map(s => `${s.subject} (${s.columnName})`))
    console.log(`Available columns: ${headers.join(', ')}`)
    
    // Process each subject
    const allStudents: any[] = []
    const errors: string[] = []

    for (const { subject: currentSubject, columnIndex, columnName } of subjectsToProcess) {
      console.log(`=== PROCESSING ${currentSubject.toUpperCase()} ===`)
      console.log(`Using column: ${columnName} (index ${columnIndex})`)

      // PRIORITIZE STUDENT NAME - find the student name column
      const studentNameColumn = headers.findIndex(h => 
        h && (h.toLowerCase().replace(/[^a-z]/g, '').includes('studentname') || 
              h.toLowerCase().replace(/[^a-z]/g, '') === 'name'))

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        if (!row || row.length === 0) continue

        // USE STUDENT NAME as primary identifier
        const studentName = row[studentNameColumn]
        // Generate ID from name or use row number
        const studentId = studentName ? studentName.toString().toLowerCase().replace(/\s+/g, '_') : `student_${i + 1}`
        const score = row[columnIndex]

        if (!studentName || studentName.toString().trim() === '') {
          errors.push(`Row ${i + 2}: Missing student name`)
          continue
        }

        if (score === undefined || score === null || score === '') {
          errors.push(`Row ${i + 2}: Missing ${currentSubject} score for ${studentName}`)
          continue
        }

        const numericScore = parseFloat(score)
        if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
          errors.push(`Row ${i + 2}: Invalid ${currentSubject} score "${score}" for ${studentName}. Must be 0-100.`)
          continue
        }

        allStudents.push({
          studentId: studentId.toString(),
          studentName: studentName.toString(),
          subject: currentSubject,
          score: numericScore,
          grade,
          className,
          weekNumber,
          uploadDate: new Date().toLocaleString('en-US', { 
            timeZone: 'America/New_York',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          })
        })
          }
    }

    console.log(`=== PROCESSING COMPLETE ===`)
    console.log(`Total students processed: ${allStudents.length}`)
    console.log(`Errors: ${errors.length}`)

    if (allStudents.length === 0) {
      return NextResponse.json({ 
        error: 'No valid student data found. Please check your file format and try again.',
        details: errors
      }, { status: 400 })
    }

    // Calculate averages
    const mathScores = allStudents.filter(s => s.subject === 'Math').map(s => s.score)
    const readingScores = allStudents.filter(s => s.subject === 'Reading').map(s => s.score)
    const allScores = allStudents.map(s => s.score)
    
    const mathAverage = mathScores.length > 0 ? mathScores.reduce((a, b) => a + b, 0) / mathScores.length : 0
    const readingAverage = readingScores.length > 0 ? readingScores.reduce((a, b) => a + b, 0) / readingScores.length : 0
    const overallAverage = allScores.reduce((a, b) => a + b, 0) / allScores.length

    console.log('=== AVERAGES CALCULATED ===')
    console.log('Math average:', mathAverage.toFixed(1))
    console.log('Reading average:', readingAverage.toFixed(1))
    console.log('Overall average:', overallAverage.toFixed(1))

    // Create upload record with proper UUID
    const uploadId = crypto.randomUUID()
    const assessmentDate = new Date(weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const weekLabel = `${assessmentName} - ${assessmentDate}` || `Week ${weekNumber} - ${assessmentDate}`
    
    const uploadRecord = {
      id: uploadId,
      teacherName,
      uploadTime: new Date().toLocaleString('en-US', { 
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
      weekNumber,
      weekLabel,
      assessmentName: assessmentName || `Week ${weekNumber} Assessment`,
      assessmentType: assessmentType || 'weekly',
      assessmentDate: weekStart,
      totalStudents: allStudents.length, // Count all students for single subject
      averageScore: overallAverage,
      grade,
      className,
      subject: subject, // Use the selected subject directly
      students: allStudents,
      errors
    }

    console.log('=== UPLOAD RECORD CREATED ===')
    console.log('Upload ID:', uploadId)
    console.log('Total students:', uploadRecord.totalStudents)
    console.log('Average score:', uploadRecord.averageScore.toFixed(1))

    // Save to Supabase
    if (!supabase) {
      console.error('Supabase not configured')
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // Save upload record to Supabase
    // Create the insert object with only existing columns
    const insertData: any = {
      id: uploadId,
      teacher_name: teacherName,
      upload_time: new Date().toISOString(),
      week_number: weekNumber,
      week_label: weekLabel,
      total_students: uploadRecord.totalStudents,
      average_score: uploadRecord.averageScore,
      grade: grade,
      class_name: className,
      subject: uploadRecord.subject
    }

    // Only add assessment columns if they exist in the database
    // For now, we'll skip them to avoid schema errors
    // TODO: Add these columns to Supabase schema later
    // insertData.assessment_name = uploadRecord.assessmentName
    // insertData.assessment_type = uploadRecord.assessmentType  
    // insertData.assessment_date = uploadRecord.assessmentDate

    const { error: uploadError } = await supabase
      .from('uploads')
      .insert(insertData)

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      console.error('Upload data being inserted:', insertData)
      return NextResponse.json({ 
        error: 'Failed to save upload to database: ' + uploadError.message,
        details: uploadError,
        data: insertData
      }, { status: 500 })
    }

    // Save student records to Supabase
    const { error: studentsError } = await supabase
      .from('students')
      .insert(allStudents.map(student => ({
        upload_id: uploadId,
        student_id: student.studentId,
        student_name: student.studentName,
        subject: student.subject,
        score: student.score,
        grade: student.grade,
        class_name: student.className,
        week_number: student.weekNumber
      })))

    if (studentsError) {
      console.error('Supabase students error:', studentsError)
      const studentData = allStudents.map(student => ({
        upload_id: uploadId,
        student_id: student.studentId,
        student_name: student.studentName,
        subject: student.subject,
        score: student.score,
        grade: student.grade,
        class_name: student.className,
        week_number: student.weekNumber
      }))
      console.error('Students data being inserted:', studentData)
      return NextResponse.json({ 
        error: 'Failed to save students to database: ' + studentsError.message,
        details: studentsError,
        sampleData: studentData[0]
      }, { status: 500 })
    }

    console.log('=== UPLOAD SUCCESSFUL ===')
    console.log('Data saved to Supabase successfully')

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${allStudents.length} student scores for ${subject}`,
      uploadId,
      processedCount: allStudents.length,
      totalStudents: uploadRecord.totalStudents,
      averageScore: uploadRecord.averageScore,
      mathAverage: mathAverage,
      readingAverage: readingAverage,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE endpoint to delete an upload
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const uploadId = searchParams.get('id')
    
    if (!uploadId) {
      return NextResponse.json({ error: 'Upload ID is required' }, { status: 400 })
    }

    console.log('DELETE request for upload ID:', uploadId)

    // Delete from Supabase
    const { error: deleteError } = await supabase
      .from('uploads')
      .delete()
      .eq('id', uploadId)

    if (deleteError) {
      console.error('Supabase delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete upload' }, { status: 500 })
    }

    // Also delete related students
    const { error: studentsDeleteError } = await supabase
      .from('students')
      .delete()
      .eq('upload_id', uploadId)

    if (studentsDeleteError) {
      console.error('Supabase students delete error:', studentsDeleteError)
      // Don't fail the request if students deletion fails
    }

    console.log('Upload deleted successfully:', uploadId)
    return NextResponse.json({ success: true, message: 'Upload deleted successfully' })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}