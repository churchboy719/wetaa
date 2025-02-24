"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Cashier = {
  _id: string;
  name: string;
  email: string;
  active: boolean;
  canPost: boolean;
};

export default function CashiersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cashiers, setCashiers] = useState<Cashier[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/vendor/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchCashiers() {
      try {
        const res = await fetch(`/api/vendor/cashiers`);
        if (!res.ok) throw new Error("Failed to fetch cashiers");
        const data = await res.json();
        setCashiers(data.cashiers);
      } catch (error) {
        console.error(error);
      }
    }
    fetchCashiers();
  }, []);

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch(`/api/vendor/cashiers/${id}`, {
      method: "PUT",
      body: JSON.stringify({ active: !isActive }),
      headers: { "Content-Type": "application/json" },
    });

    setCashiers(cashiers.map((c) => (c._id === id ? { ...c, active: !isActive } : c)));
  };

  const toggleCanPost = async (id: string, canPost: boolean) => {
    await fetch(`/api/vendor/cashiers/${id}`, {
      method: "PUT",
      body: JSON.stringify({ canPost: !canPost }),
      headers: { "Content-Type": "application/json" },
    });

    setCashiers(cashiers.map((c) => (c._id === id ? { ...c, canPost: !canPost } : c)));
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/vendor/cashiers/${id}`, { method: "DELETE" });
    setCashiers(cashiers.filter((c) => c._id !== id));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold">Manage Cashiers</h1>
      <ul className="mt-4 space-y-2">
        {cashiers.map((cashier) => (
          <li key={cashier._id} className="p-2 border rounded flex justify-between items-center">
            <div>
              {cashier.name} ({cashier.email})
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleActive(cashier._id, cashier.active)}
                className={`px-3 py-1 rounded ${cashier.active ? "bg-green-600" : "bg-gray-400"}`}
              >
                {cashier.active ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={() => toggleCanPost(cashier._id, cashier.canPost)}
                className={`px-3 py-1 rounded ${cashier.canPost ? "bg-blue-600" : "bg-gray-400"}`}
              >
                {cashier.canPost ? "Disable Post" : "Enable Post"}
              </button>
              <button
                onClick={() => handleDelete(cashier._id)}
                className="px-3 py-1 rounded bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
