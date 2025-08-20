import React from "react";

interface ProductCatalogHeaderProps {
  title?: string;
  description?: string;
}

const ProductCatalogHeader: React.FC<ProductCatalogHeaderProps> = ({
  title = "📦 Catálogo de Produtos",
  description = "Explore nossa base de produtos e descubra informações sobre preços e disponibilidade."
}) => {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-app-primary via-app-secondary to-app-success bg-clip-text text-transparent mb-6">
        {title}
      </h1>
      <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default ProductCatalogHeader;