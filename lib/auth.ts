import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })

  return user
}

export function hasRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole)
}

export function canAccessTeacherFeatures(userRole: string): boolean {
  return hasRole(userRole, ['TEACHER', 'STAFF', 'LEADER'])
}

export function canAccessStaffFeatures(userRole: string): boolean {
  return hasRole(userRole, ['STAFF', 'LEADER'])
}

export function canAccessLeaderFeatures(userRole: string): boolean {
  return hasRole(userRole, ['LEADER'])
}
