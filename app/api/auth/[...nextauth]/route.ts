import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/app/lib/mongodb";
import Vendor from "@/app/models/vendor";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import User from "@/app/models/user";
import bcrypt from "bcryptjs";
import { clientPromise } from "@/app/lib/mongodb";
import NextAuth from "next-auth";
import type { SessionStrategy } from "next-auth";

connectDB();

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials:any) {
        await connectDB();
        const { email, password }:any = credentials;

        // Check if user is vendor
        let user:any = await Vendor.findOne({ email });
        if (!user) {
          // Check if user is a cashier
          user = await User.findOne({ email });
        }

        if (!user) throw new Error("Invalid credentials");

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) throw new Error("Invalid credentials");

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role || "vendor",
          vendorId: user.vendorId || null, // Ensure vendorId is included
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }:any) {
      if (user) {
        token.vendorId = user.vendorId ? user.vendorId : undefined; // Avoid setting null
        token.role = user.role || "cashier"; // Ensure role exists
      }
      return token;
    },
    async session({ session, token }:any) {
      if (token.vendorId) {
        session.user.vendorId = token.vendorId;
      }
      session.user.role = token.role || "cashier"; // Ensure role exists
      return session;
    }
  },
    
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  pages: {
    signIn: "/vendor/login",
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };