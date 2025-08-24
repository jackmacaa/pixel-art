# Supabase Setup Guide

## Database Setup

1. Create a new Supabase project at https://supabase.com
2. Go to the SQL Editor in your Supabase dashboard
3. Run the following SQL to create the drawings table:

```sql
-- Create the drawings table
CREATE TABLE drawings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  grid_data JSONB NOT NULL,
  grid_size INTEGER NOT NULL,
  palette_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_permanent BOOLEAN DEFAULT FALSE
);

-- Create an index for faster queries
CREATE INDEX idx_drawings_created_at ON drawings(created_at DESC);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_drawings_updated_at
    BEFORE UPDATE ON drawings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a function to automatically delete old drawings (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_drawings()
RETURNS void AS $$
BEGIN
    DELETE FROM drawings
    WHERE created_at < NOW() - INTERVAL '7 days'
    AND is_permanent = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to run cleanup every day (optional)
-- You can also run this manually or set up a cron job on your server
-- SELECT cron.schedule('cleanup-drawings', '0 0 * * *', 'SELECT cleanup_old_drawings();');
```

## Environment Variables

Create a `.env` file in your project root with:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under "API".

## Row Level Security (RLS)

For a public gallery where anyone can view but only authenticated users can save, you can add RLS policies:

```sql
-- Enable RLS
ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read drawings
CREATE POLICY "Allow public read access" ON drawings
  FOR SELECT USING (true);

-- Allow anyone to insert drawings (for now)
CREATE POLICY "Allow public insert" ON drawings
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update their own drawings (if you add user_id later)
-- CREATE POLICY "Allow update own drawings" ON drawings
--   FOR UPDATE USING (auth.uid() = user_id);

-- Allow anyone to delete drawings (for now)
CREATE POLICY "Allow public delete" ON drawings
  FOR DELETE USING (true);
```

## Manual Cleanup

To manually delete old drawings, run:

```sql
SELECT cleanup_old_drawings();
```

## Making Drawings Permanent

To make a drawing permanent (so it won't be auto-deleted), update it:

```sql
UPDATE drawings
SET is_permanent = TRUE
WHERE id = 'your-drawing-id';
```
