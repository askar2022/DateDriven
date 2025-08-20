import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Subject } from '@prisma/client'
import { startOfWeek, subWeeks, format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    // Query params: ?subject=MATH&grade=5
    const subjectFilter = searchParams.get('subject')
    const grade = searchParams.get('grade')

    const currentWeek = startOfWeek(new Date(), { weekStartsOn: 1 })

    // Safe enum conversion
    const subjectEnum =
      subjectFilter && Object.values(Subject).includes(subjectFilter as Subject)
        ? (subjectFilter as Subject)
        : undefined

    // Conditional filters
    const gradeFilter =
      grade && grade !== 'all'
        ? { classroom: { is: { gradeLevelId: parseInt(grade) } } }
        : undefined

    const subjectFilterObj = subjectEnum ? { subject: subjectEnum } : undefined

    // Summary statistics
    const totalStudents = await prisma.student.count({
      where: {
        active: true,
        ...(grade && grade !== 'all' ? { gradeLevelId: parseInt(grade) } : {}),
      },
    })

    // 1️⃣ Weekly count
    const weeklyAssessments = await prisma.assessment.count({
      where: {
        weekStart: currentWeek,
        ...(gradeFilter ?? {}),
        ...(subjectFilterObj ?? {}),
      },
    })

    // 2️⃣ Last week count
    const lastWeekAssessments = await prisma.assessment.count({
      where: {
        weekStart: subWeeks(currentWeek, 1),
        ...(gradeFilter ?? {}),
        ...(subjectFilterObj ?? {}),
      },
    })

    // 3️⃣ Group by Subject (for charts by subject)
    const bySubject = await prisma.assessment.groupBy({
      by: ['subject'],
      where: {
        weekStart: currentWeek,
        ...(gradeFilter ?? {}),
      },
      _count: { subject: true },
    })

    // 4️⃣ Group by Grade Level (for charts by grade)
    const byGrade = await prisma.assessment.groupBy({
      by: ['classroomId'],
      where: {
        weekStart: currentWeek,
        ...(subjectFilterObj ?? {}),
      },
      _count: { classroomId: true },
    })

    // Average score calculation
    const avgScoreResult = await prisma.score.aggregate({
      _avg: {
        rawScore: true,
      },
      where: {
        assessment: {
          weekStart: currentWeek,
          ...(gradeFilter ?? {}),
          ...(subjectFilterObj ?? {}),
        },
      },
    })

    const averageScore = Number(avgScoreResult._avg.rawScore) || 0

    const dashboardData = {
      summary: {
        totalStudents,
        weeklyAssessments,
        lastWeekAssessments,
        averageScore,
      },
      bySubject, // e.g. [{ subject: "MATH", _count: { subject: 5 } }]
      byGrade,   // e.g. [{ classroomId: 1, _count: { classroomId: 10 } }]
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const subjectFilter: string | null = body.subject || null
    const grade: string | null = body.grade || null

    const currentWeek = startOfWeek(new Date(), { weekStartsOn: 1 })

    // Safe enum conversion
    const subjectEnum =
      subjectFilter && Object.values(Subject).includes(subjectFilter as Subject)
        ? (subjectFilter as Subject)
        : undefined

    // Conditional filters
    const gradeFilter =
      grade && grade !== 'all'
        ? { classroom: { is: { gradeLevelId: parseInt(grade) } } }
        : undefined

    const subjectFilterObj = subjectEnum ? { subject: subjectEnum } : undefined

    // Summary statistics
    const totalStudents = await prisma.student.count({
      where: {
        active: true,
        ...(grade && grade !== 'all' ? { gradeLevelId: parseInt(grade) } : {}),
      },
    })

    const weeklyAssessments = await prisma.assessment.count({
      where: {
        weekStart: currentWeek,
        ...(gradeFilter ?? {}),
        ...(subjectFilterObj ?? {}),
      },
    })

    const dashboardData = {
      summary: {
        totalStudents,
        weeklyAssessments,
      },
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
