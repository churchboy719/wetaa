
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VendorSignup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    address: "",
    businessType: "",
    email: "",
    password: "",
    phone: "",
    packageType: "",
    voucherCode: "",
  });

  const [amount, setAmount] = useState(0);

  const packagePrices: Record<string, number> ={
    bronze_monthly: 50,
    bronze_yearly: 500,
    silver_monthly: 100,
    silver_yearly: 1000,
    gold_monthly: 200,
    gold_yearly: 2000,
    trial_24hours: 0,
  };

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "packageType" && value in packagePrices) {
            setAmount(packagePrices[value]);
          }
        };

  // const handleSubmit = async (e: any) => {
  //   e.preventDefault();
  //   if (!formData.packageType) {
  //     alert("Please select a subscription type.");
  //     return;
  //   }
  
  //   try {
  //     const response = await fetch("/api/payment/initiate", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         email: formData.email,
  //         amount,
  //         packageType: formData.packageType,
  //       }),
  //     });
  
  //     const data = await response.json();
  //     if (response.ok) {
  //       window.location.href = data.url; // Redirect to Paystack
  //     } else {
  //       alert(`Payment failed: ${data.error}`);
  //     }
  //   } catch (error) {
  //     console.error("Payment Error:", error);
  //     alert("An error occurred. Please try again.");
  //   }
  // };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (!formData.packageType) {
      alert("Please select a subscription type.");
      return;
    }
  
    try {
      // First, register the vendor
      const signupResponse = await fetch("/api/vendor/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      const signupData = await signupResponse.json();
  
      if (!signupResponse.ok) {
        alert(`Signup Failed: ${signupData.error}`);
        return;
      }
  
      const vendorId = signupData.vendor?.vendorId;
      if (!vendorId) {
        alert("Vendor ID not found. Please try again.");
        return;
      }
  
      // Then, initiate payment
      const response = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          amount,
          packageType: formData.packageType,
          vendorId,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        window.location.href = data.url; // Redirect to Paystack
      } else {
        alert(`Payment failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };
  

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Vendor Sign Up</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" placeholder="Full Name" required onChange={handleChange} />
        <input type="text" name="businessName" placeholder="Business Name" required onChange={handleChange} />
        <input type="text" name="address" placeholder="Business Address" required onChange={handleChange} />
        <input type="text" name="businessType" placeholder="Business Type" required onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" required onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
        <input type="text" name="phone" placeholder="Phone Number" required onChange={handleChange} />

        <h3 className="text-gray-600">Select Subscription Type</h3>
        <select name="packageType" className="w-full p-2 border rounded text-black" onChange={handleChange} required>
          <option value="trial_24hours">24 Hours Trial - Free</option>
            <optgroup label="Bronze">
            <option value="bronze_monthly">Bronze Monthly - $50</option>
            <option value="bronze_yearly">Bronze Yearly - $500</option>
            </optgroup>
            <optgroup label="Silver">
            <option value="silver_monthly">Silver Monthly - $100</option>
            <option value="silver_yearly">Silver Yearly - $1000</option>
            </optgroup>
            <optgroup label="Gold">
            <option value="gold_monthly">Gold Monthly - $200</option>
            <option value="gold_yearly">Gold Yearly - $2000</option>
            </optgroup>
          </select>


        <p className="text-gray-600">Amount to be Paid: ${amount}</p>
        <input type="text" name="voucherCode" placeholder="Voucher Code (Optional)" onChange={handleChange} />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Proceed to Payment</button>
      </form>
    </div>
  );
}
