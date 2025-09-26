import React, { createContext, useReducer, ReactNode, useEffect } from 'react';
import { MenuItem, Order, OrderStatus, OrderItem, CartItem, PaymentStatus, PaymentMethod } from '../types';
import { supabase } from '../lib/supabase';

interface RestaurantState {
  menuItems: MenuItem[];
  orders: Order[];
  cart: CartItem[];
  loading: boolean;
  currentTableOrder: Order | null;
}

interface RestaurantContextType extends RestaurantState {
  addToCart: (item: MenuItem) => void;
  removeFromCart: (cartId: string) => void;
  clearCart: () => void;
  submitOrder: (tableNumber: number) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updatePaymentStatus: (orderId: string, paymentMethod: PaymentMethod) => Promise<void>;
  refreshOrders: () => Promise<void>;
  loadTableOrder: (tableNumber: number) => Promise<void>;
  addMenuItem: (item: Omit<MenuItem, 'id' | 'created_at'>) => Promise<void>;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
}

type RestaurantAction =
  | { type: 'SET_MENU_ITEMS'; payload: MenuItem[] }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: { orderId: string; status: OrderStatus } }
  | { type: 'SET_CURRENT_TABLE_ORDER'; payload: Order | null };

const initialState: RestaurantState = {
  menuItems: [],
  orders: [],
  cart: [],
  loading: true,
  currentTableOrder: null
};

function restaurantReducer(state: RestaurantState, action: RestaurantAction): RestaurantState {
  switch (action.type) {
    case 'SET_MENU_ITEMS':
      return { ...state, menuItems: action.payload };
    
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    
    case 'ADD_TO_CART':
      return { ...state, cart: [...state.cart, action.payload] };
    
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(item => item.cartId !== action.payload) };
    
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload] };
    
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.orderId
            ? { ...order, status: action.payload.status, updated_at: new Date().toISOString() }
            : order
        )
      };
    
    case 'SET_CURRENT_TABLE_ORDER':
      return { ...state, currentTableOrder: action.payload };
    
    default:
      return state;
  }
}

export const RestaurantContext = createContext<RestaurantContextType>({
  ...initialState,
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  submitOrder: async () => {},
  updateOrderStatus: async () => {},
  updatePaymentStatus: async () => {},
  refreshOrders: async () => {},
  loadTableOrder: async () => {},
  addMenuItem: async () => {},
  updateMenuItem: async () => {},
  deleteMenuItem: async () => {}
});

export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(restaurantReducer, initialState);

  // Load menu items from Supabase
  const loadMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true);
      
      if (error) throw error;
      
      dispatch({ type: 'SET_MENU_ITEMS', payload: data || [] });
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  // Load orders from Supabase
  const loadOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_items (*)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      
      const formattedOrders: Order[] = (ordersData || []).map(order => ({
        id: order.id,
        table_number: order.table_number,
        status: order.status as OrderStatus,
        payment_status: order.payment_status as PaymentStatus,
        payment_method: order.payment_method as PaymentMethod,
        total: order.total,
        created_at: order.created_at,
        updated_at: order.updated_at,
        completed_at: order.completed_at,
        items: order.order_items.map((item: any) => ({
          id: item.id,
          menu_item: item.menu_items,
          quantity: item.quantity,
          price: item.price
        }))
      }));
      
      dispatch({ type: 'SET_ORDERS', payload: formattedOrders });
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Load current order for a specific table
  const loadTableOrder = async (tableNumber: number) => {
    try {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_items (*)
          )
        `)
        .eq('table_number', tableNumber)
        .neq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (ordersData && ordersData.length > 0) {
        const order = ordersData[0];
        const formattedOrder: Order = {
          id: order.id,
          table_number: order.table_number,
          status: order.status as OrderStatus,
          payment_status: order.payment_status as PaymentStatus,
          payment_method: order.payment_method as PaymentMethod,
          total: order.total,
          created_at: order.created_at,
          updated_at: order.updated_at,
          completed_at: order.completed_at,
          items: order.order_items.map((item: any) => ({
            id: item.id,
            menu_item: item.menu_items,
            quantity: item.quantity,
            price: item.price
          }))
        };
        dispatch({ type: 'SET_CURRENT_TABLE_ORDER', payload: formattedOrder });
      } else {
        dispatch({ type: 'SET_CURRENT_TABLE_ORDER', payload: null });
      }
    } catch (error) {
      console.error('Error loading table order:', error);
    }
  };

  // Subscribe to real-time order updates
  useEffect(() => {
    loadMenuItems();
    loadOrders();

    // Subscribe to orders table changes
    const ordersSubscription = supabase
      .channel('orders-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    // Subscribe to order_items table changes
    const orderItemsSubscription = supabase
      .channel('order-items-channel')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
      orderItemsSubscription.unsubscribe();
    };
  }, []);

  const addToCart = (item: MenuItem) => {
    const cartItem: CartItem = {
      ...item,
      cartId: `${item.id}-${Date.now()}-${Math.random()}`
    };
    dispatch({ type: 'ADD_TO_CART', payload: cartItem });
  };

  const removeFromCart = (cartId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: cartId });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const submitOrder = async (tableNumber: number) => {
    if (state.cart.length === 0) return;

    try {
      const total = state.cart.reduce((sum, item) => sum + item.price, 0);
      
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_number: tableNumber,
          total: total,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = state.cart.map(item => ({
        order_id: orderData.id,
        menu_item_id: item.id,
        quantity: 1,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart after successful submission
      dispatch({ type: 'CLEAR_CART' });
      
      // Load the current table order
      await loadTableOrder(tableNumber);
      
      // Refresh all orders
      await loadOrders();
      
    } catch (error) {
      console.error('Error submitting order:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const updateData: any = { 
        status: status,
        updated_at: new Date().toISOString()
      };

      // If marking as completed, set completion timestamp
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      dispatch({ type: 'UPDATE_ORDER', payload: { orderId, status } });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  const updatePaymentStatus = async (orderId: string, paymentMethod: PaymentMethod) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'paid',
          payment_method: paymentMethod,
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Refresh orders to get updated data
      await loadOrders();
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  };

  // Menu management functions
  const addMenuItem = async (itemData: Omit<MenuItem, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .insert([itemData]);

      if (error) throw error;
      await loadMenuItems();
    } catch (error) {
      console.error('Error adding menu item:', error);
      throw error;
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await loadMenuItems();
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  };

  const refreshOrders = async () => {
    await loadOrders();
  };

  return (
    <RestaurantContext.Provider value={{
      ...state,
      addToCart,
      removeFromCart,
      clearCart,
      submitOrder,
      updateOrderStatus,
      updatePaymentStatus,
      refreshOrders,
      loadTableOrder,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem
    }}>
      {children}
    </RestaurantContext.Provider>
  );
};