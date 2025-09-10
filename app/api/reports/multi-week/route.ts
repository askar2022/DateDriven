import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
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
    return uploads.map(upload => ({
      id: upload.id,
      teacherName: upload.teacher_name,
      uploadTime: upload.upload_time,
      weekNumber: upload.week_number,
      weekLabel: upload.week_label,
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
        uploadDate: upload.upload_time
      })),
      errors: []
    }))
  } catch (error) {
    console.error('Error loading data from Supabase:', error)
    // Return empty array if Supabase fails
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacher = searchParams.get('teacher')
    
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher parameter is required' }, { status: 400 })
    }

    const uploads = await loadUploadedData()
    
    // Filter by teacher
    const teacherUploads = uploads.filter(upload => upload.teacherName === teacher)
    
    if (teacherUploads.length === 0) {
      return NextResponse.json({ 
        students: [],
        weeks: [],
        message: 'No data found for this teacher'
      })
    }

    // Group students by student ID and collect their scores across weeks
    const studentMap = new Map<string, any>()
    
    teacherUploads.forEach(upload => {
      upload.students.forEach(student => {
        const key = student.studentId
        if (!studentMap.has(key)) {
          studentMap.set(key, {
            studentId: student.studentId,
            studentName: student.studentName,
            grade: student.grade,
            className: student.className,
            weeks: []
          })
        }
        
        const studentData = studentMap.get(key)
        const weekData = studentData.weeks.find((w: any) => w.weekNumber === upload.weekNumber)
        
        if (!weekData) {
          studentData.weeks.push({
            weekNumber: upload.weekNumber,
            weekLabel: upload.weekLabel,
            mathScore: null,
            readingScore: null,
            overallScore: null,
            tier: 'Gray',
            tierColor: '#6B7280'
          })
        }
        
        const weekDataToUpdate = studentData.weeks.find((w: any) => w.weekNumber === upload.weekNumber)
        
        if (student.subject === 'Math') {
          weekDataToUpdate.mathScore = student.score
        } else if (student.subject === 'Reading') {
          weekDataToUpdate.readingScore = student.score
        }
      })
    })

    // Calculate overall scores and tiers for each week
    studentMap.forEach(student => {
      student.weeks.forEach((week: any) => {
        if (week.mathScore !== null && week.readingScore !== null) {
          week.overallScore = (week.mathScore + week.readingScore) / 2
          
          if (week.overallScore >= 85) {
            week.tier = 'Green'
            week.tierColor = '#10B981'
          } else if (week.overallScore >= 75) {
            week.tier = 'Orange'
            week.tierColor = '#F59E0B'
          } else if (week.overallScore >= 65) {
            week.tier = 'Red'
            week.tierColor = '#EF4444'
          } else {
            week.tier = 'Gray'
            week.tierColor = '#6B7280'
          }
        }
      })
      
      // Calculate growth rate
      const sortedWeeks = student.weeks.sort((a: any, b: any) => a.weekNumber - b.weekNumber)
      if (sortedWeeks.length >= 2) {
        const firstWeek = sortedWeeks[0]
        const lastWeek = sortedWeeks[sortedWeeks.length - 1]
        
        if (firstWeek.overallScore !== null && lastWeek.overallScore !== null) {
          const growth = lastWeek.overallScore - firstWeek.overallScore
          student.growthRate = growth > 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`
        }
      }
    })

    // Get unique weeks
    const weeks = [...new Set(teacherUploads.map(upload => ({
      weekNumber: upload.weekNumber,
      weekLabel: upload.weekLabel
    })))].sort((a, b) => a.weekNumber - b.weekNumber)

    return NextResponse.json({
      students: Array.from(studentMap.values()),
      weeks,
      teacher: teacherUploads[0].teacherName,
      grade: teacherUploads[0].grade,
      className: teacherUploads[0].className
    })

  } catch (error) {
    console.error('Multi-week API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
