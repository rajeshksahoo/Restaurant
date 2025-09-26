import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChefHat, Users, QrCode, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavigationProps {
  currentView: 'staff' | 'customer' | 'qr';
}

const Navigation: React.FC<NavigationProps> = ({ currentView }) => {
  const location = useLocation();

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">RestaurantOS</h1>
              <p className="text-xs text-gray-500">Professional Management System</p>
            </div>
          </motion.div>

          <nav className="flex space-x-1">
            {location.pathname === '/menu' ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* <Link
                  to="/menu"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-blue-100 text-blue-700 transition-colors"
                >
                  <Menu className="w-4 h-4" />
                  Customer Menu
                </Link> */}
              </motion.div>
            ) : (
              <>
                <Link
                  to="/staff"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    location.pathname === '/staff'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Staff Dashboard
                </Link>

                <Link
                  to="/qr"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    location.pathname === '/qr'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  QR Codes
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navigation;