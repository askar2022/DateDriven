import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfWeek, subWeeks, format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    // Temporary: Skip authentication for development
    const user = await getCurrentUser()
    
    // If no user found (no auth configured), use mock user for development
    const mockUser = user || {
      id: 'mock-user-id',
      email: 'demo@school.edu',
      name: 'Demo User',
      role: 'LEADER'
    }
    
    if (!mockUser || mockUser.role !== 'LEADER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const weekParam = searchParams.get('week')
    
    if (!weekParam) {
      return NextResponse.json({ error: 'Week parameter required' }, { status: 400 })
    }

    const weekStart = startOfWeek(new Date(weekParam), { weekStartsOn: 1 })

    // Summary statistics
    const totalStudents = await prisma.student.count({
      where: { active: true },
    })

    const totalAssessments = await prisma.assessment.count({
      where: { weekStart },
    })

    const schoolAverage = await prisma.score.aggregate({
      _avg: { rawScore: true },
      where: {
        assessment: { weekStart },
      },
    })

    // Tier distribution by subject
    const tierDistribution = await prisma.weeklyAggregate.groupBy({
      by: ['subject'],
      _sum: {
        greenCount: true,
        orangeCount: true,
        redCount: true,
        grayCount: true,
        total: true,
      },
      where: { weekStart },
    })

    const formattedTierDistribution = tierDistribution.map(item => ({
      subject: item.subject,
      green: item._sum.greenCount || 0,
      orange: item._sum.orangeCount || 0,
      red: item._sum.redCount || 0,
      gray: item._sum.grayCount || 0,
      total: item._sum.total || 0,
    }))

    // Grade level breakdown
    const gradeLevels = await prisma.gradeLevel.findMany({
      include: {
        classrooms: true,
      },
    })

    const gradeBreakdown = await Promise.all(
      gradeLevels.map(async (grade) => {
        const mathAvg = await prisma.score.aggregate({
          _avg: { rawScore: true },
          where: {
            assessment: {
              weekStart,
              subject: 'MATH',
              classroom: { gradeLevelId: grade.id },
            },
          },
        })

        const readingAvg = await prisma.score.aggregate({
          _avg: { rawScore: true },
          where: {
            assessment: {
              weekStart,
              subject: 'READING',
              classroom: { gradeLevelId: grade.id },
            },
          },
        })

        const studentCount = await prisma.student.count({
          where: {
            gradeLevelId: grade.id,
            active: true,
          },
        })

        return {
          grade: grade.name,
          mathAverage: Number(mathAvg._avg.rawScore) || 0,
          readingAverage: Number(readingAvg._avg.rawScore) || 0,
          studentCount,
        }
      })
    )

    // 8-week trends
    const trends: { week: string; average: number }[] = []
    for (let i = 7; i >= 0; i--) {
      const trendWeekStart = subWeeks(weekStart, i)
      
      const weekAvg = await prisma.score.aggregate({
        _avg: { rawScore: true },
        where: {
          assessment: { weekStart: trendWeekStart },
        },
      })

      trends.push({
        week: format(trendWeekStart, 'yyyy-MM-dd'),
        average: Number(weekAvg._avg.rawScore) || 0,
      })
    }

    const reportData = {
      weekStart: format(weekStart, 'yyyy-MM-dd'),
      summary: {
        totalStudents,
        totalAssessments,
        schoolAverage: Number(schoolAverage._avg.rawScore) || 0,
      },
      tierDistribution: formattedTierDistribution,
      gradeBreakdown,
      trends,
    }

    return NextResponse.json(reportData)

  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
