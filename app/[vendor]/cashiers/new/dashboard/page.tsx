
"use client";

import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import InvoicePage from "@/app/[vendor]/invoice/page";


//const newSocket = io("http://localhost:3001");

type Order = {
  tableNumber: string;
  orders: { product: string; qty: number }[];
};

type SalesData = {
  username: string;
  totalSales: number;
  items: { product: string; qty: number; price: number }[];
};

type Message = {
  message: string;
  username: string;
  type: "cashier" | "customer" | "order" | "sales";
  items?: { product: string; qty: number; price: number }[];
  totalSales?: number;
};


export default function Cashier() {
  const router = useRouter();
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [message, setMessage] = useState("");
  const { data: session, status }:any = useSession<any>();
  const [cashierMessage, setCashierMessage] = useState("");


  useEffect(() => {

    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);


    newSocket.on("orders", (orderData: Order) => {
      console.log("Order received:", orderData);
      const orderMessage: Message = {
        message: `Order from Table #${orderData.tableNumber}: ${orderData.orders
          .map((o) => `${o.product} x ${o.qty}`)
          .join(", ")}`,
        username: "System",
        type: "order",
      };
      setChatMessages((prevMessages) => [...prevMessages, orderMessage]);
    });


    newSocket.on("chatMessage", (msg: { message: string; username: string }) => {
      console.log("💬 Customer message received:", msg);
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { message: msg.message, username: msg.username, type: "customer" },
      ]);
    });
    
    newSocket.on("cashierMessage", (msg: { message: string; username: string }) => {
      console.log("🧑‍🍳 Cashier message received:", msg);
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { message: msg.message, username: msg.username, type: "cashier" },
      ]);
    });
    
    const handleSalesUpdate = (data: SalesData) => {
      console.log("📊 Sales update received:", data);

      const salesDetails = data.items
        .map((item) => {
          const qty = Number(item.qty) || 0;
          const price = Number(item.price) || 0;
          return `${item.product} x ${qty} = N${qty * price}`;
        })
        .join(", ");

      const message: Message = {
        message: `Sales update from ${data.username}: ${salesDetails}`,
        username: data.username,
        type: "sales",
        items: data.items.map((item) => ({
          product: item.product,
          qty: Number(item.qty) || 0,
          price: Number(item.price) || 0,
        })),
        totalSales: Number(data.totalSales) || 0,
      };

      setChatMessages((prevMessages) => [...prevMessages, message]);
    };

    newSocket.on("dailySales", handleSalesUpdate);

    return () => {
      newSocket.off("dailySales", handleSalesUpdate);
      newSocket.disconnect();
    };

  }, []);

  if (status === "loading") {
    return <div className="text-center mt-10">Loading...</div>;
  }
  
  if (!session || !session.user) {
    return <div className="text-center mt-10 text-red-500">Unauthorized access. Please log in.</div>;
  }
  
  const handleSendMessage = () => {
    if (!message.trim()) return;
  
    socket.emit("cashierMessage", {
      message,
      username: "Cashier",
      type: "cashier",
    });
  
    setChatMessages((prevMessages) => [
      ...prevMessages,
      { message, username: "You", type: "cashier" },
    ]);
    setMessage("");
  };
  

  return (
    <div className="h-screen flex flex-col">
      <h1>Welcome Cashier {session.user.name}</h1>
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-gray-100">
        <h1 className="text-2xl font-bold text-black">Cashier Dashboard</h1>
        <button onClick={() => router.push(`/vendor/invoice`)} className="btn text-black">
      Go to Invoice
    </button>
         {/* <Link href={"@/app/[vendor]/invoice/page"} className="bg-blue-500 text-white px-4 py-2 rounded">
          Invoice
        </Link> */}
        </div> 

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
  {chatMessages.length > 0 ? (
    chatMessages.map((msg, idx) => {
      try {
        if (
          typeof msg.message !== "string" ||
          typeof msg.username !== "string" ||
          typeof msg.type !== "string"
        ) {
          throw new Error("Invalid message format");
        }

        let bgColor = "bg-gray-200";
        let textColor = "text-black";
        let alignment = "justify-start";

        switch (msg.type) {
          case "cashier":
            bgColor = "bg-blue-500";
            textColor = "text-black";
            alignment = "justify-end";
            break;
          case "customer":
            bgColor = "bg-gray-300";
            alignment = "justify-start";
            break;
          case "order":
             bgColor = "bg-yellow-400";
            textColor = "text-black";
            alignment = "justify-start";
            break;
          case "sales":
            bgColor = "bg-green-400";
            textColor = "text-black";
            alignment = "justify-start";
            break;
        }

        return (
          <div key={idx} className={`flex ${alignment} mb-2`}>
            <div className={`p-2 rounded-lg shadow-md ${bgColor} ${textColor}`}>
              <strong>{msg.username}: </strong>
              <span>{msg.message}</span>
            </div>
          </div>
        );
      } catch (error) {
        console.error(error);
        return null;
      }
    })
  ) : (
    <p className="text-gray-500">No messages yet.</p>
  )}
</div>

      {/* Input Box */}
      <div className="p-4 bg-gray-800 flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          type="text"
          placeholder="Type a message"
          className="flex-1 border text p-2 rounded text-black"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleSendMessage}
        >
          Send Message
        </button>
      </div>
      </div>
  );


}
