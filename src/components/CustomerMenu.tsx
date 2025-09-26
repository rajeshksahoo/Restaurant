import React, { useState, useContext, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RestaurantContext } from '../context/RestaurantContext';
import RatingModal from './RatingModal';
import { ShoppingCart, Plus, Minus, Star, MapPin, X, CheckCircle, Clock, CreditCard, Leaf, Drumstick } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import LoadingSpinner from './ui/LoadingSpinner';

const CustomerMenu: React.FC = () => {
  const { 
    menuItems, 
    addToCart, 
    cart, 
    clearCart, 
    removeFromCart, 
    submitOrder, 
    loading,
    currentTableOrder,
    loadTableOrder,
    submitRating
  } = useContext(RestaurantContext);
  
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingModal, setRatingModal] = useState<{ isOpen: boolean; item: any | null }>({
    isOpen: false,
    item: null
  });
  
  const tableNumber = searchParams.get('table');

  const categories = ['Sandvich', 'Salads', 'Burgers','Bakes & Meals','Choice of Pasta','Pizza','Extra Toppings','Hearth Stone Special','Soups','Starters','Main Course','Noodles','Rice','Chats','Subziyan','Dals','Breads','Rice / Pulao / Biryanis / Raitas','Dessert','Meal For One (North Indian)','South-Indian','Dosas','Uttapam','Sweets','Extra','Fresh Juices','Smoothies & Mocktails','Ice Cream','Sundaes','Tea & Coffee','Beverages'];

  const filteredItems = menuItems.filter(item =>
    (selectedCategory === 'all' || item.category === selectedCategory) &&
    (selectedType === 'all' || item.type === selectedType) &&
    (searchTerm === '' || item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     item.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    item.available
  );

  useEffect(() => {
    if (tableNumber) {
      loadTableOrder(parseInt(tableNumber));
    }
  }, [tableNumber, loadTableOrder]);

  const updateQuantity = (itemId: string, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + change)
    }));
  };

  const handleAddToCart = (item: MenuItem) => {
    const quantity = quantities[item.id] || 1;
    
    for (let i = 0; i < quantity; i++) {
      addToCart(item);
    }
    setQuantities(prev => ({ ...prev, [item.id]: 0 }));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0 || !tableNumber) return;
    
    setIsSubmitting(true);
    try {
      await submitOrder(parseInt(tableNumber));
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOrderStatusDisplay = (order: any) => {
    if (order.payment_status === 'pending' && order.status === 'delivered') {
      return { 
        text: 'Payment Pending', 
        variant: 'warning' as const, 
        icon: <CreditCard className="w-4 h-4" /> 
      };
    }
    
    switch (order.status) {
      case 'pending':
        return { text: 'Order Received', variant: 'info' as const, icon: <Clock className="w-4 h-4" /> };
      case 'preparing':
        return { text: 'Preparing', variant: 'warning' as const, icon: <Clock className="w-4 h-4" /> };
      case 'ready':
        return { text: 'Ready for Pickup', variant: 'success' as const, icon: <CheckCircle className="w-4 h-4" /> };
      case 'delivered':
        return { text: 'Delivered', variant: 'success' as const, icon: <CheckCircle className="w-4 h-4" /> };
      case 'completed':
        return { text: 'Completed', variant: 'default' as const, icon: <CheckCircle className="w-4 h-4" /> };
      default:
        return { text: order.status, variant: 'default' as const, icon: <Clock className="w-4 h-4" /> };
    }
  };

  const handleRating = (item: any) => {
    setRatingModal({ isOpen: true, item });
  };

  const handleSubmitRating = async (rating: number, comment?: string) => {
    if (!ratingModal.item) return;
    
    try {
      await submitRating(ratingModal.item.id, rating, comment);
      setRatingModal({ isOpen: false, item: null });
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen px-4">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show order completion message
  if (currentTableOrder?.status === 'completed') {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            {tableNumber && (
              <Badge variant="info" size="md">
                <MapPin className="w-4 h-4 mr-1" />
                Table {tableNumber}
              </Badge>
            )}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600 text-lg">Your order has been completed and paid</p>
        </motion.div>

        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">Order Completed!</h2>
            <p className="text-green-800 mb-4">
              Order #{currentTableOrder.id.slice(-8)} - ₹{currentTableOrder.total.toFixed(2)}
            </p>
            <p className="text-green-700 mb-6">
              Payment received via {currentTableOrder.payment_method}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Order Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4 sm:mb-8"
      >
        <div className="flex items-center justify-center gap-2 mb-2 sm:mb-4">
          {tableNumber && (
            <Badge variant="info" size="md">
              <MapPin className="w-4 h-4 mr-1" />
              Table {tableNumber}
            </Badge>
          )}
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Our Menu</h1>
        <p className="text-gray-600 text-sm sm:text-lg">Choose from our delicious selection</p>
      </motion.div>

      {/* Cart Section - Always at top when items exist */}
      <AnimatePresence>
        {cart.length > 0 && (!currentTableOrder || currentTableOrder.status === 'completed') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sticky top-2 z-20 mb-4 sm:mb-8"
          >
            <Card className="border-l-4 border-l-blue-600 shadow-lg">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                    Your Cart ({cart.length} items)
                  </h2>
                  <Button variant="ghost" size="sm" onClick={clearCart}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2 sm:space-y-3 mb-4 max-h-32 sm:max-h-40 overflow-y-auto">
                  {cart.map((item) => (
                    <motion.div 
                      key={item.cartId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base">{item.name}</h4>
                        <p className="text-sm text-gray-600">₹{item.price.toFixed(2)}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromCart(item.cartId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center font-semibold text-lg sm:text-xl mb-4">
                    <span>Total:</span>
                    <span className="text-blue-600">₹{getCartTotal().toFixed(2)}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button
                      variant="secondary"
                      onClick={clearCart}
                      disabled={isSubmitting}
                      className="flex-1 text-sm sm:text-base"
                    >
                      Clear Cart
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSubmitOrder}
                      disabled={!tableNumber || isSubmitting}
                      loading={isSubmitting}
                      className="flex-1 text-sm sm:text-base"
                    >
                      Submit Order
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Order Status */}
      {currentTableOrder && currentTableOrder.status !== 'completed' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-8"
        >
          <Card className="border-l-4 border-l-green-600">
            <CardContent className="p-3 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Current Order Status
              </h3>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Order #{currentTableOrder.id.slice(-8)}</p>
                  <p className="text-sm text-gray-600">Total: ₹{currentTableOrder.total.toFixed(2)}</p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Ordered at {new Date(currentTableOrder.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right sm:text-left">
                  {(() => {
                    const statusDisplay = getOrderStatusDisplay(currentTableOrder);
                    return (
                      <Badge variant={statusDisplay.variant} size="md">
                        <div className="flex items-center gap-2">
                          {statusDisplay.icon}
                          {statusDisplay.text}
                        </div>
                      </Badge>
                    );
                  })()}
                </div>
              </div>
              
              {/* Order Items */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Items:</h4>
                <div className="space-y-2">
                  {currentTableOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-gray-700 flex items-center gap-1 sm:gap-2">
                        {item.menu_item.type === 'veg' ? 
                          <Leaf className="w-3 h-3 text-green-600" /> : 
                          <Drumstick className="w-3 h-3 text-red-600" />
                        }
                        {item.quantity}x {item.menu_item.name}
                      </span>
                      <span className="text-gray-600">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Pending Message */}
              {currentTableOrder.status === 'delivered' && currentTableOrder.payment_status === 'pending' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg"
                >
                  <div className="flex items-center gap-2 text-orange-800">
                    <CreditCard className="w-5 h-5" />
                    <span className="font-medium">Payment Required</span>
                  </div>
                  <p className="text-sm text-orange-700 mt-1">
                    Please proceed to payment. Staff will assist you with cash or online payment options.
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Show message if customer has active order */}
      {currentTableOrder && currentTableOrder.status !== 'completed' && cart.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-8"
        >
          <Card className="border-l-4 border-l-blue-600">
            <CardContent className="p-3 sm:p-6 text-center">
              <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">Order in Progress</h3>
              <p className="text-blue-800 text-sm sm:text-base">
                You have an active order. Please wait for it to be completed before placing a new order.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search and Filters - Only show if no active order or order is completed */}
      {(!currentTableOrder || currentTableOrder.status === 'completed') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-8 space-y-3 sm:space-y-4"
        >
          {/* Search Bar */}
          <div className="max-w-md mx-auto px-2">
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-sm sm:text-base"
            />
          </div>

          {/* Category Dropdown Filter */}
          <div className="flex justify-center mb-4 px-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              {categories.map((category) => (
                <option key={category} value={category} className="capitalize">
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Veg/Non-Veg Filter */}
          <div className="flex justify-center gap-1 sm:gap-2 px-2">
            {['all', 'veg', 'non-veg'].map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSelectedType(type)}
                className="capitalize text-xs sm:text-sm"
              >
                {type === 'veg' && <Leaf className="w-4 h-4 mr-1" />}
                {type === 'non-veg' && <Drumstick className="w-4 h-4 mr-1" />}
                {type}
              </Button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Menu Items Grid */}
      {(!currentTableOrder || currentTableOrder.status === 'completed') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
         className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-8"
        >
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
               <Card hover className={`overflow-hidden ${!item.available ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="relative">
                    <img
                      src={item.image || "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"}
                      alt={item.name}
                     className={`w-full h-32 sm:h-48 object-cover ${!item.available ? 'grayscale blur-sm' : ''}`}
                    />
                    
                   <div className="absolute top-1 sm:top-2 left-1 sm:left-2 flex gap-1 sm:gap-2">
                      <Badge variant={item.type === 'veg' ? 'success' : 'error'} size="sm">
                        {item.type === 'veg' ? (
                          <><Leaf className="w-3 h-3 mr-1" /> Veg</>
                        ) : (
                          <><Drumstick className="w-3 h-3 mr-1" /> Non-Veg</>
                        )}
                      </Badge>
                      <Badge variant="info" size="sm" className="capitalize">
                        {item.category}
                      </Badge>
                     {!item.available && (
                       <Badge variant="error" size="sm">
                         Unavailable
                       </Badge>
                     )}
                    </div>

                   <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
                     <button
                       onClick={() => handleRating(item)}
                       className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full hover:bg-white transition-colors"
                     >
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                       <span className="text-xs sm:text-sm font-medium">
                         {item.average_rating ? item.average_rating.toFixed(1) : '0.0'}
                       </span>
                     </button>
                    </div>
                  </div>
                  
                 <CardContent className="p-3 sm:p-4">
                    <div className="flex justify-between items-start mb-2">
                     <h3 className="text-sm sm:text-lg font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                     <span className="text-base sm:text-xl font-bold text-blue-600 ml-2">₹{item.price.toFixed(2)}</span>
                    </div>
                    
                   <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center justify-between">
                     <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{item.prep_time} min</span>
                      </div>
                      
                     {item.available && (
                       <div className="flex items-center gap-2 sm:gap-3">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateQuantity(item.id, -1)}
                              disabled={!quantities[item.id]}
                              className="w-8 h-8 sm:w-9 sm:h-9 p-0 rounded-full flex items-center justify-center"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                                              
                            <span className="w-8 text-center font-medium text-base sm:text-sm">
                              {quantities[item.id] || 0}
                            </span>
                                              
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 sm:w-9 sm:h-9 p-0 rounded-full flex items-center justify-center"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                        
                         <Button
                           size="sm"
                           variant="primary"
                           onClick={() => handleAddToCart(item)}
                           disabled={!quantities[item.id]}
                           className="text-xs sm:text-sm"
                         >
                           Add
                         </Button>
                       </div>
                     )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {(!currentTableOrder || currentTableOrder.status === 'completed') && filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 sm:py-12 px-4"
        >
          <p className="text-gray-500 text-sm sm:text-lg">No items found matching your criteria.</p>
        </motion.div>
      )}

      {/* Rating Modal */}
      <RatingModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal({ isOpen: false, item: null })}
        itemName={ratingModal.item?.name || ''}
        onSubmit={handleSubmitRating}
      />
    </div>
  );
};

export default CustomerMenu;