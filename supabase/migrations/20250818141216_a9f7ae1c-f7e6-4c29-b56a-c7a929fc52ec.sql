-- Adicionar coluna category na tabela products
ALTER TABLE public.products 
ADD COLUMN category TEXT NOT NULL DEFAULT 'outros';

-- Criar tabela de categorias para organizar melhor
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir categorias padrão
INSERT INTO public.categories (name, description, icon, color) VALUES
('alimentos-basicos', 'Arroz, feijão, açúcar, sal, óleo', 'wheat', 'hsl(45, 100%, 51%)'),
('carnes-peixes', 'Carnes vermelhas, aves, peixes e frutos do mar', 'beef', 'hsl(0, 70%, 50%)'),
('laticinios-ovos', 'Leite, queijos, iogurtes, ovos', 'milk', 'hsl(220, 90%, 60%)'),
('frutas-verduras', 'Frutas frescas, verduras e legumes', 'apple', 'hsl(120, 60%, 50%)'),
('padaria-confeitaria', 'Pães, bolos, biscoitos, doces', 'croissant', 'hsl(35, 80%, 60%)'),
('bebidas', 'Refrigerantes, sucos, águas, bebidas alcoólicas', 'coffee', 'hsl(200, 100%, 40%)'),
('limpeza-higiene', 'Produtos de limpeza e higiene pessoal', 'spray-can', 'hsl(180, 50%, 50%)'),
('enlatados-conservas', 'Produtos enlatados e conservas', 'package', 'hsl(30, 60%, 45%)'),
('congelados', 'Produtos congelados e sorvetes', 'snowflake', 'hsl(195, 100%, 70%)'),
('temperos-condimentos', 'Temperos, molhos e condimentos', 'pepper', 'hsl(25, 90%, 55%)'),
('cereais-granolas', 'Cereais matinais, granolas, aveia', 'wheat', 'hsl(40, 70%, 60%)'),
('outros', 'Outros produtos não categorizados', 'package-2', 'hsl(210, 10%, 50%)');

-- Habilitar RLS na tabela categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Criar políticas para categories (todos podem visualizar)
CREATE POLICY "Anyone can view categories" 
ON public.categories 
FOR SELECT 
USING (true);

-- Apenas admins podem gerenciar categorias
CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL
USING (is_user_admin())
WITH CHECK (is_user_admin());

-- Criar trigger para atualizar updated_at na tabela categories
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Atualizar alguns produtos existentes com categorias mais específicas (exemplo)
UPDATE public.products SET category = 'alimentos-basicos' WHERE name ILIKE '%arroz%' OR name ILIKE '%feijão%' OR name ILIKE '%açúcar%';
UPDATE public.products SET category = 'carnes-peixes' WHERE name ILIKE '%carne%' OR name ILIKE '%frango%' OR name ILIKE '%peixe%';
UPDATE public.products SET category = 'laticinios-ovos' WHERE name ILIKE '%leite%' OR name ILIKE '%queijo%' OR name ILIKE '%iogurte%';
UPDATE public.products SET category = 'frutas-verduras' WHERE name ILIKE '%banana%' OR name ILIKE '%maçã%' OR name ILIKE '%tomate%';