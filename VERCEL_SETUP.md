# Vercel Deployment Setup Guide

## Environment Variables Required

You need to set these environment variables in your Vercel dashboard:

### 1. Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://jnbpiftobpbyglzrqcry.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuYnBpZnRvYnBieWdsenJxY3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NTU2NzYsImV4cCI6MjA3MzAzMTY3Nn0.sQLYqKSj2fHEAI3FrUUYsWKrO13jz927WdvYge_3HQI
```

### 2. NextAuth Configuration
```
NEXTAUTH_URL=https://date-driven-n1y1.vercel.app
NEXTAUTH_SECRET=your-production-secret-key-here
```

### 3. Optional: Google OAuth (if you want to keep it)
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project: `date-driven-n1y1`
3. Go to Settings → Environment Variables
4. Add each variable above
5. Make sure to set them for "Production" environment
6. Redeploy your project

## Common Issues Fixed

### 1. Puppeteer Configuration
- Added Vercel-specific Puppeteer args for serverless environment
- Increased function timeout to 30 seconds for PDF generation

### 2. Supabase Connection
- Updated to use environment variables instead of hardcoded values
- Maintains fallback for local development

### 3. Report API Endpoints
- Fixed dynamic rendering configuration
- Added proper error handling

## Testing Your Deployment

After setting up environment variables:

1. Visit: https://date-driven-n1y1.vercel.app/reports
2. Test PDF generation
3. Check browser console for any errors

## Troubleshooting

If reports still don't work:

1. Check Vercel function logs in the dashboard
2. Verify all environment variables are set correctly
3. Ensure Supabase database has data
4. Check if Puppeteer is working by testing PDF generation

## Files Modified

- `vercel.json` - Added function timeouts and environment config
- `lib/supabase.ts` - Updated to use environment variables
- `app/api/reports/students/pdf/route.ts` - Fixed Puppeteer configuration
- `app/api/reports/pdf/route.ts` - Fixed Puppeteer configuration
