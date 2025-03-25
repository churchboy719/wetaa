"use client";

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";

export default function AddProductForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    images: [],
    discount: '',
    nicks: '',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const { data: session, status }: any = useSession();

  useEffect(() => {
    console.log("Session Data:", session); // ✅ Debugging session
  }, [session]);
  const vendorId = session?.user?.vendorId?.trim();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setImageFiles(Array.from(files));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    const data = new FormData();
    
    // Append form data
    for (const key in formData) {
      const value = formData[key as keyof typeof formData];
      if (key === 'nicks' && typeof value === 'string') {
        data.append(key, JSON.stringify(value.split(',')));
      } else if (typeof value === 'string') {
        data.append(key, value);
      }
    }
  
    // Append vendorId (Ensure it's a string)
    //const vendorId = '9bz6TKfM0h'; // Replace with actual vendorId (string)
    data.append('vendorId', vendorId);
  
    // Append images if they exist
    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
        data.append('images', file);
      }
    }
  
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        body: data,
      });
  
      if (res.ok) {
        alert('Product added successfully');
      } else {
        const error = await res.json();
        alert(`Failed to add product: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      alert('An error occurred while adding the product.');
    }
  };
  
  

  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-8 bg-white rounded-xl shadow-md max-w-lg mx-auto">
      <h2 className="text-2xl font-bold">Add New Product</h2>

      {Object.entries(formData).map(([key, value]) => (
        <div key={key} className="flex flex-col">
          <label className="text-gray-600 font-semibold capitalize" htmlFor={key}>{key}</label>
          {key === 'description' ? (
            <textarea name={key} value={value as string} onChange={handleChange} className="p-3 border rounded-md" />
          ) : key === 'images' ? (
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="p-3 border rounded-md" />
          ) : (
            <input
              type={key === 'price' ? 'number' : 'text'}
              name={key}
              value={value as string}
              onChange={handleChange}
              placeholder={`Enter ${key}`}
              className="p-3 border rounded-md"
            />
          )}
        </div>
      ))}

      <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700">Add Product</button>
    </form>
  );
}
