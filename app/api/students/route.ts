import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Return mock data for now to prevent build failures
    const students = [
      {
        id: '1',
        externalId: 'STU001',
        active: true,
        gradeLevel: { name: 'Grade 3' },
        pii: { fullName: 'Alice Johnson' }
      },
      {
        id: '2',
        externalId: 'STU002',
        active: true,
        gradeLevel: { name: 'Grade 3' },
        pii: { fullName: 'Bob Smith' }
      },
      {
        id: '3',
        externalId: 'STU003',
        active: true,
        gradeLevel: { name: 'Grade 4' },
        pii: { fullName: 'Carol Davis' }
      },
      {
        id: '4',
        externalId: 'STU004',
        active: true,
        gradeLevel: { name: 'Grade 4' },
        pii: { fullName: 'David Wilson' }
      },
      {
        id: '5',
        externalId: 'STU005',
        active: true,
        gradeLevel: { name: 'Grade 5' },
        pii: { fullName: 'Eva Brown' }
      }
    ]

    return NextResponse.json(students)
  } catch (error) {
    console.error('Students API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fullName, externalId, gradeLevelId } = await request.json()

    if (!fullName || !gradeLevelId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Return mock created student
    const student = {
      id: '6',
      externalId: externalId || 'STU006',
      active: true,
      gradeLevel: { name: `Grade ${gradeLevelId}` },
      pii: { fullName }
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error('Create student error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
