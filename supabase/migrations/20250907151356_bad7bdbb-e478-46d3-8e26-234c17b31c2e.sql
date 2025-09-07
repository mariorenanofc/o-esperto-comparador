-- Temporarily disable triggers and insert verified offer
ALTER TABLE daily_offers DISABLE TRIGGER ALL;

INSERT INTO daily_offers (
  id,
  product_name, 
  store_name, 
  price, 
  city, 
  state, 
  contributor_name, 
  user_id, 
  verified, 
  quantity, 
  unit,
  created_at
) VALUES (
  gen_random_uuid(),
  'Arroz Camil 5kg',
  'Mercado Central', 
  22.90,
  'Exu',
  'PE',
  'Sistema Verificado',
  'b792b54b-80f6-41e9-a31c-64827cd91cbe',
  true,
  1,
  'pacote',
  NOW()
);

ALTER TABLE daily_offers ENABLE TRIGGER ALL;