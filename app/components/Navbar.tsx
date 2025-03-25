import Link from "next/link";


export default function Navbar ()  {
  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <h1 className="text-xl font-bold">NightBird</h1>
      <div className="flex space-x-4">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <Link href="/blog" className="hover:underline">
          Blog
        </Link>
        <Link href="/chat" className="hover:underline">
          Chat
        </Link>
      </div>
    </nav>
  );
};