export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'appetizers' | 'mains' | 'desserts' | 'beverages';
  available: boolean;
  prep_time: number;
}

export interface Order {
  id: string;
  table_number: number;
  items: OrderItem[];
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  total: number;
}

export interface OrderItem {
  id: string;
  menu_item: MenuItem;
  quantity: number;
  price: number;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'completed';
export type PaymentStatus = 'pending' | 'paid';
export type PaymentMethod = 'cash' | 'online';

export interface Table {
  id: number;
  capacity: number;
  isOccupied: boolean;
}

export interface CartItem extends MenuItem {
  cartId: string;
}