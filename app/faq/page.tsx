"use client";

import { useState } from 'react';

const faqs = [
  {
    question: 'How do I place an order?',
    answer: 'Simply scan the QR code on your table using your phone or enter the provided URL. Browse the digital menu, select your items, and submit your order. It will be sent directly to the cashier.'
  },
  {
    question: 'How will I know if my order is being attended to?',
    answer: 'Once a cashier accepts your order from the group chat, your order will be in progress. You may receive real-time updates if applicable.'
  },
  {
    question: 'How do vendors manage their menus and cashiers?',
    answer: 'Vendors can log in to their dashboard to add, edit, or delete products and manage their cashiers. They can also track orders and generate sales reports.'
  },
  {
    question: 'What happens if I face issues with my order?',
    answer: 'You can easily notify the cashier through the app. If further assistance is needed, the vendor’s management can be contacted directly.'
  },
  {
    question: 'Is there any way to prevent fraud?',
    answer: 'Yes. The security personnel verify the printed or digital invoice before allowing a customer to exit, ensuring all payments are complete.'
  },
  {
    question: 'What if I forget to scan the QR code?',
    answer: 'You can access the same menu by typing the restaurant’s provided URL into your browser or requesting assistance from a cashier.'
  }
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Frequently Asked Questions</h1>
        {faqs.map((faq, index) => (
          <div key={index} className="border-b py-4">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center text-left focus:outline-none"
            >
              <span className="text-lg font-semibold text-gray-700">{faq.question}</span>
              <span className="text-xl text-gray-500">{activeIndex === index ? '-' : '+'}</span>
            </button>
            {activeIndex === index && (
              <p className="mt-4 text-gray-600">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
