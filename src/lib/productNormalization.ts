/**
 * Funções para normalização e agrupamento de produtos duplicados
 */

export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  created_at: string | null;
  prices?: Record<string, number>;
}

export interface GroupedProduct extends Product {
  variantCount: number;
  variants: Product[];
  displayName: string;
}

/**
 * Normaliza o nome do produto para comparação
 * Remove acentos, converte para minúsculas, remove números e unidades
 */
export const normalizeProductName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    // Remove acentos
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remove números e unidades comuns no final
    .replace(/\s+\d+\s*(kg|g|ml|l|un|unid|unidades?|litros?|gramas?|quilos?|pacotes?|pct|cx|caixas?)\s*$/i, '')
    // Remove apenas números no final
    .replace(/\s+\d+\s*$/i, '')
    // Normaliza espaços
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Extrai o nome base do produto (sem variações de quantidade)
 */
export const getProductBaseName = (name: string): string => {
  // Remove padrões comuns de quantidade
  const patterns = [
    /\s*-?\s*\d+\s*(kg|g|ml|l|un|unid|unidades?|litros?|gramas?|quilos?|pacotes?|pct|cx|caixas?)\s*$/i,
    /\s+\d+\s*$/,
    /\s*\(\d+.*?\)\s*$/,
  ];
  
  let baseName = name.trim();
  for (const pattern of patterns) {
    baseName = baseName.replace(pattern, '').trim();
  }
  
  return baseName;
};

/**
 * Agrupa produtos duplicados pelo nome normalizado
 */
export const groupDuplicateProducts = (products: Product[]): GroupedProduct[] => {
  const groups = new Map<string, Product[]>();
  
  products.forEach(product => {
    const normalizedName = normalizeProductName(product.name);
    
    if (!groups.has(normalizedName)) {
      groups.set(normalizedName, []);
    }
    groups.get(normalizedName)!.push(product);
  });

  return Array.from(groups.entries()).map(([normalizedName, items]) => {
    // Ordena para pegar o mais recente como principal
    const sortedItems = [...items].sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    const mainProduct = sortedItems[0];
    const displayName = getProductBaseName(mainProduct.name) || mainProduct.name;

    return {
      ...mainProduct,
      displayName,
      variantCount: items.length,
      variants: sortedItems,
    };
  });
};

/**
 * Calcula similaridade entre dois nomes de produtos (0-1)
 */
export const calculateSimilarity = (name1: string, name2: string): number => {
  const normalized1 = normalizeProductName(name1);
  const normalized2 = normalizeProductName(name2);
  
  if (normalized1 === normalized2) return 1;
  
  // Implementação simples de Levenshtein distance ratio
  const longer = normalized1.length > normalized2.length ? normalized1 : normalized2;
  const shorter = normalized1.length > normalized2.length ? normalized2 : normalized1;
  
  if (longer.length === 0) return 1;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

/**
 * Calcula a distância de Levenshtein entre duas strings
 */
const levenshteinDistance = (str1: string, str2: string): number => {
  const m = str1.length;
  const n = str2.length;
  
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,      // deletion
          dp[i][j - 1] + 1,      // insertion
          dp[i - 1][j - 1] + 1   // substitution
        );
      }
    }
  }
  
  return dp[m][n];
};

/**
 * Formata o texto de variantes para exibição
 */
export const formatVariantText = (count: number): string => {
  if (count <= 1) return '';
  return count === 2 ? '2 variantes' : `${count} variantes`;
};
