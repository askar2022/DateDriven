import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  providers: [
    // Only include Google provider if credentials are available
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('Auth attempt:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        // For development/testing - predefined users for grades K-8
        const testUsers = [
          {
            email: 'admin@school.edu',
            password: 'password',
            id: '1',
            name: 'Admin User',
            role: Role.LEADER
          },
          // Kindergarten
          {
            email: 'ms.kelly@school.edu',
            password: 'password',
            id: '2',
            name: 'Ms.Kelly',
            role: Role.TEACHER
          },
          // Grade 1
          {
            email: 'mr.adams@school.edu',
            password: 'password',
            id: '3',
            name: 'Mr.Adams',
            role: Role.TEACHER
          },
          // Grade 2
          {
            email: 'ms.johnson@school.edu',
            password: 'password',
            id: '4',
            name: 'Ms.Johnson',
            role: Role.TEACHER
          },
          // Grade 3
          {
            email: 'ms.smith@school.edu',
            password: 'password',
            id: '5',
            name: 'Ms.Smith',
            role: Role.TEACHER
          },
          // Grade 4
          {
            email: 'ms.sahra@school.edu',
            password: 'password',
            id: '6',
            name: 'Ms.Sahra',
            role: Role.TEACHER
          },
          // Grade 5
          {
            email: 'ms.davis@school.edu',
            password: 'password',
            id: '7',
            name: 'Ms.Davis',
            role: Role.TEACHER
          },
          // Grade 6
          {
            email: 'mr.wilson@school.edu',
            password: 'password',
            id: '8',
            name: 'Mr.Wilson',
            role: Role.TEACHER
          },
          // Grade 7
          {
            email: 'ms.garcia@school.edu',
            password: 'password',
            id: '9',
            name: 'Ms.Garcia',
            role: Role.TEACHER
          },
          // Grade 8
          {
            email: 'mr.thompson@school.edu',
            password: 'password',
            id: '10',
            name: 'Mr.Thompson',
            role: Role.TEACHER
          }
        ]

        const user = testUsers.find(u => u.email === credentials.email && u.password === credentials.password)
        if (user) {
          console.log(`Auth successful for ${user.role}: ${user.name}`)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        }

        console.log('Auth failed - invalid credentials')
        return null
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-key',
  pages: {
    signIn: '/auth',
    signOut: '/auth',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // This callback is called after successful sign in
      console.log('NextAuth redirect callback:', { url, baseUrl })
      
      // If there's a specific URL, use it
      if (url) {
        return url.startsWith(baseUrl) ? url : baseUrl
      }
      
      // Default redirect to base URL (will trigger our page.tsx routing)
      return baseUrl
    }
  },
  debug: true // Enable debug mode
};

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
