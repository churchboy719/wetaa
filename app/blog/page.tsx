'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Blog {
  _id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  createdAt: string;
}


export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    fetch('/api/blog')
      .then((res) => res.json())
      .then((data) => setBlogs(data));
  }, []);

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-gray-500">Latest Blogs</h1>
      <ul>
        {blogs.map((blog:Blog) => (
          <li key={blog._id} className="mb-6 p-4 bg-white shadow rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-500">{blog.title}</h2>
            <p className="text-gray-500">{new Date(blog.date).toLocaleDateString()}</p>
            <Link href={`/blog/${blog._id}`} className="text-blue-600 mt-2 inline-block">Learn More</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}