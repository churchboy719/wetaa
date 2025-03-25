import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  discount?: string;
  nicks: string;
}

export default function ManageProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const router = useRouter();

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(Array.isArray(data.products) ? data.products : []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  // Delete product
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete product');
        setProducts((prev) => prev.filter((product) => product._id !== id));
        alert('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      }
    }
  };

  // Update product
  const handleUpdate = async () => {
    if (!selectedProduct) return;
    try {
      const response = await fetch(`/api/products/${selectedProduct._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedProduct),
      });
      if (!response.ok) throw new Error('Failed to update product');
      alert('Product updated successfully');
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-1/4 bg-gray-100 p-4 overflow-y-auto">
        <button onClick={() => router.push('./add-product')} className="mb-4 w-full bg-blue-600 text-black p-2 rounded">Add New Product</button>
        <h2 className="text-xl font-bold mb-4 text-black">Products</h2>
        {products.length === 0 ? (
          <p className='text-black'>No products available</p>
        ) : (
          products.map((product) => (
            <div key={product._id} className="flex justify-between items-center p-2 mb-2 bg-white shadow rounded text-black">
              <span>{product.name}</span>
              <div>
                <button className="text-blue-600 mr-2" onClick={() => setSelectedProduct(product)}>Edit</button>
                <button className="text-red-600" onClick={() => handleDelete(product._id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </aside>

      {/* Main Content */}
      <main className="w-3/4 p-6">
        {selectedProduct ? (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-black">Edit Product</h2>
            {(['name', 'description', 'category', 'price', 'discount', 'nicks'] as (keyof Product)[]).map((field) => (
              <div key={field} className="mb-4">
                <label className="block font-semibold">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input
                  type={field === 'price' ? 'number' : 'text'}
                  value={selectedProduct[field] ?? ''}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, [field]: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
            ))}
            <button onClick={handleUpdate} className="bg-green-600 p-2 rounded text-white">Update Product</button>
          </div>
        ) : (
          <p className='text-black'>Select a product to edit or add a new product.</p>
        )}
      </main>
    </div>
  );
}
