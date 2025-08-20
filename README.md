# Student Performance Analytics

A comprehensive web application for tracking and visualizing student performance in Math and Reading across multiple classes and grade levels.

## Features

### 🎯 Core Functionality
- **Weekly Score Upload**: Teachers can upload Excel files with student scores
- **Performance Dashboards**: Color-coded analytics with tier system (Green ≥85, Orange 75-84, Red 65-74, Gray <65)
- **Role-Based Access**: Teacher, Staff Admin, and Leader roles with appropriate permissions
- **Trend Analysis**: Week-over-week growth tracking and sparkline trends
- **PDF Reports**: Automated weekly leader reports with distribution analysis

### 📊 Analytics & Visualization
- Interactive charts using Chart.js
- Class and grade-level comparisons
- Student performance tier distribution
- Weekly trend analysis
- Mobile-responsive design

### 🔐 Security & Privacy
- Google SSO authentication via Auth.js
- Anonymized dashboards (no student names in analytics)
- Role-based access control
- Audit trails for data uploads

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Auth.js (NextAuth) with Google OAuth
- **Charts**: Chart.js with React Chart.js 2
- **File Processing**: SheetJS (xlsx) for Excel parsing
- **PDF Generation**: Puppeteer
- **Deployment**: Vercel-optimized

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Google OAuth credentials

### 1. Clone and Install
```bash
git clone <your-repo>
cd student-performance-analytics
npm install
```

### 2. Environment Setup
Create `.env.local` file:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/student_analytics"

# Next Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# Seed sample data
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Database Schema

### Core Entities
- **Users**: Teachers, Staff Admins, Leaders with role-based access
- **GradeLevels**: Grade 3, 4, 5 with associated classrooms
- **Classrooms**: G3-A, G3-B, G4-A, G4-B, G5-A, G5-B
- **Students**: Anonymized analytics IDs with separate PII table
- **Assessments**: Weekly Math/Reading assessments per classroom
- **Scores**: Individual student scores with tier calculations
- **WeeklyAggregates**: Pre-computed tier counts for fast dashboard loading

### Privacy Design
- Student names stored separately in `StudentPII` table
- Analytics queries never join with PII data
- Dashboard views are completely anonymized

## Excel Upload Format

### Required Columns
| Column | Description | Example |
|--------|-------------|---------|
| WeekStart | Monday date | 2024-01-15 |
| ClassroomCode | Class identifier | G3-A |
| Subject | Math or Reading | Math |
| StudentName | Full name | John Smith |
| StudentID | Optional ID | STU001 |
| GradeLevel | Grade level | Grade 3 |
| Score | 0-100 score | 87.5 |

### Validation Rules
- Scores: 0-100 range
- Subjects: "Math" or "Reading" (case insensitive)
- WeekStart: Auto-adjusted to Monday
- Student Matching: By StudentID first, then exact name match

## User Roles & Permissions

### 👨‍🏫 Teacher
- Upload weekly scores via Excel
- View performance dashboards
- Access to own classroom data

### 👩‍💼 Staff Admin  
- All Teacher permissions
- Manage student roster
- Resolve upload conflicts
- Cross-classroom visibility

### 👩‍💻 Leader
- Read-only dashboard access
- Generate PDF reports
- School-wide analytics
- Trend analysis across all classes

## Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy with automatic PostgreSQL provisioning

### Environment Variables for Production
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="production-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Development

### Available Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint checking
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:migrate   # Run migrations
npm run db:seed      # Seed sample data
```

### Project Structure
```
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
├── lib/                # Utility functions and configurations
├── prisma/             # Database schema and migrations
├── public/             # Static assets
└── types/              # TypeScript type definitions
```

## Features Roadmap

### MVP (Current)
- ✅ Excel upload with validation
- ✅ Role-based authentication
- ✅ Performance dashboards
- ✅ Tier-based color coding
- ✅ Weekly aggregation

### Future Enhancements
- [ ] PDF report generation
- [ ] Advanced student management
- [ ] Bulk student import
- [ ] Data export functionality
- [ ] Email notifications
- [ ] Advanced filtering
- [ ] Historical data analysis

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is designed for educational purposes and learning. Feel free to use and modify for your own learning projects.

## Support

This application was built as a learning project to demonstrate:
- Full-stack Next.js development
- Database design with Prisma
- Authentication implementation
- Data visualization
- Role-based access control
- File processing and validation

For questions about implementation or learning resources, please open an issue in the repository.
