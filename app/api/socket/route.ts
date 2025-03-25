import { NextRequest } from "next/server";
import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import type { Socket as NetSocket } from "net";

// Define a custom server type to include io
interface CustomSocketServer extends HttpServer {
  io?: Server;
}

type Order = {
  tableNumber: string;
  orders: { product: string; qty: number }[];
};

type Message = {
  message: string;
  username: string;
  type: "cashier" | "customer" | "order" | "sales";
};

export async function GET(req: NextRequest) {
  if (!(global as any).io) {
    console.log("🚀 Initializing Socket.IO server...");

    const io = new Server((req as any).socket.server as HttpServer, {
      path: "/api/socket",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("🟢 A user connected:", socket.id);

      // Broadcast orders
      socket.on("orders", (orderData: Order) => {
        console.log("📦 Order received:", orderData);
        io.emit("orders", orderData);
      });

      // Chat messages
      socket.on("chatMessage", (message: string) => {
        console.log("💬 Chat message received:", message);
        io.emit("chatMessage", message);
      });

      // Cashier sales updates
      socket.on("dailySales", (data) => {
        console.log(`💰 Sales data received from ${data.username}:`, data);
        io.emit("cashierGroup", {
          username: data.username,
          sales: data.sales,
          totalSales: data.totalSales,
        });
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("🔴 A user disconnected:", socket.id);
      });
    });

    (global as any).io = io;
  } else {
    console.log("✅ Socket.IO is already running");
  }

  return new Response("Socket.IO Server is running.", { status: 200 });
}
