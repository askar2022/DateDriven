import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Force dynamic rendering to prevent build-time data collection
export const dynamic = 'force-dynamic'
export const revalidate = 0

function calculateTierDistribution(students: any[]) {
  const mathStudents = students.filter(s => s.subject === 'Math')
  const readingStudents = students.filter(s => s.subject === 'Reading')
  
  const calculateTiers = (studentList: any[]) => {
    const green = studentList.filter(s => s.score >= 85).length
    const orange = studentList.filter(s => s.score >= 75 && s.score < 85).length
    const red = studentList.filter(s => s.score >= 65 && s.score < 75).length
    const gray = studentList.filter(s => s.score < 65).length
    const total = studentList.length
    
    return { green, orange, red, gray, total }
  }
  
  return [
    {
      subject: 'MATH',
      ...calculateTiers(mathStudents)
    },
    {
      subject: 'READING',
      ...calculateTiers(readingStudents)
    }
  ]
}

function calculateGradeBreakdown(students: any[]) {
  const gradeGroups = students.reduce((acc, student) => {
    const grade = student.grade
    if (!acc[grade]) {
      acc[grade] = { math: [], reading: [] }
    }
    if (student.subject === 'Math') {
      acc[grade].math.push(student.score)
    } else if (student.subject === 'Reading') {
      acc[grade].reading.push(student.score)
    }
    return acc
  }, {})
  
  return Object.entries(gradeGroups).map(([grade, data]: [string, any]) => {
    const mathAverage = data.math.length > 0 ? 
      Math.round((data.math.reduce((sum: number, score: number) => sum + score, 0) / data.math.length) * 10) / 10 : 0
    const readingAverage = data.reading.length > 0 ? 
      Math.round((data.reading.reduce((sum: number, score: number) => sum + score, 0) / data.reading.length) * 10) / 10 : 0
    const totalStudents = Math.max(data.math.length, data.reading.length)
    
    return {
      grade,
      mathAverage,
      readingAverage,
      totalStudents
    }
  })
}

function calculateTrends(uploads: any[]) {
  // Group uploads by week and calculate average scores
  const weekGroups = uploads.reduce((acc, upload) => {
    const week = upload.week_label
    if (!acc[week]) {
      acc[week] = []
    }
    acc[week].push(upload.average_score)
    return acc
  }, {})
  
  return Object.entries(weekGroups).map(([week, scores]: [string, any]) => ({
    week,
    average: Math.round((scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length) * 10) / 10
  })).sort((a, b) => a.week.localeCompare(b.week))
}

export async function GET(request: NextRequest) {
  try {
    console.log('Reports API - Starting data fetch...')
    
    // Get data from Supabase
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')

    console.log('Students query result:', { count: students?.length, error: studentsError })

    if (studentsError) {
      console.error('Error fetching students:', studentsError)
      return NextResponse.json({ error: 'Failed to fetch students data' }, { status: 500 })
    }

    const { data: uploads, error: uploadsError } = await supabase
      .from('uploads')
      .select('*')

    console.log('Uploads query result:', { count: uploads?.length, error: uploadsError })

    if (uploadsError) {
      console.error('Error fetching uploads:', uploadsError)
      return NextResponse.json({ error: 'Failed to fetch uploads data' }, { status: 500 })
    }

    // Calculate summary data
    console.log('Reports API - Students data:', students.length, 'records')
    console.log('Reports API - Uploads data:', uploads.length, 'records')
    
    const uniqueStudents = new Set(students.map(s => s.student_id)).size
    const totalAssessments = students.length
    const averageScore = students.length > 0 ? 
      students.reduce((sum, s) => sum + s.score, 0) / students.length : 0
      
    console.log('Reports API - Calculated summary:', {
      uniqueStudents,
      totalAssessments,
      averageScore
    })

    const reportData = {
      summary: {
        totalStudents: uniqueStudents,
        totalAssessments: totalAssessments,
        schoolAverage: Math.round(averageScore * 10) / 10
      },
      tierDistribution: calculateTierDistribution(students),
      gradeBreakdown: calculateGradeBreakdown(students),
      trends: calculateTrends(uploads)
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
