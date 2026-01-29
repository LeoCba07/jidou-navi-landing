-- Add unsubscribe token and subscription status to waitlist table
-- Run this migration to enable email functionality

-- Add unsubscribe_token column for unique unsubscribe links
ALTER TABLE waitlist
ADD COLUMN IF NOT EXISTS unsubscribe_token TEXT UNIQUE;

-- Add subscribed column to track subscription status (default true for new signups)
ALTER TABLE waitlist
ADD COLUMN IF NOT EXISTS subscribed BOOLEAN DEFAULT true;

-- Create index on unsubscribe_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_unsubscribe_token
ON waitlist(unsubscribe_token);

-- Create index on subscribed for filtering active subscribers
CREATE INDEX IF NOT EXISTS idx_waitlist_subscribed
ON waitlist(subscribed) WHERE subscribed = true;
