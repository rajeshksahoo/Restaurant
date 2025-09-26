import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, X, Share2, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from './ui/Card';
import Button from './ui/Button';
import LoadingSpinner from './ui/LoadingSpinner';

interface QRGeneratorProps {
  tableNumber: number;
  onClose: () => void;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({ tableNumber, onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateQR = async () => {
      try {
        setIsLoading(true);
        const baseUrl = window.location.origin;
        const menuUrl = `${baseUrl}/menu?table=${tableNumber}`;
        
        const qrCodeDataUrl = await QRCode.toDataURL(menuUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#1F2937',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        });
        
        setQrCodeUrl(qrCodeDataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateQR();
  }, [tableNumber]);

  const handleDownload = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `table-${tableNumber}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = async () => {
    if (navigator.share && qrCodeUrl) {
      try {
        const response = await fetch(qrCodeUrl);
        const blob = await response.blob();
        const file = new File([blob], `table-${tableNumber}-qr.png`, { type: 'image/png' });
        
        await navigator.share({
          title: `Table ${tableNumber} QR Code`,
          text: `QR Code for Table ${tableNumber} - RestaurantOS`,
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const handlePrint = () => {
    if (qrCodeUrl) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Table ${tableNumber} QR Code</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 20px; 
                  text-align: center; 
                  font-family: Arial, sans-serif; 
                }
                .qr-container { 
                  border: 2px solid #000; 
                  padding: 20px; 
                  display: inline-block; 
                  border-radius: 10px;
                }
                h1 { margin-bottom: 10px; }
                p { margin-top: 10px; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="qr-container">
                <h1>Table ${tableNumber}</h1>
                <img src="${qrCodeUrl}" alt="QR Code" />
                <p>Scan to view menu and place order</p>
                <p><strong>RestaurantOS</strong></p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Table {tableNumber} QR Code</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="text-center">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <>
                <div className="bg-white p-6 rounded-xl shadow-lg inline-block mb-6 border-2 border-gray-100">
                  <img 
                    src={qrCodeUrl} 
                    alt={`QR Code for Table ${tableNumber}`}
                    className="max-w-full h-auto"
                  />
                  <div className="mt-4 text-center">
                    <h3 className="font-bold text-lg text-gray-900">Table {tableNumber}</h3>
                    <p className="text-sm text-gray-600">Scan to view menu</p>
                    <p className="text-xs text-gray-500 mt-1">RestaurantOS</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-6">
                  Scan this QR code to access the menu for Table {tableNumber}
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="primary"
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </Button>
                  {navigator.share && (
                    <Button
                      variant="ghost"
                      onClick={handleShare}
                      className="flex items-center justify-center gap-2 col-span-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default QRGenerator;