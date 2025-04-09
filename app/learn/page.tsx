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
            <li className="font-semibold text-gray-400"><span className="font-semibold text-gray-500">Arrival & QR Code:</span> Scan the QR code or enter the URL into your phone browser.</li>
            <li className="font-semibold text-gray-400"><span className="font-semibold text-gray-500">Browse the Menu:</span> View the digital menu instantly.</li>
            <li className="font-semibold text-gray-400"><span className="font-semibold text-gray-500">Place Your Order:</span> Select your food and submit your order easily.</li>
            <li className="font-semibold text-gray-400"><span className="font-semibold text-gray-500">Real-Time Notification:</span> Your order is sent directly to the cashiers’ group chat.</li>
            <li className="font-semibold text-gray-400"><span className="font-semibold text-gray-500">Order Attended Efficiently:</span> A cashier accepts the order and serves using a trolley.</li>
            <li className="font-semibold text-gray-400"><span className="font-semibold text-gray-500">Payment and Invoice:</span> Receive a printed or digital invoice when ready.</li>
            <li className="font-semibold text-gray-400"><span className="font-semibold text-gray-500">Exit Verification:</span> Security ensures valid payment before exit.</li>
          </ul>
        </section>

        {/* Vendor Section */}
        <section className="mb-10">
          <h2 className="text-3xl font-semibold text-gray-700 mb-6">For Vendors</h2>
          <ul className="list-decimal list-inside space-y-4">
            <li className="font-semibold text-gray-400"><span className="font-semibold text-gray-500">Vendor Registration:</span> Gain access to a dedicated dashboard.</li>
            <li className="font-semibold text-gray-400"><span className="font-semibold text-gray-500">Manage Cashiers:</span> Add, edit, or remove cashiers.</li>
            <li className="font-semibold text-gray-400"><span className="font-semibold text-gray-500">Manage Products:</span> Update your menu with ease.</li>
            <li className="font-semibold text-gray-400"><span className="font-semibold text-gray-500">Track Orders:</span> Monitor real-time orders and performance.</li>
            <li className="font-semibold text-gray-400"><span className="font-semibold text-gray-500">Daily Sales Reports:</span> Access transparent sales data.</li>
          </ul>
        </section>

        {/* Benefits Section */}
        <section className="mb-10">
          <h2 className="text-3xl font-semibold text-gray-700 mb-6">Benefits of the System</h2>
          <ul className="list-disc list-inside space-y-4">
            <li className="font-semibold text-gray-400">Faster service with instant order notifications.</li>
            <li className="font-semibold text-gray-400">Reduced errors by eliminating handwritten orders.</li>
            <li className="font-semibold text-gray-400">Improved transparency with real-time tracking.</li>
            <li className="font-semibold text-gray-400">Fraud prevention with receipt verification at exits.</li>
            <li className="font-semibold text-gray-400">Streamlined operations using efficient table service methods.</li>
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
