import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: any = null
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
}

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      console.error('Supabase not configured')
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // Fetch all users from the users table
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('name', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    console.log('Fetched users from Supabase:', users?.length || 0, 'users')
    
    return NextResponse.json({ 
      users: users || [],
      success: true 
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      success: false 
    }, { status: 500 })
  }
}
