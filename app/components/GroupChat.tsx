"use client";

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Navbar from "@/app/components/Navbar";
import { useSession } from "next-auth/react";
import html2canvas from "html2canvas";

type Order = {
  tableNumber: string;
  orders: { product: string; qty: number }[];
};

type SalesData = {
  username: string;
  totalSales: number;
  sales: { product: string; qty: number; price: number }[];
};

type Message = {
  message: string;
  username: string;
  type: "cashier" | "customer" | "order" | "sales";
  items?: { product: string; qty: number; price: number }[];
  totalSales?: number;
};

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const { data: session, status }: any = useSession();
  const chatRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    newSocket.on("orders", (orderData: Order) => {
      const newMessage: Message = {
        message: `Order from Table #${orderData.tableNumber}: 
        ${orderData.orders.map((o) => `${o.product} x ${o.qty}`).join(", ")}`,
        username: "System",
        type: "order",
      };
      setChatMessages((prev) => [...prev, newMessage]);
    });

    newSocket.on("message", (msg: string) => {
      setChatMessages((prev) => [
        ...prev,
        { message: msg, username: "Cashier", type: "cashier" },
      ]);
    });

    newSocket.on("chatMessage", (msg: { message: string; username: string }) => {
      setChatMessages((prev) => [
        ...prev,
        { message: msg.message, username: msg.username, type: "customer" },
      ]);
    });


    const handleSalesUpdate = (data: SalesData) => {
      console.log("📊 Sales update received:", data);
    
      if (!data.sales || data.sales.length === 0) {
        console.warn("⚠️ No sales data received.");
        return;
      }
    
      setChatMessages((prevMessages) => {
        const existingSalesMessage = prevMessages.find((msg) => msg.type === "sales");
    
        if (existingSalesMessage) {
          const updatedItems = [...existingSalesMessage.items!, ...data.sales]; // ✅ Use 'data.sales'
    
          const updatedTotalSales =
            (existingSalesMessage.totalSales || 0) + data.totalSales;
    
          return prevMessages.map((msg) =>
            msg.type === "sales"
              ? { ...msg, items: updatedItems, totalSales: updatedTotalSales }
              : msg
          );
        } else {
          const newMessage: Message = {
            message: `Sales update from ${data.username}`,
            username: data.username,
            type: "sales",
            items: data.sales, // ✅ Correct field
            totalSales: data.totalSales,
          };
          return [...prevMessages, newMessage];
        }
      });
    };
    
    // ✅ Correct event name and add listener
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
    return (
      <div className="text-center mt-10 text-red-500">
        Unauthorized access. Please log in.
      </div>
    );
  }

  const handleSaveAsJPG = async (index: number) => {
    if (!chatRefs.current[index]) return;

    const chatMessageDiv = chatRefs.current[index]!;
    const button = chatMessageDiv.querySelector(".save-btn") as HTMLElement | null;
    if (button) button.style.display = "none";

    const canvas = await html2canvas(chatMessageDiv);
    const imgData = canvas.toDataURL("image/jpeg");

    if (button) button.style.display = "block";

    const link = document.createElement("a");
    link.href = imgData;
    link.download = `sales-report-${index}.jpg`;
    link.click();
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 overflow-y-auto p-4">
          {chatMessages.length > 0 ? (
            chatMessages.map((msg, idx) => {
              let bgColor = "bg-gray-200";
              let textColor = "text-black";
              let alignment = "justify-start";

              switch (msg.type) {
                case "cashier":
                  bgColor = "bg-blue-500";
                  textColor = "text-white";
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
                <div key={idx} className={`flex flex-col ${alignment} mb-2`}>
                  <div
                    ref={(el) => {
                      chatRefs.current[idx] = el;
                    }}
                    className={`p-4 rounded-lg shadow-md ${bgColor} ${textColor}`}
                  >
                    <strong>{msg.username}:</strong>
                    {msg.type === "sales" && msg.items ? (
                      <ul className="mt-2 text-sm">
                        {msg.items.map((item, index) => (
                          <li key={index}>
                            {item.product} x {item.qty} ={" "}
                            <strong>N{item.qty * item.price}</strong>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>{msg.message}</p>
                    )}
                    {msg.totalSales !== undefined && (
                      <p className="font-bold mt-2">Total Sales: N{msg.totalSales}</p>
                    )}
                  </div>

                  {msg.type === "sales" && (
                    <button
                      onClick={() => handleSaveAsJPG(idx)}
                      className="save-btn bg-green-600 text-white px-3 py-1 mt-2 rounded shadow"
                    >
                      Save as JPG
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">No messages yet.</p>
          )}
        </div>

        <div className="p-4 bg-gray-800 flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            type="text"
            placeholder="Type a message"
            className="flex-1 border p-2 rounded text-black"
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() =>
              socket.emit("chatMessage", {
                message,
                username: "Cashier",
                type: "cashier",
              })
            }
          >
            Send Message
          </button>
        </div>
      </div>
    </>
  );
}
