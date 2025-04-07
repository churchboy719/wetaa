// // app/api/blog/[id]/route.ts
// import { NextResponse } from 'next/server';
// import Blog from '@/app/models/blog';
// import { connectDB } from '@/app/lib/mongodb';

// export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
//   //const { id } = params;
//   const id = (await params).id;
  
//   await connectDB();
//   const blog = await Blog.findById(id);
  
//   return NextResponse.json(blog || { error: 'Not found' }, { 
//     status: blog ? 200 : 404 
//   });
// }

// app/api/blog/[id]/route.ts
import { NextResponse } from 'next/server';
import Blog from '@/app/models/blog';
import { connectDB } from '@/app/lib/mongodb';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    await connectDB();
    const blog = await Blog.findById(id);

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(blog, { status: 200 });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
