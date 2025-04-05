// import NextAuth, { AuthOptions, SessionStrategy } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
// import { connectDB, clientPromise } from "@/app/lib/mongodb";
// import Vendor from "@/app/models/vendor";
// import Cashier from "@/app/models/cashier";
// import bcrypt from "bcryptjs";

// // ✅ Ensure MongoDB connection before making queries
// await connectDB();

// declare module "next-auth" {
//   interface User {
//     id: string;
//     name: string;
//     email: string;
//     role: "vendor" | "cashier" | "admin";
//     vendorId: string | null;
//   }

//   interface Session {
//     user: User;
//   }
// }

// export const authOptions: AuthOptions = {
//   adapter: MongoDBAdapter(clientPromise),
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email", placeholder: "email@example.com" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           throw new Error("Missing email or password");
//         }

//         await connectDB();
//         const { email, password } = credentials;

        

//         // Check if user is a Vendor or Cashier
//         const vendor = await Vendor.findOne({ email: credentials.email }).lean();
//         const cashier = await Cashier.findOne({ email: credentials.email }).lean();

//         const user: any = vendor || cashier;
//         if (!user) throw new Error("User not found");

//         // Verify password
//         const isValidPassword = await bcrypt.compare(credentials.password, user.password);
//         if (!isValidPassword) throw new Error("Invalid credentials");


//         return {
//           id: user._id.toString(),
//          // id: user._id?.toString() || '',
//           name: user.name,
//           email: user.email,
//           role: user.role || (user.vendorId ? "cashier" : "vendor"),
//           vendorId: user.vendorId,
//         } 
//         //satisfies User;
//       }
//     }),
//   ],

//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.name = user.name;
//         token.email = user.email;
//         token.role = user.role;
//         token.vendorId = user.vendorId;
//       }
//       return token;
//     },

//     async session({ session, token }:any) {
//       if (session.user) {
//         session.user.id = token.id;
//         session.user.name = token.name;
//         session.user.email = token.email;
//         session.user.role = token.role;
//         session.user.vendorId = token.vendorId;
//       }
//       return session;
//     }
//   },

//   session: {
//     //strategy: "jwt" as SessionStrategy,
//     strategy: "jwt",
//   },

//   pages: {
//     signIn: "/vendor/login",
//   },
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

import NextAuth from "next-auth";
import authOptions from "@/app/lib/authOptions"; // Adjust path if needed

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
