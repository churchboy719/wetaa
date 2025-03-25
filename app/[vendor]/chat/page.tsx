// "use client";
// import { useEffect, useState } from "react";
// import { io } from "socket.io-client";
// import { useSession } from "next-auth/react";

// const socket = io();

// export default function GroupChat() {
//   const { data: session } = useSession();
//   const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [currentHandler, setCurrentHandler] = useState("");

//   useEffect(() => {
//     socket.on("receiveMessage", (data) => {
//       setMessages((prev) => [...prev, data]);
//     });

//     socket.on("orderHandled", ({ orderId, cashierName }) => {
//       setCurrentHandler(cashierName);
//     });

//     return () => {
//       socket.off("receiveMessage");
//       socket.off("orderHandled");
//     };
//   }, []);

//   const sendMessage = () => {
//     if (newMessage.trim() === "") return;
//     socket.emit("sendMessage", { sender: session?.user?.name, text: newMessage });
//     setNewMessage("");
//   };

//   const handleOrderClick = (orderId: string) => {
//     socket.emit("orderClicked", orderId, session?.user?.name);
//   };

//   return (
//     <div className="flex h-screen">
//       {/* Sidebar */}
//       <div className="w-1/4 bg-gray-900 text-white p-4">
//         <h2 className="text-lg font-bold">Chat Menu</h2>
//         <ul>
//           <li className="py-2">Group Chat</li>
//           <li className="py-2">Orders</li>
//         </ul>
//       </div>

//       {/* Main Chat Window */}
//       <div className="w-3/4 p-4">
//         <h2 className="text-xl font-bold">Group Chat</h2>
//         {currentHandler && (
//           <p className="text-blue-500 font-bold">Order is being handled by: {currentHandler}</p>
//         )}

//         <div className="border p-4 h-96 overflow-y-scroll bg-gray-100">
//           {messages.map((msg, index) => (
//             <div key={index} className="mb-2">
//               <strong>{msg.sender}:</strong> {msg.text}
//             </div>
//           ))}
//         </div>

//         <div className="flex mt-4">
//           <input
//             type="text"
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             placeholder="Type a message..."
//             className="flex-grow p-2 border rounded"
//           />
//           <button onClick={sendMessage} className="bg-blue-500 text-white p-2 ml-2 rounded">
//             Send
//           </button>
//         </div>

//         {/* Example Orders (Clickable) */}
//         <div className="mt-4">
//           <h3 className="text-lg font-bold">Orders</h3>
//           <ul>
//             <li className="cursor-pointer text-blue-600" onClick={() => handleOrderClick("order1")}>
//               Order #1 - Table 4
//             </li>
//             <li className="cursor-pointer text-blue-600" onClick={() => handleOrderClick("order2")}>
//               Order #2 - Table 7
//             </li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Navbar from "@/app/components/Navbar";


export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {

    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);
      // reconnectionAttempts: 3,
      // timeout: 10000,
  
    
    newSocket.on("chatMessage", (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleSend = () => {
    if (message.trim()) {
      socket.emit("chatMessage", message);
      setMessages((prev) => [...prev, `You: ${message}`]);
      setMessage("");
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded mb-2 ${
                msg.startsWith("You:") ? "bg-blue-100 self-end" : "bg-gray-200"
              }`}
            >
              {msg}
            </div>
          ))}
        </div>
        <div className="flex p-4 bg-gray-800">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow p-2 rounded-l-md"
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
</>
  )};