// // app/api/blog/[id]/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import Blog from '@/app/models/blog';
// import { connectDB } from '@/app/lib/mongodb';

// interface RouteParams {
//   params: {
//     id: string;
//   };
// }

// export async function GET(
//   request: NextRequest,
//   context: RouteParams // ❌ Not a Promise — just a plain object
// ) {
//   const { id } = context.params;

//   try {
//     await connectDB();
//     const blog = await Blog.findById(id);

//     if (!blog) {
//       return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
//     }

//     return NextResponse.json(blog);
//   } catch (error) {
//     console.error('Error fetching blog:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// app/api/blog/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Blog from '@/app/models/blog';
import { connectDB } from '@/app/lib/mongodb';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    await connectDB();
    const blog = await Blog.findById(id);

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
