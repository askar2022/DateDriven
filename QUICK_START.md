# Quick Start Guide - Student Performance Analytics

## 🚀 Fast Setup for Testing

### Option 1: Install Dependencies (Recommended)
```bash
# Try installing only the essential packages first
npm install next react react-dom

# Then install the rest
npm install --legacy-peer-deps
```

### Option 2: If npm is slow, use yarn
```bash
# Install yarn if you don't have it
npm install -g yarn

# Install dependencies with yarn (usually faster)
yarn install
```

### Option 3: Development without database (Quick Demo)
If you want to see the UI without setting up a database:

1. **Copy environment file:**
   ```bash
   copy env.local.example .env.local
   ```

2. **Comment out database parts temporarily** in these files:
   - `lib/prisma.ts` 
   - Any API routes in `app/api/`

3. **Run development server:**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup (For Full Testing)

### Quick PostgreSQL Setup Options:

#### Option A: Local PostgreSQL
1. Install PostgreSQL locally
2. Create database: `createdb student_analytics`
3. Update `.env.local` with your connection string

#### Option B: Free Cloud Database (Easiest)
1. Sign up for [Supabase](https://supabase.com) (free tier)
2. Create a new project
3. Get the database URL from Settings > Database
4. Update `.env.local` with the connection string

#### Option C: Docker (If you have Docker)
```bash
docker run --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=student_analytics -p 5432:5432 -d postgres
```

## 🔐 Authentication Setup

### Google OAuth (Optional for basic testing)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth credentials
5. Add `http://localhost:3000` to authorized origins
6. Add `http://localhost:3000/api/auth/callback/google` to redirect URIs
7. Update `.env.local` with your client ID and secret

### Skip Auth for Quick Testing
You can temporarily modify the auth check in components to bypass authentication.

## 🏃‍♂️ Run the Application

```bash
# Install dependencies (if not done already)
npm install

# Set up database
npx prisma db push
npm run db:seed

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📋 Testing Features

### 1. **Dashboard View**
- Visit `/dashboard` to see analytics (mock data if no database)

### 2. **Excel Upload** 
- Visit `/upload` 
- Use the sample template provided
- Test file upload functionality

### 3. **Student Management**
- Visit `/students` (requires STAFF/LEADER role)

### 4. **Reports**
- Visit `/reports` (requires LEADER role)

## 🛠️ Troubleshooting

### Common Issues:

1. **npm install fails:**
   - Try `npm install --legacy-peer-deps`
   - Use yarn instead: `yarn install`
   - Clear npm cache: `npm cache clean --force`

2. **Database connection error:**
   - Check your DATABASE_URL in `.env.local`
   - Ensure PostgreSQL is running
   - Run `npx prisma db push` to create tables

3. **Authentication issues:**
   - Check NEXTAUTH_SECRET is set
   - Verify Google OAuth credentials
   - For testing, you can temporarily disable auth

4. **Build errors:**
   - Make sure all TypeScript types are correct
   - Run `npx prisma generate` to generate Prisma client

## 🔧 Development Commands

```bash
# Database
npx prisma studio          # Database GUI
npx prisma db push         # Push schema changes
npm run db:seed            # Seed sample data

# Development
npm run dev                # Start dev server
npm run build              # Build for production
npm run lint               # Run linting

# Type checking
npx tsc --noEmit          # Check TypeScript
```

## 📁 Key Files to Understand

- `app/page.tsx` - Home page
- `app/dashboard/page.tsx` - Main analytics dashboard
- `app/upload/page.tsx` - Excel upload interface
- `lib/excel-processor.ts` - File processing logic
- `prisma/schema.prisma` - Database schema
- `components/` - Reusable UI components

## 🎯 Next Steps

Once you have the basic app running:

1. **Upload sample data** using the Excel template
2. **Explore the dashboard** to see visualizations
3. **Test role-based access** by changing user roles in the database
4. **Generate reports** from the reports page
5. **Customize the UI** to match your school's branding

## 💡 Learning Opportunities

This project demonstrates:
- **Next.js 14** App Router patterns
- **TypeScript** for type safety
- **Prisma** ORM with PostgreSQL
- **Authentication** with NextAuth.js
- **File upload** and processing
- **Data visualization** with Chart.js
- **PDF generation** with Puppeteer
- **Role-based access control**
- **Responsive design** with Tailwind CSS

Happy coding! 🚀
