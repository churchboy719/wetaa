import mongoose from "mongoose";
import "dotenv/config";

const MONGODB_URI = "mongodb+srv://churchboy719:julywisdom19@cluster0.3bmnp.mongodb.net/wetaa"

// console.log("Loaded MONGODB_URI:", process.env.MONGODB_URI);

// //const MONGODB_URI = process.env.MONGODB_URI || "";

// if (!MONGODB_URI) {
//   throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
// }
 
// let cached = (global as any).mongoose || { conn: null, promise: null };

// export async function connectDB() {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     cached.promise = mongoose.connect(MONGODB_URI, {}).then((mongoose) => mongoose);
//   }

//   cached.conn = await cached.promise;
//   return cached.conn;
// }



//   if (!cached.promise) {
//     console.log("⏳ Connecting to MongoDB...");
//     cached.promise = mongoose.connect(MONGODB_URI, {
//       dbName: "wetaa",
//       bufferCommands: false,
//     }).then((mongoose) => {
//       console.log("✅ MongoDB connected successfully!");
//       return mongoose;
//     }).catch((err) => {
//       console.error("❌ MongoDB connection error:", err);
//       throw err;
//     });
//   }

//   cached.conn = await cached.promise;
//   return cached.conn;
// }
// import mongoose from "mongoose";

// const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) {
    console.log("📦 Using existing database connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("⏳ Connecting to MongoDB...");
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "wetaa",
      bufferCommands: false,
    }).then((mongoose) => {
      console.log("✅ MongoDB connected successfully!");
      return mongoose;
    }).catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
