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

// Responsive Navbar
function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const links = ["Home", "Pricing", "Team", "FAQ", "Blog", "Contact"];

  return (
    <nav className="absolute top-0 left-0 w-full p-4 bg-black bg-opacity-50 z-20">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Wetaa</h1>
        
        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6">
          {links.map((item, index) => (
            <li key={index}>
              <Link href={`/${item.toLowerCase()}`}>
                <span className="text-white text-lg cursor-pointer hover:text-blue-400 transition duration-300">
                  {item}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        
        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <ul className="md:hidden flex flex-col mt-4 space-y-4">
          {links.map((item, index) => (
            <li key={index}>
              <Link href={`/${item.toLowerCase()}`}>
                <span className="text-white text-lg cursor-pointer hover:text-blue-400 transition duration-300">
                  {item}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
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
      <Navbar />

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

