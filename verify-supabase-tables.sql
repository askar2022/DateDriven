-- SQL to verify Supabase tables for the upload functionality
-- Run this in Supabase SQL Editor once restoration is complete

-- Check if uploads table exists
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'uploads'
ORDER BY ordinal_position;

-- Check if students table exists
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'students'
ORDER BY ordinal_position;

-- Check if users table exists
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Count existing records
SELECT 
  'uploads' as table_name, 
  COUNT(*) as record_count 
FROM uploads
UNION ALL
SELECT 
  'students' as table_name, 
  COUNT(*) as record_count 
FROM students
UNION ALL
SELECT 
  'users' as table_name, 
  COUNT(*) as record_count 
FROM users;
