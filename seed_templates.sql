-- Card Templates Migration & Seed
-- Run this in the Supabase SQL editor

-- 1. Add new columns to card_templates
ALTER TABLE card_templates ADD COLUMN IF NOT EXISTS card_type text;
ALTER TABLE card_templates ADD COLUMN IF NOT EXISTS perks text;
ALTER TABLE card_templates ADD COLUMN IF NOT EXISTS credits_included text;
ALTER TABLE card_templates ADD COLUMN IF NOT EXISTS has_lounge_access boolean DEFAULT false;
ALTER TABLE card_templates ADD COLUMN IF NOT EXISTS lounge_passes_per_year integer DEFAULT 0;
ALTER TABLE card_templates ADD COLUMN IF NOT EXISTS has_companion_pass boolean DEFAULT false;
ALTER TABLE card_templates ADD COLUMN IF NOT EXISTS companion_pass_type text;
ALTER TABLE card_templates ADD COLUMN IF NOT EXISTS companion_pass_spend_requirement integer DEFAULT 0;
ALTER TABLE card_templates ADD COLUMN IF NOT EXISTS has_free_checked_bag boolean DEFAULT false;
ALTER TABLE card_templates ADD COLUMN IF NOT EXISTS priority_airline_services text;
ALTER TABLE card_templates ADD COLUMN IF NOT EXISTS has_priority_airline boolean DEFAULT false;
ALTER TABLE card_templates ADD COLUMN IF NOT EXISTS priority_airport_services text;
ALTER TABLE card_templates ADD COLUMN IF NOT EXISTS has_priority_airport boolean DEFAULT false;
ALTER TABLE card_templates ADD COLUMN IF NOT EXISTS has_nexus_rebate boolean DEFAULT false;
ALTER TABLE card_templates ADD COLUMN IF NOT EXISTS nexus_rebate_amount integer DEFAULT 0;
ALTER TABLE card_templates ADD COLUMN IF NOT EXISTS nexus_rebate_period text;
ALTER TABLE card_templates ADD COLUMN IF NOT EXISTS hotel_status_programs text;
ALTER TABLE card_templates ADD COLUMN IF NOT EXISTS has_free_night_cert boolean DEFAULT false;
ALTER TABLE card_templates ADD COLUMN IF NOT EXISTS hotel_booking_programs text;
ALTER TABLE card_templates ADD COLUMN IF NOT EXISTS has_no_fx_fee boolean DEFAULT false;
ALTER TABLE card_templates ADD COLUMN IF NOT EXISTS fx_fee_percent numeric DEFAULT 2.5;

-- 2. Add columns to credit_cards (user's cards) if not already present
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS perks text;
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS credits_included text;

-- 3. Replace all templates with comprehensive data
TRUNCATE card_templates RESTART IDENTITY;

INSERT INTO card_templates (
  card_name, issuer, annual_fee, reward_type, card_type,
  perks, credits_included,
  has_lounge_access, lounge_passes_per_year,
  has_companion_pass, companion_pass_type, companion_pass_spend_requirement,
  has_free_checked_bag, priority_airline_services, has_priority_airline,
  priority_airport_services, has_priority_airport,
  has_nexus_rebate, nexus_rebate_amount, nexus_rebate_period,
  hotel_status_programs, has_free_night_cert, hotel_booking_programs,
  has_no_fx_fee, fx_fee_percent
) VALUES
-- ==================== AMEX ====================
('American Express Green Card', 'Amex', 0, 'Membership Rewards', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('SimplyCash Card', 'Amex', 0, 'Cash Back', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('American Express Cobalt Card', 'Amex', 191.88, 'Membership Rewards', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('SimplyCash Preferred Card', 'Amex', 119.88, 'Cash Back', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('American Express Gold Rewards Card', 'Amex', 250, 'Membership Rewards', 'Personal',
 NULL, '$100 annual travel credit',
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 true, 50, 'Every 4 years', NULL, false, 'The Hotel Collection', false, 2.5),

('American Express Aeroplan Card', 'Amex', 120, 'Aeroplan Points', 'Personal',
 'Free first checked bag', NULL,
 false, 0, false, NULL, 0, true, 'Preferred pricing only', false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('American Express Aeroplan Reserve Card', 'Amex', 599, 'Aeroplan Points', 'Personal',
 'Priority services, premium travel perks', NULL,
 true, -1, true, 'Air Canada Annual Worldwide Companion Pass', 25000,
 true, 'Priority check-in, boarding, standby (Air Canada)', true,
 'Priority security (Maple Leaf)', true,
 true, 100, 'Every 4 years', NULL, false, NULL, false, 2.5),

('American Express Aeroplan Platinum Card', 'Amex', 499, 'Aeroplan Points', 'Personal',
 'Free first checked bag; Priority Air Canada services', NULL,
 true, -1, false, NULL, 0,
 true, 'Preferred pricing; Priority check-in', true,
 'Priority security; Priority boarding', true,
 true, 100, 'Every 4 years', NULL, false, NULL, false, 2.5),

('Platinum Card from American Express', 'Amex', 799, 'Membership Rewards', 'Personal',
 'Airport lounges; travel credits; hotel elite status', '$200 travel + $200 dining',
 true, -1, false, NULL, 0,
 false, NULL, false,
 'Priority airport services (premium security, escorts)', true,
 true, 100, 'Every 4 years',
 'Marriott Bonvoy Gold;Hilton Honors Gold', false, 'Fine Hotels & Resorts;The Hotel Collection', false, 2.5),

('American Express Business Edge Card', 'Amex', 99, 'Membership Rewards', 'Business',
 'Monthly spend bonus', NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('American Express Business Gold Rewards Card', 'Amex', 199, 'Membership Rewards', 'Business',
 'Quarterly bonus opportunities', '$100 annual travel credit',
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('American Express Aeroplan Business Reserve Card', 'Amex', 599, 'Aeroplan Points', 'Business',
 'Business travel perks; Aeroplan benefits', NULL,
 true, -1, true, 'Air Canada Annual Worldwide Companion Pass', 25000,
 true, 'Priority check-in, boarding, standby (Air Canada)', true,
 'Priority security (Maple Leaf)', true,
 true, 100, 'Every 4 years', NULL, false, NULL, false, 2.5),

('American Express Aeroplan Business Card', 'Amex', 199, 'Aeroplan Points', 'Business',
 'Free first checked bag on Air Canada', NULL,
 false, 0, false, NULL, 0,
 true, 'Preferred pricing', true, 'Priority boarding', true,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('Business Platinum Card from American Express', 'Amex', 799, 'Membership Rewards', 'Business',
 'Premium lounges; statement credits; elite hotel status', '$200 travel + $200 wireless',
 true, -1, false, NULL, 0,
 false, NULL, false,
 'Priority airport handling (Amex Global Assist)', true,
 true, 100, 'Every 4 years',
 'Marriott Bonvoy Gold;Hilton Honors Gold', false, 'Fine Hotels & Resorts;The Hotel Collection', false, 2.5),

('American Express SimplyCash Business Card', 'Amex', 0, 'Cash Back', 'Business',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('American Express SimplyCash Preferred Business Card', 'Amex', 99, 'Cash Back', 'Business',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('Marriott Bonvoy American Express Card', 'Amex', 120, 'Marriott Bonvoy Points', 'Personal',
 'Annual free night certificate; 15 elite nights', NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, 'Marriott Bonvoy Silver', true, NULL, false, 2.5),

('Marriott Bonvoy Business American Express Card', 'Amex', 150, 'Marriott Bonvoy Points', 'Business',
 'Annual free night certificate; 15 elite nights', NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, 'Marriott Bonvoy Silver', true, NULL, false, 2.5),

-- ==================== BMO ====================
('BMO AIR MILES Mastercard', 'BMO', 0, 'AIR MILES', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('BMO AIR MILES World Elite Mastercard', 'BMO', 120, 'AIR MILES', 'Personal',
 'Shell fuel perks, up to 25% flight redemption discount', NULL,
 true, 4, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('BMO AIR MILES No-Fee Business Mastercard', 'BMO', 0, 'AIR MILES', 'Business',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('BMO AIR MILES World Elite Business Mastercard', 'BMO', 120, 'AIR MILES', 'Business',
 NULL, NULL,
 true, 4, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('BMO Ascend World Elite Business Mastercard', 'BMO', 149, 'Rewards (BMO Points)', 'Business',
 NULL, NULL,
 true, 4, false, NULL, 0, false, NULL, false, NULL, false,
 true, 200, 'Every 4 years', NULL, false, NULL, false, 2.5),

('BMO CashBack Mastercard', 'BMO', 0, 'Cash Back', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('BMO CashBack Mastercard for Students', 'BMO', 0, 'Cash Back', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('BMO CashBack World Elite Mastercard', 'BMO', 120, 'Cash Back', 'Personal',
 'Travel & purchase perks', NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('BMO CashBack Business Mastercard', 'BMO', 0, 'Cash Back', 'Business',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('BMO eclipse rise Visa Card', 'BMO', 0, 'Rewards (BMO Points)', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('BMO eclipse Visa Infinite Card', 'BMO', 120, 'Rewards (BMO Points)', 'Personal',
 '$50 annual lifestyle credit', NULL,
 true, 4, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('BMO eclipse Visa Infinite Privilege Card', 'BMO', 599, 'Rewards (BMO Points)', 'Personal',
 'Visa Infinite Privilege benefits + $200 lifestyle credit', '$200 lifestyle credit',
 true, 6, false, NULL, 0,
 false, 'Priority airline services (partner dependent)', true,
 'Priority security (Visa Airport Companion)', true,
 true, 200, 'Every 4 years', NULL, false, NULL, false, 2.5),

('BMO Preferred Rate Mastercard', 'BMO', 29, 'Low Interest', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('BMO U.S. Dollar Mastercard', 'BMO', 49, 'No Foreign Conversion', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, true, 0),

('BMO VIPorter Mastercard', 'BMO', 89, 'VIPorter Points', 'Personal',
 'Various travel perks', NULL,
 false, 0, false, NULL, 0,
 true, 'Priority boarding (Porter)', true, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('BMO VIPorter World Elite Mastercard', 'BMO', 199, 'VIPorter Points', 'Personal',
 'Companion pass offers', NULL,
 true, 4, false, NULL, 0,
 true, 'Priority boarding & check-in (Porter)', true,
 'Priority security (select airports)', true,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

-- ==================== BRIM ====================
('Brim Mastercard', 'Brim', 0, 'Brim Rewards Points', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, true, 0),

('Brim World Elite Mastercard', 'Brim', 89, 'Brim Rewards Points', 'Personal',
 NULL, NULL,
 true, 4, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, true, 0),

('Air France KLM World Elite Mastercard', 'Brim', 132, 'Flying Blue Miles', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

-- ==================== CANADIAN TIRE ====================
('Canadian Tire Triangle Mastercard', 'Canadian Tire', 0, 'CT Money (Rewards)', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('Canadian Tire Triangle World Elite Mastercard', 'Canadian Tire', 0, 'CT Money (Rewards)', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

-- ==================== CIBC ====================
('CIBC Adapta Mastercard', 'CIBC', 0, 'Adapta Points', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('CIBC Aeroplan Visa Card', 'CIBC', 0, 'Aeroplan Points', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0,
 true, 'Preferred pricing only', false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('CIBC Aeroplan Visa Infinite Privilege Card', 'CIBC', 599, 'Aeroplan Points', 'Personal',
 'Premium Aeroplan travel perks incl. lounge access & first checked bag', NULL,
 true, -1, true, 'Air Canada Annual Worldwide Companion Pass', 25000,
 true, 'Priority check-in, boarding, standby (Air Canada)', true,
 'Priority security (Maple Leaf)', true,
 true, 100, 'Every 4 years', NULL, false, NULL, false, 2.5),

('CIBC Aeroplan Visa Business Plus Card', 'CIBC', 120, 'Aeroplan Points', 'Business',
 NULL, NULL,
 false, 0, false, NULL, 0,
 true, 'Preferred pricing only', false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('CIBC Aventura Visa Card', 'CIBC', 0, 'Aventura Points', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 true, 50, 'Every 4 years', NULL, false, NULL, false, 2.5),

('CIBC Aventura Visa Infinite Privilege Card', 'CIBC', 499, 'Aventura Points', 'Personal',
 'Travel credits; lounge access; NEXUS fee rebate', '$200 annual travel credit',
 true, -1, false, NULL, 0,
 false, 'Priority airline services (partner dependent)', true,
 'Priority security (Visa Companion)', true,
 true, 100, 'Every 4 years', NULL, false, NULL, false, 2.5),

('CIBC Aventura Visa Card for Business Plus', 'CIBC', 120, 'Aventura Points', 'Business',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 true, 100, 'Every 4 years', NULL, false, NULL, false, 2.5),

('CIBC bizline Visa Card', 'CIBC', 0, 'None', 'Business',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('CIBC Classic Visa Card', 'CIBC', 0, 'None', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('CIBC Classic Visa Card for Students', 'CIBC', 0, 'None', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('CIBC Costco Mastercard', 'CIBC', 0, 'Cash Back', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, true, 0),

('CIBC Costco Business Mastercard', 'CIBC', 0, 'Cash Back', 'Business',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, true, 0),

('CIBC Dividend Visa Infinite Card', 'CIBC', 120, 'Cash Back', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('CIBC Select Visa Card', 'CIBC', 29, 'No rewards', 'Personal',
 'Gas savings with Journie Rewards', NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

-- ==================== MBNA ====================
('Amazon.ca Rewards Mastercard (MBNA)', 'MBNA', 0, 'Cash Back', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('MBNA Rewards Platinum Plus Mastercard', 'MBNA', 0, 'MBNA Rewards Points', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('MBNA Rewards World Elite Mastercard', 'MBNA', 120, 'MBNA Rewards Points', 'Personal',
 NULL, NULL,
 true, 4, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('MBNA Smart Cash Platinum Plus Mastercard', 'MBNA', 0, 'Cash Back', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('MBNA Smart Cash World Mastercard', 'MBNA', 39, 'Cash Back', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('MBNA True Line Mastercard', 'MBNA', 0, 'None', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('MBNA True Line Gold Mastercard', 'MBNA', 39, 'None', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

-- ==================== NATIONAL BANK ====================
('National Bank World Elite Mastercard', 'National Bank', 150, 'À la carte Rewards Points', 'Personal',
 'Airport lounge access; annual travel expense rebates', '$150 annual travel credit',
 true, 4, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('National Bank Platinum Mastercard', 'National Bank', 70, 'À la carte Rewards Points', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('National Bank World Mastercard', 'National Bank', 0, 'À la carte Rewards Points', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('National Bank mycredit Mastercard', 'National Bank', 0, 'Cash Back', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('National Bank MC1 Mastercard', 'National Bank', 0, 'None', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('National Bank ECHO Cashback Mastercard', 'National Bank', 30, 'Cash Back', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('National Bank Syncro Mastercard', 'National Bank', 0, 'None', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

-- ==================== PC ====================
('PC Mastercard', 'PC', 0, 'PC Optimum Points', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('PC World Mastercard', 'PC', 0, 'PC Optimum Points', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('PC World Elite Mastercard', 'PC', 0, 'PC Optimum Points', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

-- ==================== RBC ====================
('RBC Cash Back Mastercard', 'RBC', 0, 'Cash Back', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('RBC Cash Back Preferred World Elite Mastercard', 'RBC', 99, 'Cash Back', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('RBC ION Visa', 'RBC', 0, 'Avion Points', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('RBC ION+ Visa', 'RBC', 48, 'Avion Points', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('RBC RateAdvantage Visa', 'RBC', 0, 'None', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('RBC Visa Classic Low Rate Option', 'RBC', 20, 'None', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('RBC Avion Visa Infinite', 'RBC', 120, 'Avion Points', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('RBC Avion Visa Platinum', 'RBC', 120, 'Avion Points', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('RBC Avion Visa Infinite Privilege', 'RBC', 399, 'Avion Points', 'Personal',
 'Enhanced travel perks & rewards', '$200 annual travel credit',
 true, -1, false, NULL, 0,
 false, NULL, false,
 'Priority security (Visa Companion)', true,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('RBC British Airways Visa Infinite', 'RBC', 165, 'Avion Points', 'Personal',
 'British Airways partner perks', NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('RBC WestJet World Elite Mastercard', 'RBC', 139, 'WestJet Dollars', 'Personal',
 'Travel perks, Annual companion voucher', NULL,
 false, 0, true, 'WestJet Annual Companion Voucher', 0,
 true, 'Priority boarding (WestJet)', true, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('RBC U.S. Dollar Visa Gold', 'RBC', 65, 'None', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, true, 0),

('RBC More Rewards Visa', 'RBC', 0, 'RBC Rewards', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('moi RBC Visa', 'RBC', 0, 'None', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('RBC Avion Visa Business', 'RBC', 120, 'Avion Points', 'Business',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('RBC Avion Visa Infinite Business', 'RBC', 175, 'Avion Points', 'Business',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('RBC Business Cash Back Mastercard', 'RBC', 0, 'Cash Back', 'Business',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('RBC Visa Business', 'RBC', 12, 'None', 'Business',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('HSBC (migrated) Avion Visa Infinite', 'RBC', 120, 'Avion Points', 'Personal',
 '$200 travel credit; 0% foreign transaction fee', '$200 travel credit',
 false, 0, false, NULL, 0,
 false, 'Priority airline services (partner dependent)', true,
 'Priority security (Visa Companion)', true,
 false, 0, NULL, NULL, false, NULL, true, 0),

-- ==================== ROGERS ====================
('Rogers Red Mastercard', 'Rogers', 0, 'Cash Back', 'Personal',
 '5 Roam Like Home days with eligible Rogers mobile plan', NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('Rogers Red World Elite Mastercard', 'Rogers', 0, 'Cash Back', 'Personal',
 '5 Roam Like Home days/year; travel perks', NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

-- ==================== SCOTIABANK ====================
('Scotiabank Gold American Express', 'Scotiabank', 120, 'Scène+ Points', 'Personal',
 'Travel perks', NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('Scotiabank Passport Visa Infinite', 'Scotiabank', 150, 'Scène+ Points', 'Personal',
 'Strong travel benefits; no foreign transaction fees', NULL,
 true, 6, false, NULL, 0, false, NULL, false, NULL, true,
 false, 0, NULL, NULL, false, NULL, true, 0),

('Scotiabank Passport Visa Infinite Privilege', 'Scotiabank', 599, 'Scène+ Points', 'Personal',
 'Enhanced travel perks', '$250 travel credit',
 true, -1, false, NULL, 0,
 false, NULL, false,
 'Priority security (select airports)', true,
 false, 0, NULL, NULL, false, NULL, true, 0),

('Scotiabank Scene+ Visa', 'Scotiabank', 0, 'Scène+ Points', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('Scotiabank American Express Card', 'Scotiabank', 0, 'Scène+ Points', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('Scotiabank American Express Or Card', 'Scotiabank', 120, 'Scène+ Points', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('Scotiabank American Express Platinum Card', 'Scotiabank', 399, 'Scène+ Points', 'Personal',
 NULL, NULL,
 true, -1, false, NULL, 0, false, NULL, false,
 'Priority airport services', true,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('Scotiabank Momentum Visa Infinite', 'Scotiabank', 120, 'Cash Back', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('Scotiabank Momentum Visa', 'Scotiabank', 49, 'Cash Back', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('Scotiabank Momentum Visa No Fee', 'Scotiabank', 0, 'Cash Back', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('Scotiabank Minima Visa', 'Scotiabank', 29, 'Low Interest', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('Scotiabank Scene+ Visa Student', 'Scotiabank', 0, 'Scène+ Points', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('Scotiabank American Express Student Card', 'Scotiabank', 0, 'Scène+ Points', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('Scotiabank Value Visa Card', 'Scotiabank', 29, 'No rewards', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('Scotiabank Passport Visa Infinite Business', 'Scotiabank', 150, 'Scène+ Points', 'Business',
 'Travel benefits', NULL,
 true, 6, false, NULL, 0, false, NULL, false, NULL, true,
 false, 0, NULL, NULL, false, NULL, true, 0),

-- ==================== TANGERINE ====================
('Tangerine Money-Back Credit Card', 'Tangerine', 0, 'Cash Back', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('Tangerine Money-Back World Mastercard', 'Tangerine', 0, 'Cash Back', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

-- ==================== TD ====================
('TD Cash Back Visa', 'TD', 0, 'Cash Back Dollars', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('TD Rewards Visa', 'TD', 0, 'TD Rewards Points', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('TD Cash Back Visa Infinite', 'TD', 139, 'Cash Back Dollars', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('TD Aeroplan Visa Infinite', 'TD', 139, 'Aeroplan Points', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0,
 true, 'Preferred pricing only', false, NULL, false,
 true, 100, 'Every 4 years', NULL, false, NULL, false, 2.5),

('TD Aeroplan Visa Platinum', 'TD', 89, 'Aeroplan Points', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0,
 true, 'Preferred pricing only', false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('TD Aeroplan Visa Infinite Privilege', 'TD', 599, 'Aeroplan Points', 'Personal',
 NULL, NULL,
 true, -1, true, 'Air Canada Annual Worldwide Companion Pass', 25000,
 true, 'Priority check-in, boarding, standby (Air Canada)', true,
 'Priority security (Maple Leaf)', true,
 true, 100, 'Every 4 years', NULL, false, NULL, false, 2.5),

('TD First Class Travel Visa Infinite', 'TD', 139, 'TD Rewards Points', 'Personal',
 NULL, NULL,
 true, 4, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('TD Platinum Travel Visa', 'TD', 89, 'TD Rewards Points', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('TD Low Rate Visa', 'TD', 25, 'Low Interest', 'Personal',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('TD U.S. Dollar Visa', 'TD', 39, 'No Foreign Conversion', 'Personal',
 'No FX Fees', NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, true, 0),

('TD Business Travel Visa', 'TD', 149, 'TD Rewards Points', 'Business',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('TD Aeroplan Visa Business', 'TD', 149, 'Aeroplan Points', 'Business',
 NULL, NULL,
 false, 0, false, NULL, 0,
 true, 'Preferred pricing only', false, NULL, false,
 true, 100, 'Every 4 years', NULL, false, NULL, false, 2.5),

('TD Business Cash Back Visa', 'TD', 0, 'Cash Back Dollars', 'Business',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

('TD Business Select Rate Visa', 'TD', 0, 'Low Interest', 'Business',
 NULL, NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, false, 2.5),

-- ==================== WEALTHSIMPLE ====================
('Wealthsimple Visa Infinite Credit Card', 'Wealthsimple', 240, 'Cash Back', 'Personal',
 'No foreign transaction fees; travel benefits concierge', NULL,
 false, 0, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, true, 0),

('Wealthsimple Visa Infinite Privilege Credit Card', 'Wealthsimple', 240, 'Cash Back', 'Personal',
 'Premium travel perks including access to 1,200+ airport lounges; no foreign transaction fees', NULL,
 true, -1, false, NULL, 0, false, NULL, false, NULL, false,
 false, 0, NULL, NULL, false, NULL, true, 0);

-- ==================== USER PREFERENCES ====================
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  notify_bonus_deadline boolean DEFAULT true,
  notify_fee_renewal boolean DEFAULT true,
  notify_points_expiry boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own preferences') THEN
    CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own preferences') THEN
    CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own preferences') THEN
    CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;
