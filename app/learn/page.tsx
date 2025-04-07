// export default function LearnMore() {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
//         <div className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow-xl border border-blue-200">
//           <h1 className="text-4xl font-bold text-blue-800 mb-8">Learn More: How Our Multi-Vendor Restaurant & Bar App Works</h1>
          
//           {/* Customer Section */}
//           <section className="mb-10">
//             <h2 className="text-3xl font-semibold text-blue-700 mb-6">For Customers</h2>
//             <ul className="list-decimal list-inside space-y-4 text-gray-700">
//               <li><span className="font-semibold">Arrival & QR Code:</span> Scan the QR code or enter the URL into your phone browser.</li>
//               <li><span className="font-semibold">Browse the Menu:</span> View the digital menu instantly.</li>
//               <li><span className="font-semibold">Place Your Order:</span> Select your food and submit your order easily.</li>
//               <li><span className="font-semibold">Real-Time Notification:</span> Your order is sent directly to the cashiers’ group chat.</li>
//               <li><span className="font-semibold">Order Attended Efficiently:</span> A cashier accepts the order and can serve together with multiple others, possibly with the use of a trolley.</li>
//               <li><span className="font-semibold">Payment and Invoice:</span> Receive a printed or digital invoice when ready.</li>
//               <li><span className="font-semibold">Exit Verification:</span> Exit security ensures valid proof of payment before exit.</li>
//             </ul>
//           </section>
  
//           {/* Vendor Section */}
//           <section className="mb-10">
//             <h2 className="text-3xl font-semibold text-blue-700 mb-6">For Vendors</h2>
//             <ul className="list-decimal list-inside space-y-4 text-gray-700">
//               <li><span className="font-semibold">Vendor Registration:</span> Gain access to a dedicated dashboard.</li>
//               <li><span className="font-semibold">Manage Cashiers:</span> Add, edit, or remove cashiers.</li>
//               <li><span className="font-semibold">Manage Products:</span> Update your menu with ease.</li>
//               <li><span className="font-semibold">Track Orders:</span> Monitor real-time orders and performance.</li>
//               <li><span className="font-semibold">Daily Sales Reports:</span> Access transparent sales data.</li>
//             </ul>
//           </section>
  
//           {/* Benefits Section */}
//           <section>
//             <h2 className="text-3xl font-semibold text-blue-700 mb-6">Benefits of the System</h2>
//             <ul className="list-disc list-inside space-y-4 text-gray-700">
//               <li>Faster service with instant order notifications.</li>
//               <li>Reduced errors by eliminating handwritten orders.</li>
//               <li>Improved transparency with real-time tracking.</li>
//               <li>Fraud prevention with receipt verification at exits.</li>
//               <li>Streamlined operations using efficient table service methods.</li>
//             </ul>
//           </section>
//         </div>
//       </div>
//     );
//   }

import Link from "next/link";
  
export default function LearnMore() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Learn More: How Our Multi-Vendor Restaurant & Bar App Works</h1>
        
        {/* Customer Section */}
        <section className="mb-10">
          <h2 className="text-3xl font-semibold text-gray-700 mb-6">For Customers</h2>
          <ul className="list-decimal list-inside space-y-4">
            <li><span className="font-semibold text-gray-500">Arrival & QR Code:</span> Scan the QR code or enter the URL into your phone browser.</li>
            <li><span className="font-semibold text-gray-500">Browse the Menu:</span> View the digital menu instantly.</li>
            <li><span className="font-semibold text-gray-500">Place Your Order:</span> Select your food and submit your order easily.</li>
            <li><span className="font-semibold text-gray-500">Real-Time Notification:</span> Your order is sent directly to the cashiers’ group chat.</li>
            <li><span className="font-semibold text-gray-500">Order Attended Efficiently:</span> A cashier accepts the order and serves using a trolley.</li>
            <li><span className="font-semibold text-gray-500">Payment and Invoice:</span> Receive a printed or digital invoice when ready.</li>
            <li><span className="font-semibold text-gray-500">Exit Verification:</span> Security ensures valid payment before exit.</li>
          </ul>
        </section>

        {/* Vendor Section */}
        <section className="mb-10">
          <h2 className="text-3xl font-semibold text-gray-700 mb-6">For Vendors</h2>
          <ul className="list-decimal list-inside space-y-4">
            <li><span className="font-semibold text-gray-500">Vendor Registration:</span> Gain access to a dedicated dashboard.</li>
            <li><span className="font-semibold text-gray-500">Manage Cashiers:</span> Add, edit, or remove cashiers.</li>
            <li><span className="font-semibold text-gray-500">Manage Products:</span> Update your menu with ease.</li>
            <li><span className="font-semibold text-gray-500">Track Orders:</span> Monitor real-time orders and performance.</li>
            <li><span className="font-semibold text-gray-500">Daily Sales Reports:</span> Access transparent sales data.</li>
          </ul>
        </section>

        {/* Benefits Section */}
        <section className="mb-10">
          <h2 className="text-3xl font-semibold text-gray-700 mb-6">Benefits of the System</h2>
          <ul className="list-disc list-inside space-y-4">
            <li>Faster service with instant order notifications.</li>
            <li>Reduced errors by eliminating handwritten orders.</li>
            <li>Improved transparency with real-time tracking.</li>
            <li>Fraud prevention with receipt verification at exits.</li>
            <li>Streamlined operations using efficient table service methods.</li>
          </ul>
        </section>

        {/* Link to FAQ Page */}
        <div className="text-center mt-8">
          <Link href="/faq" className="text-blue-600 hover:underline text-lg">Have Questions? Visit our FAQ Page</Link>
        </div>
      </div>
    </div>
  );
}
