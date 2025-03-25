// app/api/blog/[id]/route.ts
import { NextResponse } from 'next/server';
import Blog from '@/app/models/blog';
import { connectDB } from '@/app/lib/mongodb';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  
  try {
    const blog = await Blog.findById(params.id);
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    return NextResponse.json(blog);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching blog' }, { status: 500 });
  }
}
