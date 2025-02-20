"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function VendorDashboard() {
  const { data: session } = useSession();
  const [vendor, setVendor] = useState<any>(null);

  useEffect(() => {
    async function fetchVendor() {
      if (session?.user?.email) {
        const res = await fetch(`/api/vendor?email=${session.user.email}`);
        const data = await res.json();
        setVendor(data.vendor);
      }
    }
    fetchVendor();
  }, [session]);

  if (!session) return <p>Please log in to view your dashboard.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {vendor?.name}!</h1>
      <p className="mt-2">Manage your business and track orders here.</p>
      <nav className="mt-4">
        <ul className="flex space-x-4">
          <li><Link href="/vendor/products">Products</Link></li>
          <li><Link href="/vendor/orders">Orders</Link></li>
          <li><Link href="/vendor/settings">Settings</Link></li>
        </ul>
      </nav>
    </div>
  );
}
