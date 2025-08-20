# Student Performance Analytics

A comprehensive student performance tracking and analytics platform built with Next.js, NextAuth, and Prisma.

## Features

- **Authentication**: Secure login with Google OAuth and development credentials
- **Student Management**: Add, edit, and view student information
- **Performance Tracking**: Upload and track weekly scores
- **Analytics & Reports**: Generate detailed performance reports
- **Beautiful UI**: Modern, responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run the development server: `npm run dev`

## Environment Variables

Create a `.env.local` file with:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Deployment

The application is deployed on Vercel at: https://student-performance-analytics.vercel.app

---

© 2025 Analytics by Dr. Askar. All rights reserved.
