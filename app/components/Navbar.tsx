"use client";
import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const links = ["Pricing", "Team", "FAQ", "Blog", "Contact"];

  return (
    <nav className="absolute top-0 left-0 w-full p-4 bg-black bg-opacity-50 z-20">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href={"./"} className="text-2xl font-bold text-white">Wetaa</Link>
        
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