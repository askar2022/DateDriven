import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { active } = await request.json()

    const student = await prisma.student.update({
      where: { id: params.id },
      data: { active },
      include: {
        gradeLevel: true,
        pii: true,
      },
    })

    return NextResponse.json(student)

  } catch (error) {
    console.error('Update student error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await prisma.student.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete student error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
