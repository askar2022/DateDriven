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

async function loadUploadedData(teacher: string): Promise<Upload[]> {
  try {
    console.log('Supabase client:', !!supabase)
    console.log('Environment check:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing',
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing'
    })
    
    if (!supabase) {
      console.error('Supabase not configured')
      return []
    }
    
    // First get the teacher's grade and class from uploads table
    console.log(`Looking for teacher: "${teacher}"`)
    const { data: teacherInfo, error: teacherError } = await supabase
      .from('uploads')
      .select('grade, class_name')
      .eq('teacher_name', teacher)
      .limit(1)

    console.log('Teacher query result:', { teacherInfo, teacherError })

    if (teacherError || !teacherInfo || teacherInfo.length === 0) {
      console.error('No teacher info found:', teacherError)
      return []
    }

    const { grade, class_name: className } = teacherInfo[0]
    console.log(`Found teacher ${teacher} info: grade=${grade}, class=${className}`)
    
    // Get students data for this teacher's grade and class
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .eq('grade', grade)
      .eq('class_name', className)
      .order('week_number', { ascending: true })

    if (studentsError) {
      console.error('Supabase students fetch error:', studentsError)
      return []
    }

    console.log(`Found ${studentsData.length} student records for ${teacher}`)

    // Get uploads data for context
    const { data: uploadsData, error: uploadsError } = await supabase
      .from('uploads')
      .select('*')
      .eq('teacher_name', teacher)
      .eq('grade', grade)
      .eq('class_name', className)
      .order('week_number', { ascending: true })

    if (uploadsError) {
      console.error('Supabase uploads fetch error:', uploadsError)
      return []
    }

    console.log(`Found ${uploadsData.length} upload records for ${teacher}`)

    // Group students by week and format data
    const weekMap = new Map()
    
    // Initialize weeks from uploads data
    uploadsData.forEach(upload => {
      weekMap.set(upload.week_number, {
        id: upload.id,
        teacherName: upload.teacher_name,
        weekNumber: upload.week_number,
        weekLabel: upload.week_label,
        grade: upload.grade,
        className: upload.class_name,
        subject: upload.subject,
        totalStudents: upload.total_students,
        averageScore: upload.average_score,
        uploadTime: upload.upload_time,
        students: []
      })
    })
    
    // Add students to their respective weeks
    studentsData.forEach(student => {
      const week = weekMap.get(student.week_number)
      if (week) {
        week.students.push({
          studentId: student.student_id,
          studentName: student.student_name,
          subject: student.subject,
          score: student.score,
          grade: student.grade,
          className: student.class_name,
          weekNumber: student.week_number,
          uploadDate: week.uploadTime
        })
      }
    })

    return Array.from(weekMap.values())
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

    const uploads = await loadUploadedData(teacher)
    console.log('Multi-week API - Loaded uploads:', uploads.length)
    console.log('Multi-week API - All uploads:', uploads.map(u => ({ teacher: u.teacherName, week: u.weekNumber, students: u.students?.length })))
    
    // Filter by teacher
    const teacherUploads = uploads.filter(upload => upload.teacherName === teacher)
    console.log('Multi-week API - Filtered for teacher:', teacher, 'uploads:', teacherUploads.length)
    console.log('Multi-week API - Teacher uploads:', teacherUploads.map(u => ({ week: u.weekNumber, students: u.students?.length })))
    
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
          
          // Calculate tier based on score
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
      
      // Calculate growth rate for each week and update tiers
      const sortedWeeks = student.weeks.sort((a: any, b: any) => a.weekNumber - b.weekNumber)
      
      // Keep standard tier calculation - no dynamic promotion
      
      // Add growth rate to each week
      sortedWeeks.forEach((week: any, index: number) => {
        if (index === 0) {
          // First week has no previous week to compare to
          week.growthRate = 'N/A'
        } else {
          const previousWeek = sortedWeeks[index - 1]
          if (week.overallScore !== null && previousWeek.overallScore !== null) {
            const growth = week.overallScore - previousWeek.overallScore
            week.growthRate = growth > 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`
          } else {
            week.growthRate = 'N/A'
          }
        }
      })
      
      // Calculate overall growth rate (first to last week)
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

    const response = {
      students: Array.from(studentMap.values()),
      weeks,
      teacher: teacherUploads[0].teacherName,
      grade: teacherUploads[0].grade,
      className: teacherUploads[0].className
    }
    
    console.log('Multi-week API - Final response for', teacher, ':', JSON.stringify(response, null, 2))
    console.log('Multi-week API - Student details:', response.students.map(s => ({
      name: s.studentName,
      weeks: s.weeks.map(w => ({
        week: w.weekNumber,
        math: w.mathScore,
        reading: w.readingScore,
        overall: w.overallScore
      }))
    })))
    
    return NextResponse.json(response)

  } catch (error) {
    console.error('Multi-week API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
