import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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

        // For development/testing - allow any email/password
        if (credentials.email === 'admin@school.edu' && credentials.password === 'password') {
          console.log('Auth successful for admin user')
          return {
            id: '1',
            email: credentials.email,
            name: 'Admin User',
            role: 'LEADER'
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
