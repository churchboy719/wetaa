// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import bcrypt from "bcryptjs";
// import Vendor from "@/app/models/vendor";
// import { connectDB } from "@/app/lib/mongodb";

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email", placeholder: "john@example.com" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials:any) {
//         await connectDB();
//         const vendor = await Vendor.findOne({ email: credentials?.email });
//         if (!vendor) throw new Error("Vendor not found");

//         const passwordMatch = await bcrypt.compare(credentials.password, vendor.password);
//         if (!passwordMatch) throw new Error("Invalid credentials");

//         return { id: vendor._id, name: vendor.fullName, email: vendor.email };
//       },
//     }),
//   ],
//   callbacks: {
//     async session({ session, token }:any) {
//       session.user.id = token.sub;
//       return session;
//     },
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   pages: {
//     signIn: "/vendor/login",
//   },
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

// src/app/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/app/lib/mongodb";
import Vendor from "@/app/models/vendor";
import Cashier from "@/app/models/cashier";
import bcrypt from "bcryptjs";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Email" },
        password: { label: "Password", type: "password", placeholder: "Password" },
      },
      async authorize(credentials:any) {
        await connectDB();

        let user = await Vendor.findOne({ email: credentials.email });
        if (!user) {
          user = await Cashier.findOne({ email: credentials.email });
        }

        if (!user) {
          throw new Error("User not found");
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isValidPassword) {
          throw new Error("Invalid credentials");
        }

        return { id: user._id, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }:any) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
    async jwt({ token, user }:any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/vendor/login",
  },
};

// Export named `GET` and `POST` methods for Next.js API
export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);
