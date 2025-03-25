import React from 'react';

const PricingPlan = () => {
  // Placeholder prices with 100% profit based on hypothetical AWS EC2 costs
  const awsPricing = {
    bronze: 50, // Example AWS cost
    silver: 100,
    gold: 150,
  };

  const plans = [
    {
      name: 'Bronze',
      price: awsPricing.bronze * 2,
      features: ['Basic Support', '5 Cashier Accounts', 'Basic Analytics'],
    },
    {
      name: 'Silver',
      price: awsPricing.silver * 2,
      features: ['Priority Support', '10 Cashier Accounts', 'Advanced Analytics', 'API Access'],
    },
    {
      name: 'Gold',
      price: awsPricing.gold * 2,
      features: ['24/7 Support', 'Unlimited Cashier Accounts', 'Real-Time Analytics', 'Dedicated Account Manager'],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-10 text-white">
      <h1 className="text-5xl font-bold text-center mb-12">Choose Your Plan</h1>
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan, index) => (
          <div key={index} className="bg-white text-gray-900 p-8 rounded-2xl shadow-lg hover:scale-105 transition-transform">
            <h2 className="text-3xl font-bold mb-4">{plan.name}</h2>
            <p className="text-4xl font-semibold mb-6">${plan.price}/month</p>
            <ul className="mb-6 space-y-3">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  ✅ {feature}
                </li>
              ))}
            </ul>
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold">Get Started</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingPlan;
