
// "use client";

// import { useState, useEffect } from "react";
// import Image from "next/image";
// import { urlFor } from "@/sanity/lib/image";
// import { FaPlus, FaMinus } from "react-icons/fa";
// import { createClient } from "@sanity/client";
// import { io, Socket } from "socket.io-client";

// //let socket: Socket;

// // Sanity Client
// const client = createClient({
//   projectId: "96f3k7mi",
//   dataset: "production",
//   useCdn: false,
//   apiVersion: "2025-03-05",
// });

// interface Product {
//   _id: string;
//   name: string;
//   description: string;
//   category: string;
//   price: number;
//   image: any;
// }

// interface CartItem extends Product {
//   quantity: number;
// }

// const socket = io("http://localhost:3001", {
//   reconnectionAttempts: 3, // Ensure reconnection on failures
//   timeout: 10000, // Set connection timeout
// });

// export default function InvoicePage() {
//   const [cart, setCart] = useState<any[]>([]);
//   const [sales, setSales] = useState<any[]>([]);
//   const [totalSales, setTotalSales] = useState(0);
//   const [username, setUsername] = useState("Cashier1"); // Replace with dynamic username if available
//   const [products, setProducts] = useState<Product[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<string>("");
//   const [chatMessages, setChatMessages] = useState<any[]>([]);
  

//   useEffect(() => {
//     async function fetchProducts() {
//       const data = await client.fetch(`*[_type == "product"]{
//         _id, name, description, category, price, image
//       }`);
//       setProducts(data);
//     }
//     fetchProducts();
//   }, []);


//   // Filtered products based on category
//   const filteredProducts = selectedCategory
//     ? products.filter((p) => p.category === selectedCategory)
//     : products;

//   // Add item to cart
//   const addItems = (product: any) => {
//     const updatedCart = [...cart];
//     const itemIndex = updatedCart.findIndex((item) => item._id === product._id);
//     if (itemIndex > -1) {
//       updatedCart[itemIndex].quantity++;
//     } else {
//       updatedCart.push({ ...product, quantity: 1 });
//     }
//     setCart(updatedCart);
//   };

//   // Remove item from cart
//   const removeItem = (product: any) => {
//     const updatedCart = cart
//       .map((item) =>
//         item._id === product._id ? { ...item, quantity: item.quantity - 1 } : item
//       )
//       .filter((item) => item.qty > 0);
//     setCart(updatedCart);
//   };

//   const totalAmount = cart.reduce((a, c) => a + c.quantity * c.price, 0);

  
//   const handlePrintInvoice = () => {
//     if (cart.length === 0) {
//       alert("Cart is empty. Please add items.");
//       return;
//     }

//     const aggregatedSales = cart.reduce((acc: any[], item: any) => {
//       const existing = acc.find((sale) => sale._id === item._id);
//       if (existing) {
//         existing.qty += item.quantity; // ✅ Change `quantity` to `qty`
//         existing.total += item.quantity * item.price;
//       } else {
//         acc.push({ 
//           _id: item._id,  // Ensure ID is present
//           product: item.product,  // ✅ Ensure product name is included
//           qty: item.quantity,  
//           price: item.price,  // ✅ Ensure price is included
//           total: item.quantity * item.price  
//         });
//       }
//       return acc;
//     }, []);

//     setSales(aggregatedSales);
//     setTotalSales(aggregatedSales.reduce((sum, item) => sum + item.total, 0));

//     setCart([]); // Reset cart after printing
//     window.print();
// };

// const handleSendSalesUpdate = (totalSales: number) => {
//   if (!socket) return;

//   // ✅ Ensure sales state holds sales data (products, qty, price)
//   const salesItems = sales.map((item) => ({
//     product: item.product,
//     qty: Number(item.qty) || 0,  // ✅ Ensure `qty` is a number
//     price: Number(item.price) || 0,
//   }));

//   socket.emit("dailySales", {
//     username: "Cashier",
//     totalSales: Number(totalSales) || 0,
//     items: salesItems,  // ✅ Send correctly formatted items
//   });

//   setChatMessages((prevMessages) => [
//     ...prevMessages,
//     {
//       message: `Sales update from You`,
//       username: "You",
//       type: "sales",
//       items: salesItems,
//       totalSales,
//     },
//   ]);

//   setSales([]); // ✅ Reset sales after sending
// };

  
  
  
//     return (
//     <>
//       <div className="flex min-h-screen bg-slate-100 flex-col items-center p-6 sm:p-10">
//         <div className="container mx-auto">
//           <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
//             {/* Menu Items */}
//             <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
//               {filteredProducts.map((product) => (
//                 <div
//                   key={product._id}
//                   className="card h-full bg-white w-full shadow-sm p-3 rounded-md"
//                 >
//                   <div className="relative">
//                     {product.image && product.image[0] ? (
//                       <Image
//                         src={urlFor(product.image[0]).url()}
//                         alt={product.name}
//                         width={100}
//                         height={100}
//                         className="object-cover w-full h-32 sm:h-40"
//                       />
//                     ) : (
//                       <div>No Image Available</div>
//                     )}
//                     <button
//                       onClick={() => addItems(product)}
//                       className="absolute top-2 right-2 bg-red-500 p-2 rounded-full text-white"
//                     >
//                       <FaPlus />
//                     </button>
//                   </div>
//                   <div className="pt-3">
//                     <div className="flex justify-between">
//                       <span>{product.name}</span>
//                       <span className="text-red-500">N{product.price}</span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Cart and Sales Column */}
//             <div className="lg:col-span-2 flex flex-col space-y-6">
//               {/* Cart Section */}
//               <div className="bg-white shadow-sm p-3 rounded-md">
//                 {cart.map((product) => (
//                   <div
//                     key={product._id}
//                     className="flex justify-between mb-4 items-center"
//                   >
//                     <span>{product.name}</span>
//                     <div className="flex items-center space-x-4">
//                       <button
//                         onClick={() => addItems(product)}
//                         className="bg-red-500 p-2 rounded-full text-white"
//                       >
//                         <FaPlus />
//                       </button>
//                       <span>{product.quantity}</span>
//                       <button
//                         onClick={() => removeItem(product)}
//                         className="bg-red-500 p-2 rounded-full text-white"
//                       >
//                         <FaMinus />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//                 <div className="flex justify-between mt-4">
//                   <span>Total</span>
//                   <span>N{totalAmount}</span>
//                 </div>
//                 <button
//                   onClick={handlePrintInvoice}
//                   className="w-full bg-blue-500 text-white p-3 mt-4 rounded-md"
//                 >
//                   Print Invoice
//                 </button>
//               </div>

//               {/* Sales Section */}
//               <div className="bg-white shadow-sm p-3 rounded-md">
//                 <h3 className="text-lg font-medium">Sales</h3>
//                 {sales.map((item: any) => (
//                   <div
//                     key={item._id}
//                     className="flex justify-between mb-2"
//                   >
//                     <span>{item.product}</span>
//                     <span>{item.qty}x</span>
//                     <span>N{item.total}</span>
//                   </div>
//                 ))}
//                 <div className="flex justify-between mt-4">
//                   <span>Total Sales</span>
//                   <span>N{totalSales}</span>
//                 </div>
//                   <button onClick={() => handleSendSalesUpdate(
//                     // sales.map((item) => (
//   //                   {
//   //   product: item.product,
//   //   qty: item.qty,
//   //   price: item.price,
//   // })),
//   totalSales)} className="w-full bg-green-500 text-white p-3 mt-4 rounded-md">Send Sales Update</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { FaPlus, FaMinus } from "react-icons/fa";
import { createClient } from "@sanity/client";
import { io } from "socket.io-client";
import { useSession } from "next-auth/react";

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
  reconnectionAttempts: 3,
  timeout: 10000,
});

export default function InvoicePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [username, setUsername] = useState("Cashier1");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [canPost, setCanPost] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchProducts() {
      const data = await client.fetch(`*[_type == "product"]{
        _id, name, description, category, price, image
      }`);
      setProducts(data);
    }
    fetchProducts();
  }, []);

  // useEffect(() => {
  //   fetch(`/api/vendor/can-post-sales?vendorId=${vendorId}`)
  //     .then((res) => res.json())
  //     .then((data) => setCanPost(data.canPostSales));
  // }, []);

  useEffect(() => {
    if (session?.user?.id) return; // ✅ Ensure `_id` is available
  
    const fetchCashierCanPostSales = async () => {
      try {
        const res = await fetch(`/api/vendor/cashiers?id=${session?.user?.id}`); 
        const data = await res.json();
        setCanPost(data.canPostSales);
      } catch (error) {
        console.error("Error fetching canPostSales:", error);
      }
    };
  
    fetchCashierCanPostSales();
  }, [session?.user?.id]); // ✅ Runs when `_id` is available
  
  

  // Filtered products based on category
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  // Add item to cart
  const addItems = (product: Product) => {
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
  const removeItem = (product: Product) => {
    const updatedCart = cart
      .map((item) =>
        item._id === product._id ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0); // ✅ Fix: Correct filter condition
    setCart(updatedCart);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  // ✅ Fixed: Print Invoice & Update Sales Data
  const handlePrintInvoice = () => {
    if (cart.length === 0) {
      alert("Cart is empty. Please add items.");
      return;
    }
  
    // Merge new cart items with existing sales
    const updatedSales = cart.reduce((acc: any[], item: CartItem) => {
      const existing = acc.find((sale) => sale._id === item._id);
  
      if (existing) {
        existing.qty += item.quantity;
        existing.total += item.quantity * item.price;
      } else {
        acc.push({
          _id: item._id,
          //name: item.name, // ✅ Ensure product name is included
          product: item.name,
          qty: item.quantity,
          price: item.price,
          total: item.quantity * item.price,
        });
      }
      return acc;
    }, [...sales]); // ✅ Start with existing sales data
  
    setSales(updatedSales);
    setTotalSales(updatedSales.reduce((sum, item) => sum + item.total, 0));
  
    setCart([]); // ✅ Empty cart after printing
    window.print();
  };
 
  // ✅ Fixed: Send Sales Data to Group Chat
  const handleSendSales = () => {
    if (sales.length === 0) {
      alert("No sales data to send.");
      return;
    }
  
    const salesData = {
      username,
      sales, // ✅ Ensure this matches server expectation
      totalSales,
    };
  
    if (socket.connected) {
      socket.emit("dailySales", salesData);
      console.log("📤 Sales data sent:", salesData);
    } else {
      console.error("❌ Socket not connected");
    }
    setSales([]);
  };
  

  return (
    <div className="flex min-h-screen bg-slate-100 flex-col items-center p-6 sm:p-10">
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

      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Product Menu */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredProducts.map((product) => (
              <div key={product._id} className="card bg-white shadow-sm p-3 rounded-md">
                <div className="relative">
                  {product.image && product.image[0] ? (
                    <Image
                      src={urlFor(product.image[0]).url()}
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
                <div className="pt-3 flex justify-between">
                  <span>{product.name}</span>
                  <span className="text-red-500">N{product.price}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Cart and Sales */}
          <div className="lg:col-span-2 flex flex-col space-y-6">
            {/* Cart Section */}
            <div className="bg-white shadow-sm p-3 rounded-md">
              {cart.map((product) => (
                <div key={product._id} className="flex justify-between mb-4 items-center">
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
              <button onClick={handlePrintInvoice} className="w-full bg-blue-500 text-white p-3 mt-4 rounded-md">
                Print Invoice
              </button>
            </div>

            {/* Sales Section */}
            <div className="bg-white shadow-sm p-3 rounded-md">
              <h3 className="text-lg font-medium">Sales</h3>
              {sales.map((item) => (
                <div key={item._id} className="flex justify-between mb-2">
                  <span>{item.name}</span> {/* ✅ Fixed `item.product` -> `item.name` */}
                  <span>{item.qty}x</span>
                  <span>N{item.total}</span>
                </div>
              ))}
              <div className="flex justify-between mt-4">
                <span>Total Sales</span>
                <span>N{totalSales}</span>
              </div>
              <button 
              onClick={handleSendSales} 
              disabled={!canPost}
              //className="w-full bg-green-500 text-white p-3 mt-4 rounded-md"
              className={`w-full px-4 py-2 rounded ${
                canPost ? "bg-green-500" : "bg-gray-400 cursor-not-allowed"
              }`}
              >
                Send to Group
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

