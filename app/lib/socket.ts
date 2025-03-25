// // import { Server } from "socket.io";
// // import type { NextApiRequest, NextApiResponse } from "next";
// // import type { Server as HttpServer } from "http";
// // import type { Socket as NetSocket } from "net";

// // // Define a custom server type to include io
// // interface CustomSocketServer extends HttpServer {
// //   io?: Server;
// // }

// // interface CustomNextApiResponse extends NextApiResponse {
// //   socket: NetSocket & {
// //     server: CustomSocketServer;
// //   };
// // }

// // export default function SocketHandler(req: NextApiRequest, res: CustomNextApiResponse) {
// //   if (res.socket.server.io) {
// //     console.log("Socket.IO server already initialized.");
// //   } else {
// //     console.log("Initializing Socket.IO server...");

// //     const io = new Server(res.socket.server as HttpServer, {
// //       path: "/api/socket",
// //       cors: { origin: "*", methods: ["GET", "POST"] },
// //     });

// //     io.on("connection", (socket) => {
// //       console.log("New client connected:", socket.id);

// //       socket.on("sendMessage", (message) => {
// //         io.emit("receiveMessage", message);
// //       });

// //       socket.on("orderClicked", ({ orderId, cashierName }) => {
// //         io.emit("orderHandled", { orderId, cashierName });
// //       });

// //       socket.on("disconnect", () => {
// //         console.log("Client disconnected:", socket.id);
// //       });
// //     });

// //     res.socket.server.io = io;
// //   }

// //   res.end();
// // }

// import { Server } from "socket.io";
// import type { NextApiRequest, NextApiResponse } from "next";
// import type { Server as HttpServer } from "http";
// import type { Socket as NetSocket } from "net";

// // Define a custom server type to include io
// interface CustomSocketServer extends HttpServer {
//   io?: Server;
// }

// interface CustomNextApiResponse extends NextApiResponse {
//   socket: NetSocket & {
//     server: CustomSocketServer;
//   };
// }

// export default function SocketHandler(req: NextApiRequest, res: CustomNextApiResponse) {
//   if (res.socket.server.io) {
//     console.log("Socket.IO server already initialized.");
//   } else {
//     console.log("Initializing Socket.IO server...");

//     const io = new Server(res.socket.server as HttpServer, {
//       path: "/api/lib/socket",
//       cors: { origin: "*", methods: ["GET", "POST"] },
//     });

//     io.on("connection", (socket) => {
//       console.log("New client connected:", socket.id);

//       // Listen for all messages and broadcast them
//       socket.on("message", (data) => {
//         console.log("New message:", data);
//         io.emit("message", data); // Send to all connected clients
//       });

//       // Handle order clicks by cashiers
//       socket.on("orderClicked", ({ orderId, cashierName }) => {
//         io.emit("orderHandled", { orderId, cashierName });
//       });

//       socket.on("disconnect", () => {
//         console.log("Client disconnected:", socket.id);
//       });
//     });

//     res.socket.server.io = io;
//   }

//   res.end();
// }

import { Server } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HttpServer } from "http";
import type { Socket as NetSocket } from "net";

// Define a custom server type to include io
interface CustomSocketServer extends HttpServer {
  io?: Server;
}

interface CustomNextApiResponse extends NextApiResponse {
  socket: NetSocket & {
    server: CustomSocketServer;
  };
};

type Order = {
  tableNumber: string;
  orders: { product: string; qty: number }[];
};

type Message = {
  message: string;
  username: string;
  type: "cashier" | "customer" | "order" | "sales";
};

export default function SocketHandler(req: NextApiRequest, res: CustomNextApiResponse) {
  if (res.socket.server.io) {
    console.log("✅ Socket.IO server already initialized.");
  } else {
    console.log("🚀 Initializing Socket.IO server...");

    // const io = new Server(res.socket.server as HttpServer, {
    //   path: "/api/lib/socket",
    //   cors: { origin: "*", methods: ["GET", "POST"] },
    // });

    // io.on("connection", (socket) => {
    //   console.log("🔗 New client connected:", socket.id);

    //   // Handle receiving chat messages
    //   socket.on("message", (msg) => {
    //     console.log("📩 Message received:", msg);
        
    //     // Broadcast message to all connected users (including sender)
    //     io.emit("message", msg);
    //   });

    //   // Orders sent by customers
    //   socket.on("orders", (orderData) => {
    //     console.log("🛒 New Order received:", orderData);

    //     const orderMessage = {
    //       message: `Order from Table #${orderData.tableNumber}: ${orderData.orders
    //         .map((o:any) => `${o.product} x ${o.qty}`)
    //         .join(", ")}`,
    //       username: "System",
    //       type: "order",
    //     };

    //     io.emit("receiveMessage", orderMessage); // Send to all users
    //   });

    //   // Cashiers sending messages
    //   socket.on("message", (msg) => {
    //     console.log("👨‍💼 Cashier message received:", msg);
        
    //     io.emit("message", {
    //       //message: cashierMessage,
    //       username: "Cashier",
    //       message: msg,
    //       type: "cashier",
    //     });
    //   });

    //   // Handling disconnection
    //   socket.on("disconnect", () => {
    //     console.log("❌ Client disconnected:", socket.id);
    //   });
    // });

    const io = new Server(3001, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    
    io.on("connection", (socket) => {
      console.log("A user connected");
    
      socket.on("orders", (orderData) => {
        console.log("Order received:", orderData);
        io.emit("orders", orderData);
      });
    
      socket.on("message", (msg:string) => {
        console.log("Message received:", msg);
        io.emit("message", msg);
      });
    
      socket.on("chatMessage", (message) => {
        console.log("Chat message received:", message);
        io.emit("chatMessage", message);
      });
    
      socket.on("dailySales", (data) => {
        console.log(`Sales data received from ${data.username}:`, data);
        io.emit("cashierGroup", {
          username: data.username,
          sales: data.sales,
          totalSales: data.totalSales,
        });
      });
    
      socket.on("disconnect", () => {
        console.log("A user disconnected");
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}
