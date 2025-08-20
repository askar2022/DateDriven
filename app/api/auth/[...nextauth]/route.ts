import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Development credentials provider
    CredentialsProvider({
      name: 'Development',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // For development, allow any email/password combination
        if (process.env.NODE_ENV === 'development') {
          return {
            id: 'dev-user-id',
            email: credentials?.email || 'dev@school.edu',
            name: 'Development User',
            role: 'STAFF'
          }
        }
        return null
      }
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && token?.sub) {
        session.user.id = token.sub
        // Get user role from database or use token role
        if (token.role) {
          session.user.role = token.role
        } else {
          const user = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { role: true },
          })
          session.user.role = user?.role || 'TEACHER'
        }
      }
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id
        token.role = (user as any).role
      }
      return token
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
