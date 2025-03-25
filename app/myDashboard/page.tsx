"use client";

import React, { useState } from 'react';

const vendorsData = [
  { id: 1, name: 'Vendor 1', email: 'vendor1@example.com', phone: '123-456-7890', isActive: true, package: 'Gold', businessName: 'Vendor One LLC', startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: 2, name: 'Vendor 2', email: 'vendor2@example.com', phone: '987-654-3210', isActive: false, package: 'Silver', businessName: 'Vendor Two Inc.', startDate: '2025-03-01', endDate: '2025-06-30' },
];

const predefinedMessages = [
  'Reminder: Your subscription is about to expire.',
  'Thank you for using our service!',
  'We have an exclusive offer for you!' 
];

const AdminDashboard = () => {
  const [vendors, setVendors] = useState(vendorsData);
  const [selectedVendors, setSelectedVendors] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [selectedMessage, setSelectedMessage] = useState('');

  const toggleVendorStatus = (id: number) => {
    setVendors((prev) => prev.map((v) => v.id === id ? { ...v, isActive: !v.isActive } : v));
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedVendors((prev) => prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedVendors(e.target.checked ? vendors.map((v) => v.id) : []);
  };

  const handleSendMessage = () => {
    if (selectedVendors.length === 0) {
      alert('Please select at least one vendor.');
      return;
    }
    alert(`Message sent to vendors: ${selectedVendors.join(', ')}\nMessage: ${message}`);
  };

  const handleMessageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMessage(e.target.value);
    setMessage(e.target.value);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Vendor Management</h1>
      <table className="w-full mb-8 border-collapse border border-gray-300">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedVendors.length === vendors.length}
              />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Subscription Alert</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((vendor) => (
            <tr key={vendor.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedVendors.includes(vendor.id)}
                  onChange={() => handleCheckboxChange(vendor.id)}
                />
              </td>
              <td>{vendor.name}</td>
              <td>{vendor.email}</td>
              <td>{vendor.phone}</td>
              <td>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={vendor.isActive}
                    onChange={() => toggleVendorStatus(vendor.id)}
                  />
                  <span className="ml-2">{vendor.isActive ? 'Active' : 'Inactive'}</span>
                </label>
              </td>
              <td>
                {vendor.endDate && new Date(vendor.endDate).getTime() - Date.now() <= (new Date(vendor.endDate).getTime() - new Date(vendor.startDate).getTime()) / 8 && (
                  <span className="text-red-500">⚠ Subscription ending soon</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Message Input Section */}
      <div className="border p-4 rounded-lg">
        <label className="block mb-2 font-bold">Send Message to Selected Vendors</label>
        <select onChange={handleMessageSelect} value={selectedMessage} className="mb-4 p-2 border rounded">
          <option value="">Choose a predefined message</option>
          {predefinedMessages.map((msg, index) => (
            <option key={index} value={msg}>{msg}</option>
          ))}
        </select>
        <textarea
          className="w-full h-24 p-2 border rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
        />
        <button onClick={handleSendMessage} className="mt-4 bg-blue-500 text-white p-2 rounded">Send Message</button>
      </div>
    </div>
  );
};

export default AdminDashboard;

