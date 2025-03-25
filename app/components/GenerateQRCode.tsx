"use client";

import { useState, useRef } from "react";
import QRCode from "qrcode";

export default function GenerateQRCode() {
  const [cartLink, setCartLink] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleGenerateQR = async () => {
    if (!cartLink.trim()) return;
    
    try {
      const dataUrl = await QRCode.toDataURL(cartLink);
      setQrDataUrl(dataUrl);

      // Also generate a QR code on canvas
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, cartLink);
      }
    } catch (error) {
      console.error("QR Code generation failed:", error);
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = "qr-code.png";
    link.click();
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Generate QR Code</h2>
      <input
        type="text"
        value={cartLink}
        onChange={(e) => setCartLink(e.target.value)}
        placeholder="Enter cart link..."
        className="w-full p-2 border rounded mb-4"
      />
      <button
        onClick={handleGenerateQR}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Generate QR Code
      </button>

      {qrDataUrl && (
        <div className="mt-4 text-center">
          <img src={qrDataUrl} alt="QR Code" className="mx-auto" />
          <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
          <button
            onClick={handleDownloadQR}
            className="bg-green-600 text-white px-4 py-2 rounded mt-4"
          >
            Download QR Code
          </button>
        </div>
      )}
    </div>
  );
}
