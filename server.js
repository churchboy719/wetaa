import { Server } from "socket.io";

const io = new Server(3001, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  // 🔹 Fix: Standardize event names
  socket.on("chatMessage", (data) => {
    console.log("💬 Chat message received:", data);
    io.emit("chatMessage", data); // Broadcast to ALL clients
  });

  socket.on("orders", (orderData) => {
    console.log("📦 Order received:", orderData);
    io.emit("orders", orderData); // Broadcast orders correctly
  });

  socket.on("cashierMessage", (data) => {
    console.log("🧑‍🍳 Cashier message received:", data);
    io.emit("cashierMessage", data);
  });

  socket.on("dailySales", (salesData) => {
    console.log(`📊 Sales data received from ${salesData.username}:`, salesData);
  
    // ✅ Ensure the frontend listens to the same event name
    io.emit("dailySales", salesData);
  });
  
  
//   socket.on("dailySales", (data) => {
//     console.log(`📊 Sales update received from ${data.username}:`, data);
  
//     // ✅ Emit full sales data back to clients
//     io.emit("dailySales", {
//       username: data.username,
//       totalSales: data.totalSales,
//       items: data.items, // Ensure items are included
//     });
// });

socket.on("dailySales", (data) => {
  console.log(`Sales data received from ${data.username}:`, data);
  io.emit("cashierGroup", {
    username: data.username,
    sales: data.sales,
    totalSales: data.totalSales,
  });
});

// socket.on("dailySales", (data) => {
//   console.log(`📊 Sales update received from ${data.username}:`, data);

//   // ✅ Ensure `items` are correctly structured
//   // const formattedItems = data.items?.map(item => ({
//   //     product: item.product || "Unknown", 
//   //     qty: Number(item.qty) || 0,
//   //     price: Number(item.price) || 0,
//   // })) || [];

//   // ✅ Emit structured data
//   io.emit("dailySales", {
//       username: data.username,
//       totalSales: Number(data.totalSales) || 0,
//       items: formattedItems,
//   });
// });



  socket.on("disconnect", () => {
    console.log("🔴 A user disconnected:", socket.id);
  });
});
