-- Create a properly verified offer for testing
INSERT INTO daily_offers (
  product_name, 
  store_name, 
  price, 
  city, 
  state, 
  contributor_name, 
  user_id, 
  verified, 
  quantity, 
  unit
) VALUES (
  'Açúcar Cristal União',
  'Supermercado Araújo', 
  4.50,
  'Exu',
  'PE',
  'Administrador',
  'b792b54b-80f6-41e9-a31c-64827cd91cbe',
  true,
  1,
  'kg'
);