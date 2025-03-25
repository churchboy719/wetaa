"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";

const CreateVendorForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    address: "",
    businessType: "",
    email: "",
    password: "",
    phone: "",
    packageType: "bronze_monthly",
    voucherCode: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/vendor/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An error occurred");
        return;
      }

      alert("Vendor created successfully!");
      router.push("/admin/vendors");
    } catch (err) {
      console.error(err);
      setError("Internal server error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-lg mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold">Create Vendor</h2>

      {error && <p className="text-red-500">{error}</p>}

      <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded" />
      <input type="text" name="businessName" placeholder="Business Name" value={formData.businessName} onChange={handleChange} required className="w-full p-2 border rounded" />
      <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required className="w-full p-2 border rounded" />
      <input type="text" name="businessType" placeholder="Business Type" value={formData.businessType} onChange={handleChange} required className="w-full p-2 border rounded" />
      <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full p-2 border rounded" />
      <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full p-2 border rounded" />
      <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required className="w-full p-2 border rounded" />

      <select name="packageType" value={formData.packageType} onChange={handleChange} required className="w-full p-2 border rounded">
        {["bronze_monthly", "bronze_yearly", "silver_monthly", "silver_yearly", "gold_monthly", "gold_yearly", "trial_24hours"].map((option) => (
          <option key={option} value={option}>{option.replace("_", " ")}</option>
        ))}
      </select>

      <input type="text" name="voucherCode" placeholder="Voucher Code (Optional)" value={formData.voucherCode} onChange={handleChange} className="w-full p-2 border rounded" />

      <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded">Create Vendor</button>
    </form>
  );
};

export default CreateVendorForm;
