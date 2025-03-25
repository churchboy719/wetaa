
// "use client";

// import { useSession } from "next-auth/react";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import AddCashier from "@/app/components/AddCashier";
// import Blog from "@/app/components/Blog";
// import HomeView from "@/app/components/HomeView";
// import CashiersPage from "@/app/components/Cashiers";
// import GroupChat from "@/app/components/GroupChat";
// import Cart from "@/app/components/Cart";
// import GenerateQRCode from "@/app/components/GenerateQRCode";

// type Page = "group-chat" | "cashiers" | "add-cashier" | "home" | "blog" | "cart" | "generateQRCode";

// export default function VendorDashboard() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [activePage, setActivePage] = useState<Page>("group-chat");
//   const [copied, setCopied] = useState(false);

//   // Prevent redirection until session status is determined
//   useEffect(() => {
//     if (status === "authenticated" && session?.user?.role) {
//       if (session.user.role !== "vendor") {
//         router.replace("/vendor/login");
//       }
//     } else if (status === "unauthenticated") {
//       router.replace("/vendor/login");
//     }
//   }, [status, session?.user?.role, router]);


//   // Prevent rendering until session status is determined
//   if (status === "loading") return <p>Loading...</p>;


//   // Function to copy the cart link
//   const handleCopyLink = () => {
//     const cartLink = `${window.location.origin}/customer/cart`;
//     navigator.clipboard.writeText(cartLink);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   return (
//     <div className="flex h-screen">
//       {/* Sidebar */}
//       <aside className="w-1/4 bg-gray-900 text-white p-6 flex flex-col">
//         <h2 className="text-xl font-bold mb-6 text-white">Vendor Dashboard</h2>
//         <nav className="flex flex-col gap-3">
//           <SidebarButton text="Group Chat" onClick={() => setActivePage("group-chat")} active={activePage === "group-chat"} />
//           <SidebarButton text="Cashiers" onClick={() => setActivePage("cashiers")} active={activePage === "cashiers"} />
//           <SidebarButton text="Add New Cashier" onClick={() => setActivePage("add-cashier")} active={activePage === "add-cashier"} />
//           <SidebarButton text="Home View" onClick={() => setActivePage("home")} active={activePage === "home"} />
//           <SidebarButton text="Blog" onClick={() => setActivePage("blog")} active={activePage === "blog"} />
//           <SidebarButton text="Cart" onClick={() => setActivePage("cart")} active={activePage === "cart"} />
//           <SidebarButton text="Generate QR Code" onClick={() => setActivePage("generateQRCode")} active={activePage === "generateQRCode"} />
//         </nav>
//       </aside>

//       {/* Main Content */}
//       <main className="w-3/4 p-6 bg-gray-100">
//         {activePage === "group-chat" && <GroupChat />}
//         {activePage === "cashiers" && <CashiersPage />}
//         {activePage === "add-cashier" && <AddCashier />}
//         {activePage === "home" && <HomeView />}
//         {activePage === "blog" && <Blog />}
//         {activePage === "cart" && (
//           <div>
//             {/* Copy Cart Link Button */}
//             <button
//               onClick={handleCopyLink}
//               className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//             >
//               Copy Cart Link
//             </button>

//             {/* Success Message */}
//             {copied && <p className="text-green-600 mt-2">Copied to clipboard!</p>}

//             {/* Cart Component */}
//             <Cart />
//           </div>
//         )}
//         {activePage === "generateQRCode" && <GenerateQRCode />}
//       </main>
//     </div>
//   );
// }

// // Sidebar Button Component
// const SidebarButton = ({ text, onClick, active }: { text: string; onClick: () => void; active: boolean }) => (
//   <button
//     className={`w-full text-left px-4 py-2 rounded-md transition ${
//       active ? "bg-blue-600" : "hover:bg-gray-700"
//     }`}
//     onClick={onClick}
//   >
//     {text}
//   </button>
// );

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddCashier from "@/app/components/AddCashier";
import Blog from "@/app/components/Blog";
import HomeView from "@/app/components/HomeView";
import CashiersPage from "@/app/components/Cashiers";
import GroupChat from "@/app/components/GroupChat";
import Cart from "@/app/components/Cart";
import GenerateQRCode from "@/app/components/GenerateQRCode";
import ManageProducts from "@/app/components/ManageProducts";

type Page = "group-chat" | "cashiers" | "add-cashier" | "home" | "blog" | "cart" | "generateQRCode" | "manage-products";

export default function VendorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activePage, setActivePage] = useState<Page>("group-chat");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      console.log("Session data:", session);
        console.log("Vendor ID:", session?.user?.vendorId);
    
      if (session.user.role !== "vendor") {
        router.replace("/vendor/login");
      }
    } else if (status === "unauthenticated") {
      router.replace("/vendor/login");
    }
  }, [status, session?.user?.role, router]);

  if (status === "loading") return <p>Loading...</p>;

  const handleCopyLink = () => {
    const cartLink = `${window.location.origin}/customer/cart`;
    navigator.clipboard.writeText(cartLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-1/4 bg-gray-900 text-white p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-6">Vendor Dashboard</h2>
        <nav className="flex flex-col gap-3">
          <SidebarButton text="Group Chat" onClick={() => setActivePage("group-chat")} active={activePage === "group-chat"} />
          <SidebarButton text="Cashiers" onClick={() => setActivePage("cashiers")} active={activePage === "cashiers"} />
          <SidebarButton text="Add New Cashier" onClick={() => setActivePage("add-cashier")} active={activePage === "add-cashier"} />
          <SidebarButton text="Home View" onClick={() => setActivePage("home")} active={activePage === "home"} />
          <SidebarButton text="Blog" onClick={() => setActivePage("blog")} active={activePage === "blog"} />
          <SidebarButton text="Cart" onClick={() => setActivePage("cart")} active={activePage === "cart"} />
          <SidebarButton text="Generate QR Code" onClick={() => setActivePage("generateQRCode")} active={activePage === "generateQRCode"} />
          <SidebarButton text="Manage Products" onClick={() => setActivePage("manage-products")} active={activePage === "manage-products"} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="w-3/4 p-6 bg-gray-100">
        {activePage === "group-chat" && <GroupChat />}
        {activePage === "cashiers" && <CashiersPage />}
        {activePage === "add-cashier" && <AddCashier />}
        {activePage === "home" && <HomeView />}
        {activePage === "blog" && <Blog />}
        {activePage === "cart" && (
          <div>
            <button
              onClick={handleCopyLink}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Copy Cart Link
            </button>
            {copied && <p className="text-green-600 mt-2">Copied to clipboard!</p>}
            <Cart />
          </div>
        )}
        {activePage === "generateQRCode" && <GenerateQRCode />}
        {activePage === "manage-products" && <ManageProducts />}
      </main>
    </div>
  );
}

// Sidebar Button Component
const SidebarButton = ({ text, onClick, active }: { text: string; onClick: () => void; active: boolean }) => (
  <button
    className={`w-full text-left px-4 py-2 rounded-md transition ${
      active ? "bg-blue-600" : "hover:bg-gray-700"
    }`}
    onClick={onClick}
  >
    {text}
  </button>
);
