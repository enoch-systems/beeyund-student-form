-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add unique constraint on email for duplicate prevention
-- This works for both new and existing tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'registrations_email_key'
  ) THEN
    ALTER TABLE registrations ADD CONSTRAINT registrations_email_key UNIQUE (email);
  END IF;
END $$;

-- Create index for faster sorting by created_at
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at DESC);

-- Create index for faster sorting by full_name
CREATE INDEX IF NOT EXISTS idx_registrations_full_name ON registrations(full_name);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);

-- Enable Row Level Security
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (so this script can be re-run safely)
DROP POLICY IF EXISTS "Allow public insert" ON registrations;
DROP POLICY IF EXISTS "Allow public read" ON registrations;
DROP POLICY IF EXISTS "Allow public delete" ON registrations;

-- Create policy to allow public insert (for form submissions)
CREATE POLICY "Allow public insert" ON registrations
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policy to allow public read (for admin dashboard)
CREATE POLICY "Allow public read" ON registrations
  FOR SELECT
  TO public
  USING (true);

-- Create policy to allow public delete (for admin dashboard)
CREATE POLICY "Allow public delete" ON registrations
  FOR DELETE
  TO public
  USING (true);

-- Optional: Create a view for easier querying
CREATE OR REPLACE VIEW registration_stats AS
SELECT 
  COUNT(*) as total_registrations,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as registrations_last_24h,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as registrations_last_7d
FROM registrations;

-- Enable Realtime for the registrations table
-- This allows the dashboard to update instantly when a new student registers
ALTER TABLE registrations REPLICA IDENTITY FULL;

-- Add the registrations table to the realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'registrations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE registrations;
  END IF;
END $$;
