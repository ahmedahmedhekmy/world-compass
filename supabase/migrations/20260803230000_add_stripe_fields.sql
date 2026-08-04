-- Add Stripe-related fields to orders table
-- This migration adds support for Stripe payment processing

-- Add stripe session ID to orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- Add paid_at timestamp for when payment was confirmed
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Add index for faster lookups by stripe_session_id
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);

-- Add index for faster lookups by reference
CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(reference);

-- Create user_roles table for admin management
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- Create policy for users to read their own roles
CREATE POLICY "Users can read their own roles" ON user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Create policy for admins to manage all roles
CREATE POLICY "Admins can manage all roles" ON user_roles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
