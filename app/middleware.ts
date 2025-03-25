// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/vendor/login",
  },
  callbacks: {
    authorized: ({ token }) => {
      // Example: Protect vendor dashboard
      if (token?.role === "vendor") {
        return true;
      }
      // Example: Protect cashier pages
      if (token?.role === "cashier" && token?.vendorId) {
        return true;
      }
      return false;
    },
  },
});
