// // // src/app/vendor/dashboard/page.tsx (Vendor Dashboard UI with Auth Protection)
// // "use client";
// // import { useSession } from "next-auth/react";
// // import { useEffect, useState } from "react";
// // import { useRouter } from "next/navigation";
// // import Link from "next/link";

// // type Cashier = {
// //   _id: string;
// //   name: string;
// //   email: string;
// // };

// // export default function VendorDashboard() {
// //   const { data: session, status }:any = useSession();
// //   const router = useRouter();
// //   const [vendor, setVendor] = useState<any>(null);
// //   const [cashiers, setCashiers] = useState<Cashier[]>([]);
// //   const [chatMessages, setChatMessages] = useState([]);

// //     useEffect(() => {
// //     if (status === "unauthenticated" || session?.user.role !== "vendor") {
// //       router.push("/vendor/login");
// //     }
// //   }, [status, session, router]);

// //   useEffect(() => {
// //     async function fetchVendor() {
// //       if (session?.user?.email) {
// //         const res = await fetch(`/api/vendor?email=${session.user.email}`);
// //         const data = await res.json();
// //         setVendor(data.vendor);
// //       }
// //     }
// //     fetchVendor();
// //   }, [session]);

// //   useEffect(() => {
// //     async function fetchCashiers() {
// //       if (vendor) {
// //         const res = await fetch(`/api/vendor/cashiers?vendorId=${vendor._id}`);
// //         const data = await res.json();
// //         setCashiers(data.cashiers);
// //       }
// //     }
// //     fetchCashiers();
// //   }, [vendor]);

// //   const handleDeleteCashier = async (cashierId:any) => {
// //     await fetch(`/api/vendor/cashiers/${cashierId}`, { method: "DELETE" });
// //     setCashiers(cashiers.filter(cashier => cashier._id !== cashierId));
// //   };

// //   if (status === "loading") return <p>Loading...</p>;

// //   return (
// //     <div className="p-6 max-w-5xl mx-auto">
// //       <h1 className="text-2xl font-bold">Welcome, {vendor?.fullName}!</h1>
// //       <p className="mt-2">Manage your business, cashiers, and posts here.</p>
      
// //       {/* Cashier Management */}
// //       <section className="mt-6">
// //         <h2 className="text-xl font-bold">Cashiers</h2>
// //         <Link href="/vendor/cashiers/new" className="bg-blue-600 text-white px-4 py-2 rounded">Add New Cashier</Link>
// //         <ul className="mt-4 space-y-2">
// //           {cashiers.map((cashier:any) => (
// //             <li key={cashier._id} className="p-2 border rounded flex justify-between">
// //               {cashier.name} ({cashier.email})
// //               <button onClick={() => handleDeleteCashier(cashier._id)} className="text-red-600">Delete</button>
// //             </li>
// //           ))}
// //         </ul>
// //       </section>

// //       {/* Group Chat */}
// //       <section className="mt-6">
// //         <h2 className="text-xl font-bold">Group Chat</h2>
// //         <div className="border p-4 rounded h-60 overflow-y-scroll">
// //           {chatMessages.map((msg:any, idx) => (
// //             <p key={idx}><strong>{msg.sender}:</strong> {msg.text}</p>
// //           ))}
// //         </div>
// //       </section>

// //       {/* Blog Management */}
// //       <section className="mt-6">
// //         <h2 className="text-xl font-bold">Manage Blog</h2>
// //         <Link href="/vendor/blog/new" className="bg-green-600 text-white px-4 py-2 rounded">Create New Post</Link>
// //       </section>

// //       {/* Navbar Management */}
// //       <section className="mt-6">
// //         <h2 className="text-xl font-bold">Navbar Management</h2>
// //         <Link href="/vendor/navbar" className="bg-gray-600 text-white px-4 py-2 rounded">Edit Navbar</Link>
// //       </section>
// //     </div>
// //   );
// // }


// "use client";
// import { useSession } from "next-auth/react";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// type Cashier = {
//   _id: string;
//   name: string;
//   email: string;
// };

// export default function VendorDashboard() {
//   const { data: session, status }:any = useSession();
//   const router = useRouter();
//   const [vendor, setVendor] = useState<any>(null);
//   const [cashiers, setCashiers] = useState<Cashier[]>([]);
//   const [chatMessages, setChatMessages] = useState([]);

//   // ✅ Only redirect *after* session finishes loading
//   // useEffect(() => {
//   //   if (status === "authenticated") {
//   //     if (session?.user.role !== "vendor") {
//   //       router.push("/vendor/login");
//   //     }
//   //   } else if (status === "unauthenticated") {
//   //     router.push("/vendor/login");
//   //   }
//   // }, [status, session, router]);

//   useEffect(() => {
//     if (status === "loading") return; // 🚀 Wait until session loads
  
//     if (status === "unauthenticated") {
//       router.push("/vendor/login");
//       return;
//     }
  
//     if (status === "authenticated" && session?.user?.role !== "vendor") {
//       return;
//       // router.push("/vendor/login");
//     }
//   }, [status, session, router]);
  

//   useEffect(() => {
//     async function fetchVendor() {
//       if (session?.user?.email) {
//         const res = await fetch(`/api/vendor?email=${session.user.email}`);
//         const data = await res.json();
//         setVendor(data.vendor);
//       }
//     }
//     fetchVendor();
//   }, [session]);

//   useEffect(() => {
//     async function fetchCashiers() {
//       if (vendor) {
//         const res = await fetch(`/api/vendor/cashiers?vendorId=${vendor._id}`);
//         const data = await res.json();
//         setCashiers(data.cashiers);
//       }
//     }
//     fetchCashiers();
//   }, [vendor]);

//   const handleDeleteCashier = async (cashierId: any) => {
//     await fetch(`/api/vendor/cashiers/${cashierId}`, { method: "DELETE" });
//     setCashiers(cashiers.filter((cashier) => cashier._id !== cashierId));
//   };

//   // ✅ Prevent rendering while session is still loading
//   if (status === "loading") return <p>Loading...</p>;

//   return (
//     <div className="p-6 max-w-5xl mx-auto">
//       <h1 className="text-2xl font-bold">Welcome, {vendor?.fullName}!</h1>
//       <p className="mt-2">Manage your business, cashiers, and posts here.</p>

//       {/* Cashier Management */}
//       <section className="mt-6">
//         <h2 className="text-xl font-bold">Cashiers</h2>
//         <Link href="/vendor/cashiers/new" className="bg-blue-600 text-white px-4 py-2 rounded">
//           Add New Cashier
//         </Link>
//         <ul className="mt-4 space-y-2">
//           {cashiers.map((cashier: any) => (
//             <li key={cashier._id} className="p-2 border rounded flex justify-between">
//               {cashier.name} ({cashier.email})
//               <button onClick={() => handleDeleteCashier(cashier._id)} className="text-red-600">
//                 Delete
//               </button>
//             </li>
//           ))}
//         </ul>
//       </section>

//       {/* Group Chat */}
//       <section className="mt-6">
//         <h2 className="text-xl font-bold">Group Chat</h2>
//         <div className="border p-4 rounded h-60 overflow-y-scroll">
//           {chatMessages.map((msg: any, idx) => (
//             <p key={idx}>
//               <strong>{msg.sender}:</strong> {msg.text}
//             </p>
//           ))}
//         </div>
//       </section>

//       {/* Blog Management */}
//       <section className="mt-6">
//         <h2 className="text-xl font-bold">Manage Blog</h2>
//         <Link href="/vendor/blog/new" className="bg-green-600 text-white px-4 py-2 rounded">
//           Create New Post
//         </Link>
//       </section>

//       {/* Navbar Management */}
//       <section className="mt-6">
//         <h2 className="text-xl font-bold">Navbar Management</h2>
//         <Link href="/vendor/navbar" className="bg-gray-600 text-white px-4 py-2 rounded">
//           Edit Navbar
//         </Link>
//       </section>
//     </div>
//   );
// }

"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VendorDashboard() {
  const { data: session, status }:any = useSession();
  const router = useRouter();

  // Protect the dashboard: Only allow vendors
  // useEffect(() => {
  //   if (status === "loading") return;
  //   if (status === "unauthenticated" || session?.user?.role !== "vendor") {
  //     router.push("/vendor/login");
  //   }
  // }, [status, session, router]);

  useEffect(() => {
        if (status === "authenticated") {
          if (session?.user.role !== "vendor") {
            router.push("/vendor/login");
          }
        } else if (status === "unauthenticated") {
          router.push("/vendor/login");
        }
      }, [status, session, router]);
    
           

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
      <p className="mt-2 text-gray-600">Manage your business and team here.</p>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <DashboardButton href="/vendor/cashiers/new " text="Add New" color="brown" />
        <DashboardButton href="/vendor/home" text="Home View" color="blue" />
        <DashboardButton href="/vendor/cashiers" text="Cashiers" color="red" />
        <DashboardButton href="/vendor/blog" text="Blog" color="green" />
        <DashboardButton href="/vendor/group-chat" text="Group Chat" color="purple" />
      </div>
    </div>
  );
}

// Reusable Button Component
const DashboardButton = ({ href, text, color }: { href: string; text: string; color: string }) => (
  <a
    href={href}
    className={`bg-${color}-600 hover:bg-${color}-700 text-white px-4 py-2 rounded-md text-center`}
  >
    {text}
  </a>
);
