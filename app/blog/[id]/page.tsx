"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from "next/navigation";

interface Blog {
  _id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  createdAt: string;
}

export default function BlogDetailPage() {
  const params = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Ensure params.id is available
    if (!params?.id) return;

    fetch(`/api/blog/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Blog not found");
        return res.json();
      })
      .then((data) => setBlog(data))
      .catch(() => router.push('/blog'));
  }, [params?.id, router]);

  if (!blog) return <p>Loading...</p>;

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-4 text-blacks text-gray-500">{blog.title}</h1>
      <p className="text-gray-500 mb-2">By {blog.author} on {new Date(blog.date).toLocaleDateString()}</p>
      <div className="bg-white p-6 shadow rounded-lg text-black">{blog.content}</div>
    </div>
  );
}
