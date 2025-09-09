import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { promises as fs } from 'fs'
import path from 'path'

// Force dynamic rendering to prevent build-time data collection
export const dynamic = 'force-dynamic'
export const revalidate = 0

// File path for persistent storage
const DATA_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'uploads.json')

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE_PATH)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Load uploaded data from file
async function loadUploadedData(): Promise<any[]> {
  // Return embedded sample data for Vercel deployment
  return [
    {
      "id": "week35_adams",
      "teacherName": "Mr.Adams",
      "uploadTime": "2025-08-25T00:00:00.000Z",
      "weekNumber": 35,
      "weekLabel": "Week 35 - Aug 25",
      "totalStudents": 18,
      "averageScore": 76.7,
      "grade": "Grade 1",
      "className": "1-A",
      "subject": "Both Math & Reading",
      "students": [
        {"studentId": "1", "studentName": "Alice Johnson", "subject": "Math", "score": 85, "grade": "Grade 1", "className": "1-A", "weekNumber": 35, "uploadDate": "2025-08-25T00:00:00.000Z"},
        {"studentId": "2", "studentName": "Bob Smith", "subject": "Math", "score": 78, "grade": "Grade 1", "className": "1-A", "weekNumber": 35, "uploadDate": "2025-08-25T00:00:00.000Z"},
        {"studentId": "1", "studentName": "Alice Johnson", "subject": "Reading", "score": 82, "grade": "Grade 1", "className": "1-A", "weekNumber": 35, "uploadDate": "2025-08-25T00:00:00.000Z"},
        {"studentId": "2", "studentName": "Bob Smith", "subject": "Reading", "score": 75, "grade": "Grade 1", "className": "1-A", "weekNumber": 35, "uploadDate": "2025-08-25T00:00:00.000Z"}
      ]
    },
    {
      "id": "week35_kelly",
      "teacherName": "Ms.Kelly",
      "uploadTime": "2025-08-25T00:00:00.000Z",
      "weekNumber": 35,
      "weekLabel": "Week 35 - Aug 25",
      "totalStudents": 20,
      "averageScore": 82.3,
      "grade": "Kindergarten",
      "className": "K-A",
      "subject": "Both Math & Reading",
      "students": [
        {"studentId": "3", "studentName": "Charlie Brown", "subject": "Math", "score": 88, "grade": "Kindergarten", "className": "K-A", "weekNumber": 35, "uploadDate": "2025-08-25T00:00:00.000Z"},
        {"studentId": "4", "studentName": "Diana Prince", "subject": "Math", "score": 91, "grade": "Kindergarten", "className": "K-A", "weekNumber": 35, "uploadDate": "2025-08-25T00:00:00.000Z"},
        {"studentId": "3", "studentName": "Charlie Brown", "subject": "Reading", "score": 85, "grade": "Kindergarten", "className": "K-A", "weekNumber": 35, "uploadDate": "2025-08-25T00:00:00.000Z"},
        {"studentId": "4", "studentName": "Diana Prince", "subject": "Reading", "score": 89, "grade": "Kindergarten", "className": "K-A", "weekNumber": 35, "uploadDate": "2025-08-25T00:00:00.000Z"}
      ]
    },
    {
      "id": "week36_adams",
      "teacherName": "Mr.Adams",
      "uploadTime": "2025-09-01T00:00:00.000Z",
      "weekNumber": 36,
      "weekLabel": "Week 36 - Sep 1",
      "totalStudents": 18,
      "averageScore": 78.2,
      "grade": "Grade 1",
      "className": "1-A",
      "subject": "Both Math & Reading",
      "students": [
        {"studentId": "1", "studentName": "Alice Johnson", "subject": "Math", "score": 87, "grade": "Grade 1", "className": "1-A", "weekNumber": 36, "uploadDate": "2025-09-01T00:00:00.000Z"},
        {"studentId": "2", "studentName": "Bob Smith", "subject": "Math", "score": 80, "grade": "Grade 1", "className": "1-A", "weekNumber": 36, "uploadDate": "2025-09-01T00:00:00.000Z"},
        {"studentId": "1", "studentName": "Alice Johnson", "subject": "Reading", "score": 84, "grade": "Grade 1", "className": "1-A", "weekNumber": 36, "uploadDate": "2025-09-01T00:00:00.000Z"},
        {"studentId": "2", "studentName": "Bob Smith", "subject": "Reading", "score": 77, "grade": "Grade 1", "className": "1-A", "weekNumber": 36, "uploadDate": "2025-09-01T00:00:00.000Z"}
      ]
    },
    {
      "id": "week37_adams",
      "teacherName": "Mr.Adams",
      "uploadTime": "2025-09-08T00:00:00.000Z",
      "weekNumber": 37,
      "weekLabel": "Week 37 - Sep 8",
      "totalStudents": 18,
      "averageScore": 79.8,
      "grade": "Grade 1",
      "className": "1-A",
      "subject": "Both Math & Reading",
      "students": [
        {"studentId": "1", "studentName": "Alice Johnson", "subject": "Math", "score": 89, "grade": "Grade 1", "className": "1-A", "weekNumber": 37, "uploadDate": "2025-09-08T00:00:00.000Z"},
        {"studentId": "2", "studentName": "Bob Smith", "subject": "Math", "score": 82, "grade": "Grade 1", "className": "1-A", "weekNumber": 37, "uploadDate": "2025-09-08T00:00:00.000Z"},
        {"studentId": "1", "studentName": "Alice Johnson", "subject": "Reading", "score": 86, "grade": "Grade 1", "className": "1-A", "weekNumber": 37, "uploadDate": "2025-09-08T00:00:00.000Z"},
        {"studentId": "2", "studentName": "Bob Smith", "subject": "Reading", "score": 79, "grade": "Grade 1", "className": "1-A", "weekNumber": 37, "uploadDate": "2025-09-08T00:00:00.000Z"}
      ]
    }
  ]
}

// Save uploaded data to file
async function saveUploadedData(data: any[]): Promise<void> {
  await ensureDataDirectory()
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2))
}

// Get current week number
function getCurrentWeekNumber(): number {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  return Math.ceil((days + startOfYear.getDay() + 1) / 7)
}

// Get week label (e.g., "Week 5 - Jan 29")
function getWeekLabel(weekNumber: number): string {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const weekStart = new Date(startOfYear.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000)
  const month = weekStart.toLocaleString('default', { month: 'short' })
  const day = weekStart.getDate()
  return `Week ${weekNumber} - ${month} ${day}`
}

export async function POST(request: NextRequest) {
  try {
    // Load existing data first
    const uploadedData: any[] = await loadUploadedData()
    console.log(`Loaded ${uploadedData.length} existing uploads`)
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const teacherName = formData.get('teacherName') as string || 'Unknown Teacher'
    const grade = formData.get('grade') as string || 'Grade 3'
    const className = formData.get('class') as string || '3-A'
    const subject = formData.get('subject') as string || 'Math'
    
    // Check for duplicate uploads (same file, same teacher, same grade/class within 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const recentUploads = uploadedData.filter(upload => 
      upload.teacherName === teacherName &&
      upload.grade === grade &&
      upload.className === className &&
      new Date(upload.uploadTime) > fiveMinutesAgo
    )
    
    if (recentUploads.length > 0) {
      return NextResponse.json({ 
        error: 'This file has already been uploaded recently. Please wait a few minutes before uploading again.' 
      }, { status: 400 })
    }
    
    console.log('Received teacherName:', teacherName)
    console.log('Received grade:', grade)
    console.log('Received class:', className)
    console.log('Received subject:', subject)
    console.log('FormData entries:')
    const entries = Array.from(formData.entries())
    for (const [key, value] of entries) {
      console.log(`${key}:`, value)
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Invalid file type. Please upload an Excel or CSV file.' }, { status: 400 })
    }

    // Read and parse the file based on its type
    let headers: string[] = []
    let dataRows: any[][] = []
    
    if (file.name.endsWith('.csv')) {
      // Handle CSV files
      const fileContent = await file.text()
      console.log('CSV file content preview:', fileContent.substring(0, 200))
      
      const lines = fileContent.split('\n').filter(line => line.trim())
      console.log('Number of CSV lines:', lines.length)
      
      if (lines.length === 0) {
        return NextResponse.json({ 
          error: 'File is empty or could not be read properly' 
        }, { status: 400 })
      }
      
      headers = lines[0].split(',').map(h => h.trim())
      console.log('CSV Headers found:', headers)
      
      // Parse data rows
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        if (values.length >= 2) {
          dataRows.push(values)
        }
      }
    } else {
      // Handle Excel files (.xlsx, .xls)
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      
      // Get the first sheet
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      
      // Convert to JSON to get headers and data
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      console.log('Excel data preview:', jsonData.slice(0, 3))
      
      if (jsonData.length === 0) {
        return NextResponse.json({ 
          error: 'File is empty or could not be read properly' 
        }, { status: 400 })
      }
      
      headers = (jsonData[0] as any[]).map((h: any) => String(h).trim())
      console.log('Excel Headers found:', headers)
      
      // Get data rows (skip header row)
      dataRows = jsonData.slice(1).filter((row: any) => (row as any[]).length >= 2) as any[][]
    }
    
    // Check if it's the expected format - support files with Math Grade and/or Reading Grade columns
    const hasStudentId = headers.includes('Student_ID')
    const hasStudentName = headers.includes('StudentName')
    const hasMathGrade = headers.includes('Math Grade')
    const hasReadingGrade = headers.includes('Reading Grade')
    const hasScore = headers.includes('Score')
    
    console.log('=== FILE ANALYSIS ===')
    console.log('File headers found:', headers)
    console.log('Selected subject:', subject)
    console.log('Has Math Grade:', hasMathGrade)
    console.log('Has Reading Grade:', hasReadingGrade)
    console.log('Math Grade index:', headers.indexOf('Math Grade'))
    console.log('Reading Grade index:', headers.indexOf('Reading Grade'))
    
    if (!hasStudentId && !hasStudentName) {
      return NextResponse.json({ 
        error: `Invalid file format. Need either 'Student_ID' or 'StudentName' column. Found columns: ${headers.join(', ')}` 
      }, { status: 400 })
    }
    
    // Check if file has both Math and Reading columns - if so, process both automatically
    const hasBothSubjects = hasMathGrade && hasReadingGrade
    
    if (hasBothSubjects) {
      console.log('=== DUAL SUBJECT DETECTED ===')
      console.log('File contains both Math Grade and Reading Grade columns')
      console.log('Will process both subjects automatically')
    }
    
    // Determine which score column(s) to use
    let subjectsToProcess: Array<{subject: string, columnIndex: number, columnName: string}> = []
    
    if (hasBothSubjects) {
      // Process both subjects automatically
      subjectsToProcess = [
        { subject: 'Math', columnIndex: headers.indexOf('Math Grade'), columnName: 'Math Grade' },
        { subject: 'Reading', columnIndex: headers.indexOf('Reading Grade'), columnName: 'Reading Grade' }
      ]
    } else {
      // Process only the selected subject
      let scoreColumnIndex = -1
      let scoreColumnName = ''
      
      if (subject === 'Math') {
        if (hasMathGrade) {
          scoreColumnIndex = headers.indexOf('Math Grade')
          scoreColumnName = 'Math Grade'
        } else if (hasScore) {
          scoreColumnIndex = headers.indexOf('Score')
          scoreColumnName = 'Score'
        }
      } else if (subject === 'Reading') {
        if (hasReadingGrade) {
          scoreColumnIndex = headers.indexOf('Reading Grade')
          scoreColumnName = 'Reading Grade'
        } else if (hasScore) {
          scoreColumnIndex = headers.indexOf('Score')
          scoreColumnName = 'Score'
        }
      }
      
      if (scoreColumnIndex === -1) {
        return NextResponse.json({ 
          error: `Invalid file format. For ${subject} subject, need either '${subject} Grade' or 'Score' column. Found columns: ${headers.join(', ')}` 
        }, { status: 400 })
      }
      
      subjectsToProcess = [{ subject, columnIndex: scoreColumnIndex, columnName: scoreColumnName }]
    }
    
    console.log(`=== COLUMN SELECTION ===`)
    console.log(`Subjects to process:`, subjectsToProcess.map(s => `${s.subject} (${s.columnName})`))
    console.log(`Available columns: ${headers.join(', ')}`)
    
    const studentIdIndex = headers.indexOf('Student_ID')
    const studentNameIndex = headers.indexOf('StudentName')
    
    // Process the data for all subjects
    const allProcessedStudents: Array<{
      studentId: string;
      studentName: string;
      subject: string;
      score: number;
      grade: string;
      className: string;
      weekNumber: number;
      uploadDate: string;
    }> = []
    const errorMessages: string[] = []
    
    for (const subjectInfo of subjectsToProcess) {
      console.log(`Processing ${subjectInfo.subject} scores...`)
      
      for (let i = 0; i < dataRows.length; i++) {
        const values = dataRows[i]
        
        if (values.length >= Math.max(studentIdIndex + 1, subjectInfo.columnIndex + 1)) {
          const studentId = studentIdIndex !== -1 ? values[studentIdIndex] : `student_${i + 1}`
          const studentName = studentNameIndex !== -1 ? values[studentNameIndex] : `Student ${studentId}`
          const score = parseFloat(values[subjectInfo.columnIndex])
          
          console.log(`Student ${studentId} (${subjectInfo.subject}): score ${score}`)
          
          if (isNaN(score)) {
            errorMessages.push(`Invalid ${subjectInfo.subject} score for Student ${studentId}: ${values[subjectInfo.columnIndex]}`)
          } else if (score < 0 || score > 100) {
            errorMessages.push(`${subjectInfo.subject} score out of range for Student ${studentId}: ${score} (must be 0-100)`)
          } else {
            allProcessedStudents.push({
              studentId,
              studentName,
              subject: subjectInfo.subject,
              score,
              grade: grade,
              className: className,
              weekNumber: getCurrentWeekNumber(),
              uploadDate: new Date().toISOString()
            })
          }
        } else {
          errorMessages.push(`Row ${i + 1}: Insufficient data for ${subjectInfo.subject} (expected at least ${Math.max(studentIdIndex + 1, subjectInfo.columnIndex + 1)} columns, found ${values.length})`)
        }
      }
    }

    // Calculate statistics
    const totalStudents = allProcessedStudents.length
    const averageScore = totalStudents > 0 
      ? parseFloat((allProcessedStudents.reduce((sum, student) => sum + student.score, 0) / totalStudents).toFixed(1))
      : 0

    // Store the uploaded data
    const currentWeek = getCurrentWeekNumber()
    const weekLabel = getWeekLabel(currentWeek)
    
    const uploadRecord: any = {
      id: Date.now().toString(),
      teacherName: teacherName,
      uploadTime: new Date().toISOString(),
      weekNumber: currentWeek,
      weekLabel: weekLabel,
      totalStudents,
      averageScore: averageScore,
      grade: grade,
      className: className,
      subject: hasBothSubjects ? 'Both Math & Reading' : subject,
      students: allProcessedStudents,
      errors: errorMessages
    }
    
    // Add new upload to existing data
    uploadedData.push(uploadRecord)
    
    console.log('=== UPLOAD SUMMARY ===')
    console.log('New upload record:', uploadRecord)
    console.log('Total uploads after adding:', uploadedData.length)
    console.log('All uploads:', uploadedData.map(u => ({ id: u.id, subject: u.subject, grade: u.grade, className: u.className })))
    
    // Save to persistent storage
    await saveUploadedData(uploadedData)
    console.log('Data saved to persistent storage successfully')

    return NextResponse.json({
      success: true,
      processedCount: totalStudents,
      averageScore: averageScore,
      errors: errorMessages,
      unmatchedStudents: [], // No unmatched students in this simple format
      message: `Successfully processed ${totalStudents} scores. Average: ${averageScore}%`,
      teacherName: teacherName,
      uploadTime: new Date().toISOString(),
      summary: {
        totalStudents,
        averageScore: averageScore,
        grade: grade,
        teacher: teacherName
      },
      uploadId: uploadRecord.id
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint to retrieve uploaded data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const weekFilter = searchParams.get('week')
    const userRole = searchParams.get('role')
    const userName = searchParams.get('user')
    
    const uploadedData = await loadUploadedData()
    
    // Filter by teacher role for privacy
    let roleFilteredData = uploadedData
    if (userRole === 'TEACHER' && userName) {
      // Teachers can only see their own uploads
      roleFilteredData = uploadedData.filter(upload => upload.teacherName === userName)
    }
    // LEADERs can see all uploads (no filtering needed)
    
    // Filter by week if specified
    let filteredData = roleFilteredData
    if (weekFilter) {
      const weekNumber = parseInt(weekFilter)
      filteredData = roleFilteredData.filter(upload => upload.weekNumber === weekNumber)
    }
    
    // Get unique weeks for filtering (based on role-filtered data)
    const uniqueWeeks = [...new Set(roleFilteredData.map(upload => upload.weekNumber))].sort()
    const weekOptions = uniqueWeeks.map(week => ({
      weekNumber: week,
      label: getWeekLabel(week),
      uploadCount: roleFilteredData.filter(upload => upload.weekNumber === week).length
    }))
    
    return NextResponse.json({
      uploads: filteredData,
      totalUploads: filteredData.length,
      allUploads: roleFilteredData,
      totalAllUploads: roleFilteredData.length,
      weekOptions: weekOptions,
      currentWeek: getCurrentWeekNumber(),
      userRole: userRole,
      userName: userName
    })
  } catch (error) {
    console.error('Error loading uploaded data:', error)
    return NextResponse.json({
      uploads: [],
      totalUploads: 0,
      allUploads: [],
      totalAllUploads: 0,
      weekOptions: [],
      currentWeek: getCurrentWeekNumber()
    })
  }
}

// DELETE endpoint to clear all uploaded data or delete specific upload
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const uploadId = searchParams.get('id')
    
    if (uploadId) {
      // Delete specific upload by ID
      console.log(`Deleting upload with ID: ${uploadId}`)
      const uploadedData = await loadUploadedData()
      const filteredData = uploadedData.filter(upload => upload.id !== uploadId)
      
      if (filteredData.length === uploadedData.length) {
        return NextResponse.json({ error: 'Upload not found' }, { status: 404 })
      }
      
      await saveUploadedData(filteredData)
      console.log(`Upload ${uploadId} deleted successfully`)
      return NextResponse.json({ success: true, message: 'Upload deleted successfully' })
    } else {
      // Clear all uploaded data
      console.log('Clearing all uploaded data...')
      await saveUploadedData([]) // Save empty array to clear data
      console.log('All uploaded data cleared')
      return NextResponse.json({ success: true, message: 'All data cleared' })
    }
  } catch (error) {
    console.error('Error deleting data:', error)
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 })
  }
}
