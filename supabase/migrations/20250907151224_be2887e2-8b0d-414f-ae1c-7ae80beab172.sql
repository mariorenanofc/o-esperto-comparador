-- Create a verified offer directly for testing
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
  'Teste Café Verificado',
  'Supermercado Teste', 
  12.50,
  'Exu',
  'PE',
  'Sistema de Teste',
  'b792b54b-80f6-41e9-a31c-64827cd91cbe',
  true,
  1,
  'unidade'
);