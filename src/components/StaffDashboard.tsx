import React, { useContext, useState, useEffect } from 'react';
import { RestaurantContext } from '../context/RestaurantContext';
import { Clock, CheckCircle, AlertCircle, Users, DollarSign, CreditCard, Banknote, RefreshCw, TrendingUp, BarChart3 } from 'lucide-react';
import { OrderStatus, PaymentMethod } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardContent } from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import LoadingSpinner from './ui/LoadingSpinner';
import Dashboard from './analytics/Dashboard';
import MenuManagement from './menu/MenuManagement';

const StaffDashboard: React.FC = () => {
  const { orders, updateOrderStatus, updatePaymentStatus, refreshOrders, loading } = useContext(RestaurantContext);
  const [selectedFilter, setSelectedFilter] = useState<OrderStatus | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'analytics' | 'menu'>('orders');

  useEffect(() => {
    const interval = setInterval(() => {
      refreshOrders();
    }, 5000); // Refresh every 5 seconds for real-time updates

    return () => clearInterval(interval);
  }, [refreshOrders]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshOrders();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const filteredOrders = selectedFilter === 'all' 
    ? orders.filter(order => order.status !== 'completed')
    : orders.filter(order => order.status === selectedFilter);

  const getStatusVariant = (status: OrderStatus, paymentStatus?: string) => {
    if (status === 'delivered' && paymentStatus === 'pending') {
      return 'warning';
    }
    
    switch (status) {
      case 'pending': return 'info';
      case 'preparing': return 'warning';
      case 'ready': return 'success';
      case 'delivered': return 'success';
      case 'completed': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: OrderStatus, paymentStatus?: string) => {
    if (status === 'delivered' && paymentStatus === 'pending') {
      return <CreditCard className="w-4 h-4" />;
    }
    
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'preparing': return <AlertCircle className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: OrderStatus, paymentStatus?: string) => {
    if (status === 'delivered' && paymentStatus === 'pending') {
      return 'Payment Pending';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getOrderStats = () => {
    const activeOrders = orders.filter(o => o.status !== 'completed');
    const total = activeOrders.length;
    const pending = activeOrders.filter(o => o.status === 'pending').length;
    const preparing = activeOrders.filter(o => o.status === 'preparing').length;
    const ready = activeOrders.filter(o => o.status === 'ready').length;
    const paymentPending = activeOrders.filter(o => o.status === 'delivered' && o.payment_status === 'pending').length;
    const totalRevenue = orders.filter(o => o.payment_status === 'paid').reduce((sum, order) => sum + order.total, 0);
    const todayRevenue = orders.filter(o => 
      o.payment_status === 'paid' && 
      new Date(o.created_at).toDateString() === new Date().toDateString()
    ).reduce((sum, order) => sum + order.total, 0);

    return { total, pending, preparing, ready, paymentPending, totalRevenue, todayRevenue };
  };

  const handlePayment = async (orderId: string, paymentMethod: PaymentMethod) => {
    try {
      await updatePaymentStatus(orderId, paymentMethod);
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment. Please try again.');
    }
  };

  const stats = getOrderStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage orders, menu, and analytics</p>
        </div>

        {/* Table Status Section */}
        <Card className="ml-4">
        <CardHeader className="pb-2">
          <h2 className="text-sm font-semibold text-gray-900">Table Status</h2>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-5 md:grid-cols-10 gap-1">
            {[...Array(20)].map((_, i) => {
              const tableNumber = i + 1;
              const activeOrder = orders.find(
                (o) => o.table_number === tableNumber && o.status !== "completed"
              );
              const isOccupied = !!activeOrder;
            
              return (
                <div
                  key={tableNumber}
                  className={`p-1 rounded-md text-center text-xs font-medium w-12 h-10 flex flex-col justify-center transition-colors ${
                    isOccupied
                      ? "bg-red-100 border border-red-300 text-red-800"
                      : "bg-green-100 border border-green-300 text-green-800"
                  }`}
                  title={isOccupied ? `Table ${tableNumber} - Order #${activeOrder.id.slice(-8)}` : `Table ${tableNumber} - Available`}
                >
                  <div className="font-bold text-xs">T{tableNumber}</div>
                  <div className="text-xs">{isOccupied ? "●" : "○"}</div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-4 mt-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
              <span>Occupied</span>
            </div>
          </div>
        </CardContent>
      </Card>


        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'orders', label: 'Orders', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'menu', label: 'Menu Management', icon: TrendingUp }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'orders' && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Preparing</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.preparing}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ready</p>
                      <p className="text-2xl font-bold text-green-600">{stats.ready}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Payment Due</p>
                      <p className="text-2xl font-bold text-orange-600">{stats.paymentPending}</p>
                    </div>
                    <CreditCard className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                      <p className="text-2xl font-bold text-green-600">₹{stats.todayRevenue.toFixed(2)}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toFixed(2)}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Order Management</h2>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'pending', 'preparing', 'ready', 'delivered'].map((filter) => (
                      <Button
                        key={filter}
                        variant={selectedFilter === filter ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setSelectedFilter(filter as OrderStatus | 'all')}
                        className="capitalize"
                      >
                        {filter} {filter !== 'all' && `(${orders.filter(o => o.status === filter && o.status !== 'completed').length})`}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredOrders.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8"
                      >
                        <p className="text-gray-500">No orders found for the selected filter.</p>
                      </motion.div>
                    ) : (
                      filteredOrders.map((order, index) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card hover className="border-l-4 border-l-blue-600">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-lg font-semibold text-gray-900">
                                    Order #{order.id.slice(-8)}
                                  </span>
                                  <Badge variant="info" size="sm">
                                    Table {order.table_number}
                                  </Badge>
                                  <Badge variant={getStatusVariant(order.status, order.payment_status)} size="sm">
                                    <div className="flex items-center gap-1">
                                      {getStatusIcon(order.status, order.payment_status)}
                                      <span>{getStatusText(order.status, order.payment_status)}</span>
                                    </div>
                                  </Badge>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-gray-900">₹{order.total.toFixed(2)}</p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(order.created_at).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>

                              {/* Order Items */}
                              <div className="mb-4">
                                <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                                <div className="space-y-1">
                                  {order.items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center text-sm">
                                      <span className="text-gray-700">
                                        {item.quantity}x {item.menu_item.name}
                                      </span>
                                      <span className="text-gray-600">₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2 flex-wrap">
                                {/* Order Status Updates */}
                                {order.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                                  >
                                    Start Preparing
                                  </Button>
                                )}
                                {order.status === 'preparing' && (
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => updateOrderStatus(order.id, 'ready')}
                                  >
                                    Mark Ready
                                  </Button>
                                )}
                                {order.status === 'ready' && (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                                  >
                                    Mark Delivered
                                  </Button>
                                )}

                                {/* Payment Buttons */}
                                {order.status === 'delivered' && order.payment_status === 'pending' && (
                                  <>
                                    <div className="w-full border-t border-gray-200 my-3"></div>
                                    <div className="w-full">
                                      <p className="text-sm font-medium text-gray-700 mb-2">Process Payment:</p>
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          variant="success"
                                          onClick={() => handlePayment(order.id, 'cash')}
                                          className="flex items-center gap-2"
                                        >
                                          <Banknote className="w-4 h-4" />
                                          Cash Payment
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="primary"
                                          onClick={() => handlePayment(order.id, 'online')}
                                          className="flex items-center gap-2"
                                        >
                                          <CreditCard className="w-4 h-4" />
                                          Online Payment
                                        </Button>
                                      </div>
                                    </div>
                                  </>
                                )}

                                {/* Payment Info */}
                                {order.status === 'completed' && order.payment_status === 'paid' && (
                                  <div className="w-full bg-green-50 border border-green-200 rounded-lg p-3">
                                    <p className="text-sm text-green-800">
                                      ✓ Paid via {order.payment_method} at {order.completed_at ? new Date(order.completed_at).toLocaleTimeString() : 'N/A'}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>

            {/* Recent Completed Orders */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Recent Completed Orders</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {orders
                    .filter(order => 
                      order.status === 'completed' &&
                      new Date(order.created_at) >= new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // only last 2 days
                    )
                    .slice(0, 10)
                    .map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <span className="font-medium text-gray-900">
                            Order #{order.id.slice(-8)} - Table {order.table_number}
                          </span>
                          <p className="text-sm text-gray-600">
                            Completed at {order.completed_at ? new Date(order.completed_at).toLocaleTimeString() : 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">₹{order.total.toFixed(2)}</p>
                          <Badge variant="success" size="sm" className="capitalize">
                            {order.payment_method}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Dashboard orders={orders} />
          </motion.div>
        )}

        {activeTab === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <MenuManagement />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StaffDashboard;