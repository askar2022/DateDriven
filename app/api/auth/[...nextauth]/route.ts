import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Auth endpoint working' })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Simple mock authentication
  if (body.email && body.password) {
    return NextResponse.json({
      user: {
        id: 'mock-user-id',
        email: body.email,
        name: 'Mock User',
        role: 'STAFF'
      },
      token: 'mock-jwt-token'
    })
  }
  
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
}
