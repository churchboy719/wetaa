import { useState } from "react";
import QRCode from 'qrcode';


export default function GenerateQRCode() {
  const [cartLink, setCartLink] = useState("");
  const [qrImage, setQrImage] = useState("");

  const handleGenerateQR = async () => {
    if (!cartLink.trim()) return;
    const qr = await QRCode.toDataURL(cartLink);
    setQrImage(qr);
  };

  return (
    <div>
      <input
        type="text"
        value={cartLink}
        onChange={(e) => setCartLink(e.target.value)}
        placeholder="Enter cart link..."
      />
      <button onClick={handleGenerateQR}>Generate QR Code</button>

      {qrImage && <img src={qrImage} alt="QR Code" />}
    </div>
  );
}
