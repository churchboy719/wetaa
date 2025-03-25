"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'

export default function AddProductForm() {
    const [formData, setFormData] = useState<{
        name: string;
        description: string;
        category: string;
        price: string;
        images: string[];
        discount: string;
        nicks: string;
        vendorId: string;
      }>({
        name: '',
        description: '',
        category: '',
        price: '',
        images: [],
        discount: '',
        nicks: '',
        vendorId: '',
      });
      
      const { data: session } = useSession();


//       const [images, setImages] = useState<File[]>([]);

//   const handleChange = (e: any) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

// const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (files && files.length > 0) {
//       const imageUrls = Array.from(files).map((file) => URL.createObjectURL(file));
//       setFormData((prev) => ({
//         ...prev,
//         images: imageUrls,
//       }));
//     }
//   };
  

//   const handleSubmit = async (e: any) => {
//     e.preventDefault();
  
//     const res = await fetch('/api/products', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         ...formData,
//         nicks: formData.nicks.split(','),
//         vendorId: formData.vendorId, // Ensure vendorId is passed
//       }),
//     });
  
//     if (res.ok) alert('Product added successfully');
//     else {
//       const errorData = await res.json();
//       alert(`Failed to add product: ${errorData.error || 'Unknown Error'}`);
//     }
//   };
  

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6 p-8 bg-white rounded-xl shadow-md max-w-lg mx-auto">
//       <h2 className="text-2xl font-bold">Add New Product</h2>

//       {Object.entries(formData).map(([key, value]) => (
//         <div key={key} className="flex flex-col">
//           <label className="text-gray-600 font-semibold capitalize" htmlFor={key}>{key}</label>
//           {key === 'description' ? (
//             <textarea name={key} value={value as string} onChange={handleChange} className="p-3 border rounded-md" />
//           ) : key === 'images' ? (
//             <input type="file" multiple accept="image/*" onChange={handleImageChange} className="p-3 border rounded-md" />
//           ) : (
//             <input
//               type={key === 'price' ? 'number' : 'text'}
//               name={key}
//               value={value as string}
//               onChange={handleChange}
//               placeholder={`Enter ${key}`}
//               className="p-3 border rounded-md"
//             />
//           )}
//         </div>
//       ))}

//       <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700">Add Product</button>
//     </form>
//   );
// }

const [images, setImages] = useState<File[]>([]);

useEffect(() => {
    console.log('Session Data:', session);
  }, [session]);

  const vendorId = session?.user?.vendorId;


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };// Frontend Component
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (!formData.vendorId) {
      alert('Vendor ID is missing');
      return;
    }
  
    const formDataToSend = new FormData();
  
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'nicks') {
        formDataToSend.append(key, JSON.stringify((value as string).split(',')));
      } else {
        formDataToSend.append(key, value as string);
      }
    });
  
    images.forEach((image) => formDataToSend.append('images', image));
  
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        body: formDataToSend,
      });
  
      const result = await res.json();
  
      if (res.ok) {
        alert('Product added successfully');
      } else {
        alert(`Failed to add product: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Submission Error:', error);
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
            <textarea name={key} value={value} onChange={handleChange} className="p-3 border rounded-md" />
          ) : (
            <input
              type={key === 'price' ? 'number' : 'text'}
              name={key}
              value={value}
              onChange={handleChange}
              placeholder={`Enter ${key}`}
              className="p-3 border rounded-md"
            />
          )}
        </div>
      ))}

      <div className="flex flex-col">
        <label className="text-gray-600 font-semibold">Upload Images</label>
        <input type="file" multiple onChange={handleFileChange} className="p-3 border rounded-md" />
      </div>

      <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700">
        Add Product
      </button>
    </form>
  );
}