"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FaPlus, FaMinus } from "react-icons/fa";
import { io, Socket } from "socket.io-client";
import Navbar from "@/app/components/Navbar";

let socket: Socket;

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: any;
}

interface CartItem extends Product {
  quantity: number;
}

export default function Cart() {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [tableNumber, setTableNumber] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [socket, setSocket] = useState<any>(null);

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

  // Filtered products based on category
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;


  useEffect(() => {
      const newSocket = io("http://localhost:3001");
      setSocket(newSocket);

    return () => {
      // Clean up the socket connection when the component unmounts
      if (socket && socket.connected) {
        socket.disconnect();
    };}
  }, []);

  const addItems = (product: Product) => {
    const checkItem = cart.find((item: any) => item._id === product._id);
    if (checkItem) {
      setCart(
        cart.map((item: any) =>
          item._id === product._id ? { ...checkItem, quantity: checkItem.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeItem = (productId: any) => {
    const checkItem = cart.find((item: any) => item._id === productId._id);
    if (checkItem) {
      setCart(cart.filter((item:any) => item._id !== productId._id));
    } else {
      setCart(
        cart.map((item:any) =>
          item._id === productId._id ? { ...item, quantity: item.quantity - 1 } : item
        )
      );
    }
  };
  
  const handleOrderSubmit = () => {
    if (cart.length === 0 || !tableNumber) {
      alert("Please select items and enter a table number.");
      return;
    }
  
    const orderData = {
      tableNumber,
      orders: cart.map((item) => ({
        product: item.name,
        qty: item.quantity,
      })),
    };
  
    // 🔹 Emit "orders" event
    socket.emit("orders", orderData);
  
    // ✅ Show success message
    setSuccessMessage("Someone is bringing your order!");
  
    // ✅ Hide success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage("");
    }, 5000); // 3000ms = 3 seconds
  
    // ✅ Clear cart & table number
    setCart([]);
    setTableNumber("");
    alert("Your order has been placed.");
  };
    
  const totalAmount = cart.reduce((a, c) => a + c.quantity * c.price, 0);

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-slate-100 flex-col items-center p-6 sm:p-10">
        <div>
        <select
          className="mb-4 p-2 border rounded"
          onChange={(e) => setSelectedCategory(e.target.value)}
          value={selectedCategory}
        >
          <option value="">All Categories</option>
          {Array.from(new Set(products.map((p) => p.category))).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Table Number"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          className="border p-2 rounded mb-4"
        />
        </div>
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="card h-full bg-white w-full shadow-sm p-3 rounded-md bg-clip-padding backdrop-blur-lg backdrop-filter"
                >
                  <div className="relative">
                  {product.image && Array.isArray(product.image) && product.image[0] ? (
                    <Image
                    //src={product.image[0].startsWith("data:image") ? product.image[0] : "/placeholder.jpg"}
                    src={
                      product.image[0].startsWith('data:image/jpeg;base64,') || product.image[0].startsWith('data:image/jpg;base64,')
                        ? product.image[0]
                        : `data:image/jpeg;base64,${product.image[0]}`
                    }
                    alt={product.name}
                    width={100}
                    height={100}
                    className="object-cover w-full h-32 sm:h-40"
                   />
                  ) : (
                  <div>No Image Available</div>
                  )}

                    <div className="absolute top-2 right-2">
                      <div className="relative bg-red-500 cursor-pointer p-3 rounded-full">
                        <FaPlus
                          className="text-white text-xl font-medium z-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                          onClick={() => addItems(product)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="card-data pt-3">
                    <div className="flex items-center text-black justify-between">
                      <div className="font-medium">{product.name}</div>
                      <div className="font-medium text-red-500">N{product.price}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white shadow-sm p-3 lg:col-span-2 rounded-md">
              {cart.map((product: any) => ( 
                <div
                  key={product._id}
                  className="flex items-center justify-between mb-4"
                >
                  <div className="text-black font-medium">{product.name}</div>
                  <div className="flex space-x-4 items-center">
                    <div className="relative bg-red-500 cursor-pointer p-2 rounded-full text-white shadow-sm">
                      <FaPlus
                        className="text-white text-sm sm:text-xl font-medium"
                        onClick={() => addItems(product)}
                      />
                    </div>
                    <span className="text-sm sm:text-xl px-3 py-2 bg-gray-100 text-black">
                      {product.quantity}
                    </span>
                    <div className="relative bg-red-500 cursor-pointer p-2 rounded-full text-white shadow-sm">
                      <FaMinus
                        className="text-white text-sm sm:text-xl font-medium"
                        onClick={() => removeItem(product)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex items-center text-black justify-between mb-3">
                <div className="text-sm sm:text-lg font-medium">Total</div>
                <div className="text-sm sm:text-lg font-medium">N{totalAmount}</div>
              </div>
              <button
                className="text-white w-full bg-red-500 p-3 rounded-md"
                onClick={handleOrderSubmit}
              >
                Send Order
              </button>
              {successMessage && <p className="mt-4 text-green-600">{successMessage}</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
