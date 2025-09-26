import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RestaurantProvider } from './context/RestaurantContext';
import StaffDashboard from './components/StaffDashboard';
import CustomerMenu from './components/CustomerMenu';
import QRCodeDisplay from './components/QRCodeDisplay';
import Navigation from './components/Navigation';

function App() {
  return (
    <RestaurantProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Staff Dashboard Route */}
            <Route path="/staff" element={
              <>
                <Navigation currentView="staff" />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <StaffDashboard />
                </main>
              </>
            } />
            
            {/* Customer Menu Route with table parameter */}
            <Route path="/menu" element={
              <>
                <Navigation currentView="customer" />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <CustomerMenu />
                </main>
              </>
            } />
            
            {/* QR Code Management Route */}
            <Route path="/qr" element={
              <>
                <Navigation currentView="qr" />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <QRCodeDisplay />
                </main>
              </>
            } />
            
            {/* Default redirect to staff dashboard */}
            <Route path="/" element={<Navigate to="/staff" replace />} />
          </Routes>
        </div>
      </Router>
    </RestaurantProvider>
  );
}

export default App;