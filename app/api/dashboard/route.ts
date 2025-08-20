import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering to prevent build-time data collection
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // Return mock data for now to prevent build failures
    const dashboardData = {
      summary: {
        totalStudents: 156,
        weeklyAssessments: 24,
        lastWeekAssessments: 22,
        averageScore: 78.4,
        growthRate: 12.3
      },
      bySubject: [
        { subject: 'MATH', count: 12 },
        { subject: 'READING', count: 12 }
      ],
      byGrade: [
        { grade: 'Grade 3', count: 8 },
        { grade: 'Grade 4', count: 8 },
        { grade: 'Grade 5', count: 8 }
      ],
      recentActivity: [
        { type: 'upload', message: 'Weekly scores uploaded for Grade 4', time: '2 hours ago' },
        { type: 'assessment', message: 'Math assessment completed for Grade 3', time: '4 hours ago' }
      ]
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
