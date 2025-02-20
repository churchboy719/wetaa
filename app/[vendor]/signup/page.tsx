"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VendorSignup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    businessAddress: "",
    phone: "",
    packageType: "Professional",
    voucherCode: "",
  });
  const [amount, setAmount] = useState(50);

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "packageType") {
      setAmount(value === "Premium" ? 100 : 50);
    }
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    const res = await fetch("/api/vendor/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      alert("Vendor registered successfully!");
      router.push("/vendor/dashboard");
    } else {
      alert("Registration failed");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Vendor Sign Up</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="fullName" placeholder="Full Name" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input type="text" name="businessAddress" placeholder="Business Address" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input type="text" name="phone" placeholder="Phone Number" className="w-full p-2 border rounded" onChange={handleChange} required />
        <select name="packageType" className="w-full p-2 border rounded" onChange={handleChange} required>
          <option value="Professional">Professional - $50</option>
          <option value="Premium">Premium - $100</option>
        </select>
        <p className="text-gray-600">Amount to be Paid: ${amount}</p>
        <input type="text" name="voucherCode" placeholder="Voucher Code" className="w-full p-2 border rounded" onChange={handleChange} required />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Register</button>
      </form>
    </div>
  );
}
