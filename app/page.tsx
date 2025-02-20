// src/app/page.tsx (Home Page)
"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Carousel } from "./components/Carousel";

export default function Home() {
  return (
    <div>
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
        <h1 className="text-2xl font-bold">Multi-Vendor SaaS</h1>
        <ul className="flex space-x-4">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/blog">Blog</Link></li>
          <li><Link href="/products">Products</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
      </nav>

      {/* Carousel Section */}
      <section className="relative">
        <Carousel images={["/barcadi.jpeg", "/jackDaniels.jpeg", "/nightclub3.avif"]} />
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black bg-opacity-50 text-white p-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Welcome to Our Multi-Vendor Platform</h2>
          <p className="max-w-2xl mb-6">
            Discover a seamless ordering experience tailored for restaurants and bars. Streamline operations, enhance efficiency, and improve customer satisfaction.
          </p>
          <Link href="/vendor/signup" className="bg-blue-500 px-6 py-3 text-lg rounded-lg shadow-md hover:bg-blue-700 transition">
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
