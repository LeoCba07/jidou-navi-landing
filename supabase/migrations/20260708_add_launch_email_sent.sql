-- Track launch announcement sends so send-launch-email can never double-send.
-- Run before triggering the send-launch-email function.

ALTER TABLE waitlist
ADD COLUMN IF NOT EXISTS launch_email_sent_at TIMESTAMPTZ;
