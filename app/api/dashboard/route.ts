import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfWeek, subWeeks, format } from 'date-fns'
import { Classroom, Subject } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const grade = searchParams.get('grade')
    const subject = searchParams.get('subject')

    // Build filters
    const gradeFilter = grade && grade !== 'all' ? { gradeLevelId: parseInt(grade) } : {}
    const subjectFilter = subject && subject !== 'all' ? { subject } : {}

    // Get current week and last 8 weeks for trends
    const currentWeek = startOfWeek(new Date(), { weekStartsOn: 1 })
    const eightWeeksAgo = subWeeks(currentWeek, 7)

    // Summary statistics
    const totalStudents = await prisma.student.count({
      where: {
        active: true,
        ...gradeFilter,
      },
    })

    const weeklyAssessments = await prisma.assessment.count({
      where: {
        weekStart: currentWeek,
        subject: subjectFilter as Subject,
        classroom: grade
          ? { is: { gradeLevelId: parseInt(grade) } }
          : undefined,
      },
    })

    // Average score calculation
    const avgScoreResult = await prisma.score.aggregate({
      _avg: {
        rawScore: true,
      },
      where: {
        assessment: {
          weekStart: currentWeek,
          subject: subjectFilter as Subject,
          classroom: grade
            ? { is: { gradeLevelId: parseInt(grade) } }
            : undefined,
        },
      },
    })

    // Previous week average for improvement calculation
    const prevWeekAvg = await prisma.score.aggregate({
      _avg: {
        rawScore: true,
      },
      where: {
        assessment: {
          weekStart: subWeeks(currentWeek, 1),
          ...subjectFilter,
          classroom: grade ? { gradeLevelId: parseInt(grade) } : {},
        },
      },
    })

    const averageScore = Number(avgScoreResult._avg.rawScore) || 0
    const previousAverage = Number(prevWeekAvg._avg.rawScore) || 0
    const improvementRate = previousAverage > 0 
      ? ((averageScore - previousAverage) / previousAverage) * 100 
      : 0

    // Tier distribution by subject
    const tierDistribution = await prisma.weeklyAggregate.groupBy({
      by: ['subject'],
      _sum: {
        greenCount: true,
        orangeCount: true,
        redCount: true,
        grayCount: true,
      },
      where: {
        weekStart: currentWeek,
        ...gradeFilter,
        ...subjectFilter,
      },
    })

    const formattedTierDistribution = tierDistribution.map((item: any) => ({
      subject: item.subject,
      green: item._sum.greenCount || 0,
      orange: item._sum.orangeCount || 0,
      red: item._sum.redCount || 0,
      gray: item._sum.grayCount || 0,
    }))

    // Weekly trends for the last 8 weeks
    const weeklyTrends = []
    for (let i = 7; i >= 0; i--) {
      const weekStart = subWeeks(currentWeek, i)
      
      const mathAvg = await prisma.score.aggregate({
        _avg: { rawScore: true },
        where: {
          assessment: {
            weekStart,
            subject: 'MATH',
            classroom: grade ? { gradeLevelId: parseInt(grade) } : {},
          },
        },
      })

      const readingAvg = await prisma.score.aggregate({
        _avg: { rawScore: true },
        where: {
          assessment: {
            weekStart,
            subject: 'READING',
            classroom: grade ? { gradeLevelId: parseInt(grade) } : {},
          },
        },
      })

      weeklyTrends.push({
        week: format(weekStart, 'yyyy-MM-dd'),
        math: Number(mathAvg._avg.rawScore) || 0,
        reading: Number(readingAvg._avg.rawScore) || 0,
      })
    }

    // Classroom performance
    const classrooms = await prisma.classroom.findMany({
      where: gradeFilter,
      include: {
        gradeLevel: true,
        _count: {
          select: {
            assessments: {
              where: {
                weekStart: currentWeek,
              },
            },
          },
        },
      },
    })

    const classroomPerformance = await Promise.all(
      classrooms.map(async (classroom) => {
        const mathAvg = await prisma.score.aggregate({
          _avg: { rawScore: true },
          where: {
            assessment: {
              classroomId: classroom.id,
              subject: 'MATH',
              weekStart: currentWeek,
            },
          },
        })

        const readingAvg = await prisma.score.aggregate({
          _avg: { rawScore: true },
          where: {
            assessment: {
              classroomId: classroom.id,
              subject: 'READING',
              weekStart: currentWeek,
            },
          },
        })

        const studentCount = await prisma.student.count({
          where: {
            gradeLevelId: classroom.gradeLevelId,
            active: true,
          },
        })

        return {
          classroom: classroom.code,
          grade: classroom.gradeLevel.name,
          mathAverage: Number(mathAvg._avg.rawScore) || 0,
          readingAverage: Number(readingAvg._avg.rawScore) || 0,
          studentCount,
        }
      })
    )

    const dashboardData = {
      summary: {
        totalStudents,
        weeklyAssessments,
        averageScore,
        improvementRate,
      },
      tierDistribution: formattedTierDistribution,
      weeklyTrends,
      classroomPerformance,
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
