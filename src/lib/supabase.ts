import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      menu_items: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          category: string;
          type: 'veg' | 'non-veg';   // ✅ new field
          available: boolean;
          prep_time: number;
          created_at: string;
          image: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          category: string;
          type: 'veg' | 'non-veg';   // ✅ required when inserting
          available?: boolean;
          prep_time?: number;
          created_at?: string;
          image?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          category?: string;
          type?: 'veg' | 'non-veg';  // ✅ optional for updates
          available?: boolean;
          prep_time?: number;
          created_at?: string;
          image?: string | null;
        };
      };

      orders: {
        Row: {
          id: string;
          table_number: number;
          status: string;
          payment_status: string;
          payment_method: string | null;
          total: number;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          table_number: number;
          status?: string;
          payment_status?: string;
          payment_method?: string | null;
          total: number;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          table_number?: number;
          status?: string;
          payment_status?: string;
          payment_method?: string | null;
          total?: number;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: string;
          quantity: number;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          menu_item_id: string;
          quantity?: number;
          price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          menu_item_id?: string;
          quantity?: number;
          price?: number;
          created_at?: string;
        };
      };
    };
  };
};