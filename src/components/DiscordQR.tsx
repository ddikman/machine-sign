import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export function DiscordQR() {
  const [qrData, setQrData] = useState<string>("");

  useEffect(() => {
    const url = "https://discord.com/channels/1099637273106059394/1315094513743691786";
    const opts: QRCode.QRCodeToDataURLOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
      color: {
        dark: "#000",
        light: "#FFF"
      }
    }

    QRCode.toDataURL(url, opts).then(data => {
      setQrData(data);
    });
  }, []);

  if (!qrData) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
      <img src={qrData} alt="Discord QR Code" />
      <div style={{ marginLeft: '1rem', display: 'flex', flexDirection: 'column' }}>
        <h3>Questions?</h3>
        <p>Check out discord</p>
      </div>
    </div>
  );
}
