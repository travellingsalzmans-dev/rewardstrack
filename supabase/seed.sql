-- Seed: 15 biggest Canadian credit cards (for card_templates table)
-- Run this AFTER the main schema has been created.

INSERT INTO public.card_templates (card_name, issuer, annual_fee, reward_type) VALUES
  ('Cobalt Card',                      'American Express',  155.88, 'Points (MR)'),
  ('Aeroplan Visa Infinite',           'TD',                139,    'Aeroplan Points'),
  ('Gold Rewards Card',                'American Express',  175,    'Points (MR)'),
  ('Platinum Card',                    'American Express',  799,    'Points (MR)'),
  ('Aventura Visa Infinite',           'CIBC',              139,    'Aventura Points'),
  ('Scotia Gold American Express',     'Scotiabank',        120,    'Scene+ Points'),
  ('Eclipse Visa Infinite',            'BMO',               120,    'BMO Points'),
  ('Avion Visa Infinite',              'RBC',               120,    'Avion Points'),
  ('Cash Back Visa Infinite',          'TD',                 89,    'Cash Back'),
  ('Dividend Visa Infinite',           'CIBC',               99,    'Cash Back'),
  ('Aeroplan Visa Infinite Privilege', 'TD',                599,    'Aeroplan Points'),
  ('WestJet RBC World Elite',          'RBC',               119,    'WestJet Dollars'),
  ('Scene+ Visa Infinite',             'Scotiabank',        120,    'Scene+ Points'),
  ('Triangle World Elite Mastercard',  'Canadian Tire',       0,    'CT Money'),
  ('PC Financial World Elite',         'PC Financial',        0,    'PC Optimum Points');
