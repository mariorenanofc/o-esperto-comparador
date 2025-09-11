import { supabase } from "@/integrations/supabase/client";

export interface ProductData {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

export const productService = {
  async getProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching products:", error);
      throw error;
    }

    return data || [];
  },

  async getProductsByCategory(category: string) {
    // Usar função otimizada para busca por categoria
    const { data, error } = await supabase
      .rpc("search_products_optimized", {
        search_term: null,
        category_filter: category,
        limit_count: 100
      });

    if (error) {
      console.error("Error fetching products by category:", error);
      throw error;
    }

    return data || [];
  },

  async searchProducts(searchTerm: string, category?: string) {
    // Usar função otimizada com busca fuzzy
    const { data, error } = await supabase
      .rpc("search_products_optimized", {
        search_term: searchTerm.trim(),
        category_filter: category || null,
        limit_count: 100
      });

    if (error) {
      console.error("Error searching products:", error);
      throw error;
    }

    return data || [];
  },

  async searchProductsWithSimilarity(searchTerm: string, category?: string) {
    // Nova função para busca com score de similaridade
    const { data, error } = await supabase
      .rpc("search_products_optimized", {
        search_term: searchTerm.trim(),
        category_filter: category || null,
        limit_count: 50
      });

    if (error) {
      console.error("Error searching products with similarity:", error);
      throw error;
    }

    return data || [];
  },

  async createProduct(productData: ProductData) {
    const { data, error } = await supabase
      .from("products")
      .insert(productData)
      .select()
      .single();

    if (error) {
      console.error("Error creating product:", error);
      throw error;
    }

    return data;
  },

  async updateProduct(id: string, productData: Partial<ProductData>) {
    const { data, error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      throw error;
    }

    return data;
  },

  async deleteProduct(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },
};
