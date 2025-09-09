import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface Upload {
  id: string
  teacherName: string
  uploadTime: string
  weekNumber: number
  weekLabel: string
  totalStudents: number
  averageScore: number
  grade: string
  className: string
  subject: string
  students: StudentScore[]
  errors: string[]
}

interface StudentScore {
  studentId: string
  studentName: string
  subject: string
  score: number
  grade: string
  className: string
  weekNumber: number
  uploadDate: string
}

async function loadUploadedData(): Promise<Upload[]> {
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
      ],
      "errors": []
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
      ],
      "errors": []
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
      ],
      "errors": []
    }
  ]
}

function getTierLabel(score: number): string {
  if (score >= 85) return "Green"
  if (score >= 75) return "Orange"
  if (score >= 65) return "Red"
  return "Gray"
}

function getTierColor(score: number): string {
  if (score >= 85) return "#10b981" // green
  if (score >= 75) return "#f59e0b" // orange
  if (score >= 65) return "#ef4444" // red
  return "#6b7280" // gray
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherName = searchParams.get('teacher')
    const userRole = searchParams.get('role')
    const userName = searchParams.get('user')

    if (!teacherName) {
      return NextResponse.json({ error: 'Teacher name is required' }, { status: 400 })
    }

    let uploads = await loadUploadedData()
    
    // Filter by teacher role for privacy
    if (userRole === 'TEACHER' && userName) {
      uploads = uploads.filter(upload => upload.teacherName === userName)
    }
    
    // Filter by specific teacher
    uploads = uploads.filter(upload => upload.teacherName === teacherName)
    
    if (uploads.length === 0) {
      return NextResponse.json({ error: 'No data found for this teacher' }, { status: 404 })
    }

    // Sort by week number
    uploads.sort((a, b) => a.weekNumber - b.weekNumber)

    // Group students by studentId across all weeks
    const studentMap = new Map<string, any>()

    uploads.forEach(upload => {
      upload.students.forEach(student => {
        const key = student.studentId
        if (!studentMap.has(key)) {
          studentMap.set(key, {
            studentId: student.studentId,
            studentName: student.studentName,
            grade: student.grade,
            className: student.className,
            weeks: {}
          })
        }

        const studentData = studentMap.get(key)
        if (!studentData.weeks[upload.weekNumber]) {
          studentData.weeks[upload.weekNumber] = {
            weekNumber: upload.weekNumber,
            weekLabel: upload.weekLabel,
            scores: {}
          }
        }

        // Add subject score
        studentData.weeks[upload.weekNumber].scores[student.subject.toLowerCase()] = {
          score: student.score,
          tier: getTierLabel(student.score),
          tierColor: getTierColor(student.score)
        }
      })
    })

    // Calculate overall scores and growth rates for each week
    studentMap.forEach((student, studentId) => {
      const weekNumbers = Object.keys(student.weeks).map(Number).sort((a, b) => a - b)
      
      weekNumbers.forEach((weekNumber, index) => {
        const week = student.weeks[weekNumber]
        const mathScore = week.scores.math?.score || 0
        const readingScore = week.scores.reading?.score || 0
        const overallScore = mathScore && readingScore ? Math.round((mathScore + readingScore) / 2) : 0
        
        week.overall = {
          score: overallScore,
          tier: getTierLabel(overallScore),
          tierColor: getTierColor(overallScore)
        }

        // Calculate growth rate compared to previous week
        if (index > 0) {
          const prevWeekNumber = weekNumbers[index - 1]
          const prevWeek = student.weeks[prevWeekNumber]
          const prevOverallScore = prevWeek.overall?.score || 0
          
          const growthRate = overallScore - prevOverallScore
          week.growth = {
            rate: growthRate,
            percentage: prevOverallScore > 0 ? Math.round(((growthRate / prevOverallScore) * 100) * 10) / 10 : 0,
            trend: growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'stable'
          }
        } else {
          // First week - no growth rate available
          week.growth = {
            rate: 0,
            percentage: 0,
            trend: 'baseline'
          }
        }
      })
    })

    // Convert to array and sort by student name
    const students = Array.from(studentMap.values()).sort((a, b) => 
      a.studentName.localeCompare(b.studentName)
    )

    // Get week information
    const weeks = uploads.map(upload => ({
      weekNumber: upload.weekNumber,
      weekLabel: upload.weekLabel
    }))

    // Remove duplicates and sort
    const uniqueWeeks = weeks.filter((week, index, self) => 
      index === self.findIndex(w => w.weekNumber === week.weekNumber)
    ).sort((a, b) => a.weekNumber - b.weekNumber)

    return NextResponse.json({
      teacher: {
        name: teacherName,
        grade: uploads[0].grade,
        className: uploads[0].className
      },
      weeks: uniqueWeeks,
      students: students,
      totalStudents: students.length
    })

  } catch (error) {
    console.error('Error in multi-week API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
