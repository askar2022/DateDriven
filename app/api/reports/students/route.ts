import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

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
  if (score >= 85) return "green"
  if (score >= 75) return "orange"
  if (score >= 65) return "red"
  return "gray"
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const grade = searchParams.get('grade')
    const className = searchParams.get('class')
    const subject = searchParams.get('subject')
    const minScore = searchParams.get('minScore')
    const week = searchParams.get('week')
    const userRole = searchParams.get('role')
    const userName = searchParams.get('user')
    const teacherFilter = searchParams.get('teacherFilter')

    // Load actual uploaded data
    let uploads = await loadUploadedData()
    
    // Filter by teacher role for privacy
    if (userRole === 'TEACHER' && userName) {
      // Teachers can only see their own uploads
      uploads = uploads.filter(upload => upload.teacherName === userName)
    }
    // LEADERs can see all uploads (no filtering needed) - they get data from all teachers
    
    // Additional teacher filter for leaders to view specific classes
    if (userRole === 'LEADER' && teacherFilter) {
      uploads = uploads.filter(upload => upload.teacherName === teacherFilter)
    }
    
    if (uploads.length === 0) {
      return NextResponse.json({
        students: [],
        summary: {
          totalStudents: 0,
          averageScore: 0,
          aboveThreshold: 0,
          belowThreshold: 0
        },
        filters: {
          grade: null,
          className: null,
          subject: null,
          minScore: null
        }
      })
    }

    // For LEADERS, process all uploads to get all students from all teachers
    // For TEACHERS, get only their specific upload
    let students: any[] = []
    let targetUpload = uploads[0] // Default for response metadata
    
    if (userRole === 'LEADER') {
      // Leaders see all students from all uploads
      uploads.forEach(upload => {
        upload.students.forEach(student => {
          students.push({
            ...student,
            teacherName: upload.teacherName // Add teacher info to each student
          })
        })
      })
    } else {
      // Teachers see only their upload
      if (week) {
        const weekNum = parseInt(week)
        const weekUpload = uploads.find(u => u.weekNumber === weekNum)
        if (weekUpload) targetUpload = weekUpload
      }
      students = targetUpload.students || []
    }

    // Apply filters
    if (grade) {
      students = students.filter(s => s.grade === grade)
    }
    if (className) {
      students = students.filter(s => s.className === className)
    }
    if (subject && subject !== 'all') {
      students = students.filter(s => s.subject.toLowerCase() === subject.toLowerCase())
    }

    // Group by student ID to show both Math and Reading scores
    const studentMap = new Map()
    
    students.forEach(student => {
      const key = student.studentId
      if (!studentMap.has(key)) {
        studentMap.set(key, {
          studentId: student.studentId,
          studentName: student.studentName,
          grade: student.grade,
          className: student.className,
          weekNumber: student.weekNumber,
          teacherName: student.teacherName, // Include teacher name
          scores: {}
        })
      }
      
      const studentData = studentMap.get(key)
      studentData.scores[student.subject.toLowerCase()] = {
        score: student.score,
        tier: getTierLabel(student.score),
        tierColor: getTierColor(student.score)
      }
    })

    // Convert to array and calculate overall scores
    const processedStudents = Array.from(studentMap.values()).map(student => {
      const mathScore = student.scores.math?.score || null
      const readingScore = student.scores.reading?.score || null
      
      let overallScore: number | null = null
      if (mathScore !== null && readingScore !== null) {
        overallScore = (mathScore + readingScore) / 2
      } else if (mathScore !== null) {
        overallScore = mathScore
      } else if (readingScore !== null) {
        overallScore = readingScore
      }

      return {
        ...student,
        mathScore, // Add flat properties for easier access
        readingScore, // Add flat properties for easier access
        overallScore,
        overallTier: overallScore ? getTierLabel(overallScore) : null,
        overallTierColor: overallScore ? getTierColor(overallScore) : null
      }
    })

    // Apply minimum score filter
    let filteredStudents = processedStudents
    if (minScore) {
      const threshold = parseFloat(minScore)
      filteredStudents = processedStudents.filter(student => 
        student.overallScore !== null && student.overallScore >= threshold
      )
    }

    // Sort by overall score (highest first), then by student ID
    filteredStudents.sort((a, b) => {
      if (a.overallScore !== null && b.overallScore !== null) {
        return b.overallScore - a.overallScore
      }
      if (a.overallScore !== null) return -1
      if (b.overallScore !== null) return 1
      return a.studentId.localeCompare(b.studentId)
    })

    // Calculate summary statistics
    const validScores = processedStudents.filter(s => s.overallScore !== null)
    const averageScore = validScores.length > 0 
      ? validScores.reduce((sum, s) => sum + s.overallScore!, 0) / validScores.length 
      : 0

    const threshold = minScore ? parseFloat(minScore) : 85
    const aboveThreshold = validScores.filter(s => s.overallScore! >= threshold).length
    const belowThreshold = validScores.filter(s => s.overallScore! < threshold).length

    return NextResponse.json({
      students: filteredStudents,
      summary: {
        totalStudents: processedStudents.length,
        averageScore: Math.round(averageScore * 10) / 10,
        aboveThreshold,
        belowThreshold,
        threshold
      },
      filters: {
        grade: userRole === 'LEADER' ? 'All Grades' : targetUpload.grade,
        className: userRole === 'LEADER' ? 'All Classes' : targetUpload.className,
        subject: subject || 'all',
        teacher: teacherFilter || 'all',
        minScore: minScore || null,
        week: targetUpload.weekNumber,
        weekLabel: targetUpload.weekLabel
      },
      upload: {
        teacherName: targetUpload.teacherName,
        uploadTime: targetUpload.uploadTime,
        weekLabel: targetUpload.weekLabel
      }
    })
  } catch (error) {
    console.error('Error fetching student data:', error)
    return NextResponse.json({ error: 'Failed to fetch student data' }, { status: 500 })
  }
}
