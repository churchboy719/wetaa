"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// Simple Carousel Component with autoplay
function Carousel({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="w-full h-screen overflow-hidden relative">
      {images.map((src, index) => (
        <Image
          key={index}
          src={src}
          alt={`Slide ${index}`}
          layout="fill"
          objectFit="cover"
          className={
            index === current
              ? "opacity-100 transition-opacity duration-1000"
              : "opacity-0"
          }
        />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative w-full h-screen">
      {/* Carousel Section */}
      <section className="absolute inset-0 w-full h-full">
        <Carousel images={["/order.jpeg", "/received.jpeg", "/trolley.jpeg", "/barman.jpeg", "/invoice.jpeg"]} />
      </section>

      {/* Navbar */}

      {/* Text Overlay Section */}
      <div className="absolute inset-0 flex flex-col w-full justify-center items-center bg-black bg-opacity-50 text-white p-4 text-center z-10 px-20 py-40">
        <h2 className="text-4xl font-bold mb-4">Welcome to Wetaa In-house Ordering</h2>
        <p className="max-w-2xl mb-6">
          An in-house ordering and multi-POS invoice application for restaurants and bars. Customers simply scan a QR code and order from their table, ensuring faster service, reducing fraud, and increasing efficiency.
        </p>
        <Link href="/learn" className="hover:text-blue-700 transition">Learn more...</Link>
        <Link href="/vendor/signup" className="bg-blue-500 w-40 text-lg rounded-lg shadow-md hover:bg-blue-700 transition mt-4 flex items-center justify-center">
          Get Started
        </Link>
      </div>
    </div>
  );
}

