-- Create dashboard_layouts table for storing session-specific dashboard configurations
CREATE TABLE IF NOT EXISTS dashboard_layouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  layout JSONB NOT NULL DEFAULT '[]'::jsonb,
  next_id INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_session_id ON dashboard_layouts(session_id);

-- Enable Row Level Security
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations on dashboard layouts
-- Since we're using custom session management, we allow all operations
CREATE POLICY "Allow all operations on dashboard layouts" ON dashboard_layouts
  FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_dashboard_layouts_updated_at 
  BEFORE UPDATE ON dashboard_layouts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
