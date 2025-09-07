-- Add wallet column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet VARCHAR(255);