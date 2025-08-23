-- Limpar produtos problemáticos e órfãos
-- 1. Remover produtos de teste que não têm preços associados
DELETE FROM products 
WHERE (name ILIKE '%test%' OR name ILIKE '%teste%') 
AND id NOT IN (
  SELECT DISTINCT product_id 
  FROM product_prices 
  WHERE product_id IS NOT NULL
);

-- 2. Garantir que todos os produtos tenham categoria válida
UPDATE products 
SET category = 'outros' 
WHERE category IS NULL OR category = '';

-- 3. Garantir que todos os produtos tenham unit válida
UPDATE products 
SET unit = 'unidade' 
WHERE unit IS NULL OR unit = '';

-- 4. Garantir que todos os produtos tenham quantity válida
UPDATE products 
SET quantity = 1 
WHERE quantity IS NULL OR quantity <= 0;

-- 5. Garantir que todos os produtos tenham nome válido (mínimo 2 caracteres)
UPDATE products 
SET name = CONCAT('Produto ', id) 
WHERE name IS NULL OR LENGTH(TRIM(name)) < 2;

-- 6. Adicionar índices para melhorar performance nas buscas por categoria
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('portuguese', name));

-- 7. Função para validar dados de produtos antes de inserir/atualizar
CREATE OR REPLACE FUNCTION validate_product_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar nome
  IF NEW.name IS NULL OR LENGTH(TRIM(NEW.name)) < 2 THEN
    RAISE EXCEPTION 'Nome do produto deve ter pelo menos 2 caracteres';
  END IF;
  
  -- Validar categoria
  IF NEW.category IS NULL OR NEW.category = '' THEN
    NEW.category := 'outros';
  END IF;
  
  -- Validar unit
  IF NEW.unit IS NULL OR NEW.unit = '' THEN
    NEW.unit := 'unidade';
  END IF;
  
  -- Validar quantity
  IF NEW.quantity IS NULL OR NEW.quantity <= 0 THEN
    NEW.quantity := 1;
  END IF;
  
  -- Garantir que a categoria existe na tabela categories
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = NEW.category) THEN
    NEW.category := 'outros';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Criar trigger para validação automática
DROP TRIGGER IF EXISTS trigger_validate_product_data ON products;
CREATE TRIGGER trigger_validate_product_data
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION validate_product_data();

-- 9. Função para limpeza automática de dados órfãos
CREATE OR REPLACE FUNCTION cleanup_orphaned_data()
RETURNS void AS $$
BEGIN
  -- Remover comparison_products órfãos (sem comparação associada)
  DELETE FROM comparison_products 
  WHERE comparison_id NOT IN (SELECT id FROM comparisons);
  
  -- Remover product_prices órfãos (sem produto ou loja associada)
  DELETE FROM product_prices 
  WHERE product_id NOT IN (SELECT id FROM products)
     OR store_id NOT IN (SELECT id FROM stores);
     
  -- Log da limpeza
  RAISE NOTICE 'Limpeza de dados órfãos concluída';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Executar limpeza inicial
SELECT cleanup_orphaned_data();