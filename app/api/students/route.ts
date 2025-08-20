import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Temporary: Skip authentication for development
    const user = await getCurrentUser()
    
    // If no user found (no auth configured), use mock user for development
    const mockUser = user || {
      id: 'mock-user-id',
      email: 'demo@school.edu',
      name: 'Demo User',
      role: 'STAFF'
    }
    
    if (!mockUser || !['STAFF', 'LEADER'].includes(mockUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const grade = searchParams.get('grade')

    const where = {
      active: true,
      ...(grade && grade !== 'all' ? { gradeLevelId: parseInt(grade) } : {}),
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        gradeLevel: true,
        pii: true,
      },
      orderBy: [
        { gradeLevel: { name: 'asc' } },
        { pii: { fullName: 'asc' } },
      ],
    })

    return NextResponse.json(students)

  } catch (error) {
    console.error('Students API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Temporary: Skip authentication for development
    const user = await getCurrentUser()
    
    // If no user found (no auth configured), use mock user for development
    const mockUser = user || {
      id: 'mock-user-id',
      email: 'demo@school.edu',
      name: 'Demo User',
      role: 'STAFF'
    }
    
    if (!mockUser || !['STAFF', 'LEADER'].includes(mockUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fullName, externalId, gradeLevelId } = await request.json()

    if (!fullName || !gradeLevelId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const student = await prisma.student.create({
      data: {
        externalId,
        gradeLevelId: parseInt(gradeLevelId),
        pii: {
          create: {
            fullName,
          },
        },
      },
      include: {
        gradeLevel: true,
        pii: true,
      },
    })

    return NextResponse.json(student)

  } catch (error) {
    console.error('Create student error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
