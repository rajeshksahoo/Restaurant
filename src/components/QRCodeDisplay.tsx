import React, { useState } from 'react';
import { QrCode, Download, Eye, Printer, Share2, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRGenerator from './QRGenerator';
import { Card, CardHeader, CardContent } from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';

const QRCodeDisplay: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTables, setSelectedTables] = useState<number[]>([]);

  const tables = Array.from({ length: 20 }, (_, i) => i + 1);

  const handleGenerateQR = (tableNumber: number) => {
    setSelectedTable(tableNumber);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setSelectedTable(null);
  };

  const toggleTableSelection = (tableNumber: number) => {
    setSelectedTables(prev => 
      prev.includes(tableNumber) 
        ? prev.filter(t => t !== tableNumber)
        : [...prev, tableNumber]
    );
  };

  const handleBulkDownload = () => {
    if (selectedTables.length === 0) {
      alert('Please select tables first');
      return;
    }
    // Implementation for bulk download would go here
    console.log('Downloading QR codes for tables:', selectedTables);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold text-gray-900">QR Code Management</h2>
          <p className="text-gray-600 mt-1">Generate and manage table QR codes</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info" size="md">
            <QrCode className="w-4 h-4 mr-1" />
            {tables.length} Tables
          </Badge>
        </div>
      </motion.div>

      {/* Instructions */}
      <Card className="border-l-4 border-l-blue-600">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            How to use QR codes:
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                Click "Generate QR\" for any table to create a QR code
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                Customers scan the QR code to access the menu for that specific table
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                Download and print QR codes to place on tables
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                Each QR code is unique to its table number
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Bulk Actions</h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            <Button
              variant="success"
              onClick={handleBulkDownload}
              disabled={selectedTables.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Selected ({selectedTables.length})
            </Button>
            <Button
              variant="secondary"
              onClick={() => setSelectedTables(tables)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Select All
            </Button>
            <Button
              variant="ghost"
              onClick={() => setSelectedTables([])}
              className="flex items-center gap-2"
            >
              Clear Selection
            </Button>
          </div>
          {selectedTables.length > 0 && (
            <p className="text-sm text-gray-600">
              Selected tables: {selectedTables.sort((a, b) => a - b).join(', ')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Table Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <AnimatePresence>
          {tables.map((tableNumber, index) => (
            <motion.div
              key={tableNumber}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                hover 
                className={`text-center cursor-pointer transition-all duration-200 ${
                  selectedTables.includes(tableNumber) 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : ''
                }`}
                onClick={() => toggleTableSelection(tableNumber)}
              >
                <CardContent className="p-4">
                  <div className="text-lg font-semibold text-gray-900 mb-3">
                    Table {tableNumber}
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateQR(tableNumber);
                      }}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <QrCode className="w-4 h-4" />
                      Generate QR
                    </Button>
                    
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Print functionality
                        }}
                        className="flex-1"
                      >
                        <Printer className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Share functionality
                        }}
                        className="flex-1"
                      >
                        <Share2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* QR Generator Modal */}
      <AnimatePresence>
        {showPreview && selectedTable && (
          <QRGenerator 
            tableNumber={selectedTable} 
            onClose={closePreview} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default QRCodeDisplay;