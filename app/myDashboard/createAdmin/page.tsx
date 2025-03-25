"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AddAdmin() {
  const { data: session, status }: any = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    console.log("Session Data:", session); // ✅ Debugging session
  }, [session]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // ✅ Ensure vendorId exists and is a valid string
    const res = await fetch("/api/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      }),
    });

    if (res.ok) {
      alert("New Admin created successfully!");
      router.push("/vendor/myDashboard");}
    else {
      const errorText = await res.text();
      console.error("Failed to add admin:", errorText);
      alert(`Error: ${errorText}`);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Add New Admin</h1>
      {status === "loading" && <p>Loading session...</p>}
      {status === "unauthenticated" && <p>You must be logged in to add a Admin.</p>}
      {session && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input type="text" name="name" placeholder="Name" onChange={handleChange} className="w-full p-2 border rounded" required />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border rounded text-black" required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full p-2 border rounded" required />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Admin</button>
        </form>
      )}
    </div>
  );
}
