import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  structuredData?: object;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'O Esperto Comparador - Compare Preços e Economize',
  description = 'Compare preços de produtos em diferentes mercados e economize dinheiro. Encontre as melhores ofertas e contribua com preços da sua região.',
  keywords = ['comparar preços', 'economizar', 'mercado', 'ofertas', 'supermercado'],
  image = '/og-image.jpg',
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'O Esperto Comparador',
  structuredData,
}) => {
  const siteTitle = 'O Esperto Comparador';
  const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;
  const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const imageUrl = image.startsWith('http') ? image : `${window.location.origin}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={title} />
      
      {/* Article specific meta tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {/* PWA Meta Tags */}
      <meta name="theme-color" content="#3b82f6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteTitle} />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Helmet>
  );
};

// Pre-built SEO configurations for common pages
export const pageSEOConfigs = {
  home: {
    title: 'O Esperto Comparador - Compare Preços e Economize',
    description: 'Compare preços de produtos em diferentes mercados e economize dinheiro. Encontre as melhores ofertas e contribua com preços da sua região.',
    keywords: ['comparar preços', 'economizar', 'mercado', 'ofertas', 'supermercado', 'economia doméstica'],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'O Esperto Comparador',
      description: 'Aplicação para comparar preços de produtos em diferentes mercados',
      url: typeof window !== 'undefined' ? window.location.origin : '',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
    },
  },
  comparison: {
    title: 'Comparar Preços - Encontre as Melhores Ofertas',
    description: 'Compare preços de produtos entre diferentes mercados. Adicione produtos, mercados e encontre onde comprar mais barato.',
    keywords: ['comparar preços', 'comparação', 'mercados', 'produtos', 'economizar'],
  },
  products: {
    title: 'Catálogo de Produtos - Produtos com Preços Comparados',
    description: 'Explore nosso catálogo de produtos com preços de diferentes mercados. Encontre produtos por categoria e compare preços.',
    keywords: ['catálogo produtos', 'preços produtos', 'mercado', 'categorias'],
  },
  contribute: {
    title: 'Contribuir com Preços - Ajude a Comunidade',
    description: 'Contribua com preços de produtos da sua região. Ajude outros consumidores a encontrar as melhores ofertas.',
    keywords: ['contribuir preços', 'colaboração', 'comunidade', 'ofertas'],
  },
  reports: {
    title: 'Relatórios de Preços - Análises e Tendências',
    description: 'Veja relatórios detalhados sobre tendências de preços, comparações históricas e análises de mercado.',
    keywords: ['relatórios preços', 'análises', 'tendências', 'histórico preços'],
  },
  economy: {
    title: 'Economia Doméstica - Dicas para Economizar',
    description: 'Descubra insights sobre economia doméstica, tendências de preços e dicas para economizar nas compras.',
    keywords: ['economia doméstica', 'dicas economia', 'tendências preços', 'economizar compras'],
  },
  plans: {
    title: 'Planos de Assinatura - Escolha seu Plano',
    description: 'Conheça nossos planos de assinatura. Tenha acesso a recursos premium para comparar mais produtos e mercados.',
    keywords: ['planos assinatura', 'premium', 'recursos', 'comparação preços'],
  },
};

// Hook for dynamic SEO updates
export const useSEO = (config: SEOHeadProps) => {
  React.useEffect(() => {
    // Update page title immediately for better UX
    if (config.title) {
      document.title = config.title.includes('|') ? config.title : `${config.title} | O Esperto Comparador`;
    }
  }, [config.title]);

  return <SEOHead {...config} />;
};

// Generate structured data for products
export const generateProductStructuredData = (product: any) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: `${product.name} - Compare preços em diferentes mercados`,
  category: product.category,
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'BRL',
      lowPrice: Math.min(...Object.values(product.prices || {}).map(Number)),
      highPrice: Math.max(...Object.values(product.prices || {}).map(Number)),
    offerCount: Object.keys(product.prices || {}).length,
  },
});

// Generate structured data for store
export const generateStoreStructuredData = (store: any) => ({
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: store.name,
  description: `${store.name} - Preços comparados em O Esperto Comparador`,
});