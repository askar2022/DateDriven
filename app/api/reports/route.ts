import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering to prevent build-time data collection
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // Return mock data for now to prevent build failures
    const reportData = {
      summary: {
        totalStudents: 156,
        totalAssessments: 24,
        schoolAverage: 78.4
      },
      tierDistribution: [
        {
          subject: 'MATH',
          green: 45,
          orange: 32,
          red: 18,
          gray: 5,
          total: 100
        },
        {
          subject: 'READING',
          green: 42,
          orange: 35,
          red: 20,
          gray: 3,
          total: 100
        }
      ],
      gradeBreakdown: [
        {
          grade: 'Grade 3',
          mathAverage: 76.2,
          readingAverage: 78.9,
          totalStudents: 52
        },
        {
          grade: 'Grade 4',
          mathAverage: 79.1,
          readingAverage: 77.8,
          totalStudents: 54
        },
        {
          grade: 'Grade 5',
          mathAverage: 80.3,
          readingAverage: 79.2,
          totalStudents: 50
        }
      ],
      trends: [
        { week: '2025-01-06', average: 75.2 },
        { week: '2025-01-13', average: 76.8 },
        { week: '2025-01-20', average: 78.4 }
      ]
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
