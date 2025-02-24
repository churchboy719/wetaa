"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CashierDashboard() {
  const { data: session, status }:any = useSession<any>();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated" || session?.user.role !== "cashier") {
      router.push("/vendor/login");
    }
  }, [status, session, router]);

  if (status === "loading") return <p>Loading...</p>;

  return <h1>Welcome Cashier {session.user.name}</h1>;
}
