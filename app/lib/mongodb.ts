// import mongoose from "mongoose";
// import { MongoClient } from "mongodb"; // ✅ Import MongoClient properly
// import "dotenv/config";

// const MONGODB_URI = "mongodb+srv://churchboy719:julywisdom19@cluster0.3bmnp.mongodb.net/wetaa"

// if (!MONGODB_URI) {
//   throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
// }

// let cached = (global as any).mongoose || { conn: null, promise: null };

// export async function connectDB() {
//   if (cached.conn) {
//     console.log("📦 Using existing database connection");
//     return cached.conn;
//   }

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

// // ✅ Create clientPromise for MongoDB Adapter
// let clientPromise: Promise<MongoClient>;
// declare global {
//   var _mongoClientPromise: Promise<MongoClient>;
// }

// if (!global._mongoClientPromise) {
//   const client = new MongoClient(MONGODB_URI, {});
//   global._mongoClientPromise = client.connect();
// }
// clientPromise = global._mongoClientPromise;

// export { clientPromise }

import mongoose from "mongoose";
import { MongoClient } from "mongodb";
import "dotenv/config";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

// ✅ Caching Mongoose connection
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

// ✅ MongoDB Adapter Client for NextAuth
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;
if (!global._mongoClientPromise) {
  console.log("⏳ Connecting MongoDB Client...");
  const client = new MongoClient(MONGODB_URI);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export { clientPromise };
