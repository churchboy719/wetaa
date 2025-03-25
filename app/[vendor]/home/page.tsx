import Cart from "@/app/components/Cart";

export default function HomeView() {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold">Home View</h1>
        <p className="mt-2 text-gray-600">Welcome to the vendor's home dashboard.</p>
        <Cart />
      </div>
    );
  }
  