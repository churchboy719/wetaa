
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import {clientPromise} from "@/app/lib/mongodb"; // Ensure this uses `export default`
import Vendor from "@/app/models/vendor";
import User from "@/app/models/user";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import mongoose from "mongoose";

const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "example@domain.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        // Check if user is a Vendor or Cashier
        const vendor = await Vendor.findOne({ email: credentials.email }).lean();
        const cashier = await User.findOne({ email: credentials.email }).lean();

        const user: any = vendor || cashier;
        if (!user) throw new Error("User not found");

        // Verify password
        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isValidPassword) throw new Error("Invalid credentials");

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: vendor ? "vendor" : "cashier",
          vendorId: vendor ? user._id.toString() : user.vendorId, // Vendors use their own ID
        };
      },
    }),
  ],
//   callbacks: {
//     async jwt({ token, user }: any) {
//       if (user) {
//         token.role = user.role;
//         token.vendorId = user.vendorId;
//       }
//       return token;
//     },
//     async session({ session, token }: any) {
//       if (session.user) {
//         session.user.role = token.role;
//         session.user.vendorId = token.vendorId;
//       }
//       return session;
//     },
//   },

callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.vendorId = user.vendorId ? new mongoose.Types.ObjectId(user.vendorId) : null; // ✅ Ensure ObjectId
        token.role = user.role || "cashier"; // ✅ Add role
      }
      return token;
    },
    async session({ session, token }: any) {
      session.user.vendorId = token.vendorId || null;
      session.user.role = token.role || "cashier"; // ✅ Include role in session
      return session;
    }
  },
  pages: {
    signIn: "/vendor/login",
  },
  session: {
    strategy: "jwt" as const, // Fix type issue
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
