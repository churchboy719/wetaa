
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import {clientPromise} from "@/app/lib/mongodb"; // Ensure this uses `export default`
import Vendor from "@/app/models/vendor";
import Cashier from "@/app/models/cashier";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";

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
        const cashier = await Cashier.findOne({ email: credentials.email }).lean();

        const user: any = vendor || cashier;
        if (!user) throw new Error("User not found");

        // Verify password
        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isValidPassword) throw new Error("Invalid credentials");

        return {
          id: user._id.toString(),
          //id: user._id?.toString() || '',
          name: user.name,
          email: user.email,
          role: vendor ? "vendor" : "cashier",
          vendorId: user.vendorId,
        };
      },
    }),
  ],
callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.vendorId = user.vendorId; // No ObjectId conversion (cashier's vendorId is String)
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.vendorId = token.vendorId || null; // Keep as String or null
      }
      return session;
    },
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
