"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AddCashier() {
  const { data: session, status }: any = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    console.log("Session Data:", session); // ✅ Debugging session
  }, [session]);

  const vendorId = session?.user?.vendorId;

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!vendorId) {
      alert("Vendor ID is missing!");
      return;
    }

    const res = await fetch("/api/vendor/cashiers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, vendorId }),
    });

    if (res.ok) router.push("/vendor/dashboard");
    else alert("Failed to add cashier.");
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Add New Cashier</h1>
      {status === "loading" && <p>Loading session...</p>}
      {status === "unauthenticated" && <p>You must be logged in to add a cashier.</p>}
      {session && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input type="text" name="name" placeholder="Name" onChange={handleChange} className="w-full p-2 border rounded" required />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border rounded text-black" required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full p-2 border rounded" required />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Cashier</button>
        </form>
      )}
    </div>
  );
}
