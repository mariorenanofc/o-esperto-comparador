-- Force update as service role (bypassing RLS)
SET LOCAL role TO service_role;
UPDATE daily_offers 
SET verified = true 
WHERE id = '99b33a11-67b5-4104-918a-22f8abdf97b5';
RESET role;