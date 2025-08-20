import { NextResponse } from "next/server";

// Force dynamic rendering to prevent build-time data collection
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Example in-memory store (replace with Prisma, MongoDB, etc.)
const students: Record<string, { id: string; name: string; grade: string }> = {
  "1": { id: "1", name: "Ali", grade: "A" },
  "2": { id: "2", name: "Maryam", grade: "B" },
};

/**
 * GET /api/students/[id]
 * Fetch one student by ID
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const student = students[id];

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json(student, { status: 200 });
}

/**
 * PUT /api/students/[id]
 * Update student info
 */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();

  if (!students[id]) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  students[id] = { ...students[id], ...body };

  return NextResponse.json({ message: "Student updated", student: students[id] });
}

/**
 * DELETE /api/students/[id]
 * Remove student
 */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!students[id]) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  delete students[id];
  return NextResponse.json({ message: `Student ${id} deleted` }, { status: 200 });
}
