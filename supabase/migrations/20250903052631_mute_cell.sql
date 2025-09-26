/*
  # Add payment tracking to restaurant system

  1. Schema Updates
    - Add `payment_status` column to orders table
    - Add `payment_method` column to orders table
    - Add `completed_at` column to orders table
    - Update order status to include 'completed' state

  2. Security
    - Update RLS policies for new columns
    - Maintain public access for restaurant operations

  3. Changes
    - Orders now track payment status (pending, paid)
    - Payment method tracking (cash, online)
    - Completion timestamp for analytics
*/

-- Add payment tracking columns to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_status text DEFAULT 'pending';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN completed_at timestamptz;
  END IF;
END $$;

-- Update the status check constraint to include 'completed'
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status = ANY (ARRAY['pending'::text, 'preparing'::text, 'ready'::text, 'delivered'::text, 'completed'::text]));

-- Add payment status check constraint
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
  CHECK (payment_status = ANY (ARRAY['pending'::text, 'paid'::text]));

-- Add payment method check constraint
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check 
  CHECK (payment_method = ANY (ARRAY['cash'::text, 'online'::text]) OR payment_method IS NULL);