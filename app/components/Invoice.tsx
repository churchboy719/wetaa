
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FaPlus, FaMinus } from "react-icons/fa";
import { createClient } from "@sanity/client";
import { io, Socket } from "socket.io-client";

//let socket: Socket;

// Sanity Client
const client = createClient({
  projectId: "96f3k7mi",
  dataset: "production",
  useCdn: false,
  apiVersion: "2025-03-05",
});

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

const socket = io("http://localhost:3001", {
  reconnectionAttempts: 3, // Ensure reconnection on failures
  timeout: 10000, // Set connection timeout
});

export default function InvoicePage() {
  const [cart, setCart] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [username, setUsername] = useState("Cashier1"); // Replace with dynamic username if available
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    async function fetchProducts() {
      const data = await client.fetch(`*[_type == "product"]{
        _id, name, description, category, price, image
      }`);
      setProducts(data);
    }
    fetchProducts();
  }, []);


  // Filtered products based on category
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  // Add item to cart
  const addItems = (product: any) => {
    const updatedCart = [...cart];
    const itemIndex = updatedCart.findIndex((item) => item._id === product._id);
    if (itemIndex > -1) {
      updatedCart[itemIndex].quantity++;
    } else {
      updatedCart.push({ ...product, quantity: 1 });
    }
    setCart(updatedCart);
  };

  // Remove item from cart
  const removeItem = (product: any) => {
    const updatedCart = cart
      .map((item) =>
        item._id === product._id ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.qty > 0);
    setCart(updatedCart);
  };

  const totalAmount = cart.reduce((a, c) => a + c.quantity * c.price, 0);

  // Print Invoice and Update Sales
  const handlePrintInvoice = () => {
    if (cart.length === 0) {
      alert("Cart is empty. Please add items.");
      return;
    }

    const aggregatedSales = cart.reduce((acc: any[], item: any) => {
      const existing = acc.find((sale) => sale._id === item._id);
      if (existing) {
        existing.quantity += item.quantity;
        existing.total += item.quantity * item.price;
      } else {
        acc.push({ ...item, total: item.quantity * item.price });
      }
      return acc;
    }, sales);

    setSales(aggregatedSales);
    setTotalSales(aggregatedSales.reduce((sum, item) => sum + item.total, 0));

    setCart([]); // Reset cart after printing
    window.print();
  };

  // Send Sales Data to Cashier Group Chat
  const handleSendSales = () => {
    if (sales.length === 0) {
      alert("No sales data to send.");
      return;
    }

    const salesData = {
      username,
      sales,
      totalSales,
    };
    socket.emit("dailySales", salesData);
  };

 // const { data: menus, isLoading, isError } = useMenu();

  //if (isLoading) return <h1>Loading...</h1>;
  //if (isError) return <h1>Error fetching menu</h1>;

  return (
    <>
      <div className="flex min-h-screen bg-slate-100 flex-col items-center p-6 sm:p-10">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Menu Items */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="card h-full bg-white w-full shadow-sm p-3 rounded-md"
                >
                  <div className="relative">
                    {product.image && product.image[0] ? (
                      <Image
                        src={product.image[0].asset.url}
                        alt={product.name}
                        width={100}
                        height={100}
                        className="object-cover w-full h-32 sm:h-40"
                      />
                    ) : (
                      <div>No Image Available</div>
                    )}
                    <button
                      onClick={() => addItems(product)}
                      className="absolute top-2 right-2 bg-red-500 p-2 rounded-full text-white"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <div className="pt-3">
                    <div className="flex justify-between">
                      <span>{product.name}</span>
                      <span className="text-red-500">N{product.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart and Sales Column */}
            <div className="lg:col-span-2 flex flex-col space-y-6">
              {/* Cart Section */}
              <div className="bg-white shadow-sm p-3 rounded-md">
                {cart.map((product) => (
                  <div
                    key={product._id}
                    className="flex justify-between mb-4 items-center"
                  >
                    <span>{product.name}</span>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => addItems(product)}
                        className="bg-red-500 p-2 rounded-full text-white"
                      >
                        <FaPlus />
                      </button>
                      <span>{product.quantity}</span>
                      <button
                        onClick={() => removeItem(product)}
                        className="bg-red-500 p-2 rounded-full text-white"
                      >
                        <FaMinus />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between mt-4">
                  <span>Total</span>
                  <span>N{totalAmount}</span>
                </div>
                <button
                  onClick={handlePrintInvoice}
                  className="w-full bg-blue-500 text-white p-3 mt-4 rounded-md"
                >
                  Print Invoice
                </button>
              </div>

              {/* Sales Section */}
              <div className="bg-white shadow-sm p-3 rounded-md">
                <h3 className="text-lg font-medium">Sales</h3>
                {sales.map((item: any) => (
                  <div
                    key={item._id}
                    className="flex justify-between mb-2"
                  >
                    <span>{item.name}</span>
                    <span>{item.quantity}x</span>
                    <span>N{item.total}</span>
                  </div>
                ))}
                <div className="flex justify-between mt-4">
                  <span>Total Sales</span>
                  <span>N{totalSales}</span>
                </div>
                <button
                  onClick={handleSendSales}
                  className="w-full bg-green-500 text-white p-3 mt-4 rounded-md"
                >
                  Send to Group
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
