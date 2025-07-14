-- Adicionar contribuições de teste
INSERT INTO public.daily_offers (user_id, product_name, store_name, price, city, state, contributor_name, quantity, unit, verified)
VALUES 
  ('2e83f998-48e4-4b71-ae39-3118b42a3e51', 'Arroz Tipo 1', 'Extra Supermercados', 4.50, 'Exu', 'PE', 'Mario Renan (MR Canal)', 1, 'kg', false),
  ('bded2150-509c-4d02-a8fc-2c45977a3b13', 'Feijão Preto', 'Atacadão', 6.90, 'São Paulo', 'SP', 'Mario Renan Developer', 1, 'kg', false),
  ('2e83f998-48e4-4b71-ae39-3118b42a3e51', 'Açúcar Cristal', 'Carrefour', 3.20, 'Exu', 'PE', 'Mario Renan (MR Canal)', 1, 'kg', true)
ON CONFLICT DO NOTHING;

-- Adicionar sugestões de teste
INSERT INTO public.suggestions (user_id, title, description, category, status)
VALUES 
  ('2e83f998-48e4-4b71-ae39-3118b42a3e51', 'Melhorar filtros de busca', 'Seria bom ter filtros por categoria de produto', 'improvement', 'open'),
  ('bded2150-509c-4d02-a8fc-2c45977a3b13', 'App mobile', 'Seria interessante ter um aplicativo mobile', 'feature', 'in-review')
ON CONFLICT DO NOTHING;