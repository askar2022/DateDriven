import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: "API is working!",
    timestamp: new Date().toISOString(),
    testData: {
      totalStudents: 38,
      averageScore: 79.5,
      weeklyTests: 4
    }
  })
}
