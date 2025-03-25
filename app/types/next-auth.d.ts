import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "vendor" | "cashier" | "admin";
    vendorId: string;
    //vendorId?: string;
  }

  interface Blog {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
  }

  interface Session {
    user: User;
  }
}
