import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { errorHandler } from "@/lib/errorHandler";

export interface ProductData {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

export const productService = {
  async getProducts() {
    return errorHandler.retry(
      async () => {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("name");

        if (error) {
          logger.error("Error fetching products", error);
          throw error;
        }

        logger.info("Products fetched successfully", { count: data?.length || 0 });
        return data || [];
      },
      3,
      1000,
      { component: "productService", action: "getProducts" }
    );
  },

  async getProductsByCategory(category: string) {
    return errorHandler.retry(
      async () => {
        const { data, error } = await supabase
          .rpc("search_products_optimized", {
            search_term: null,
            category_filter: category,
            limit_count: 100
          });

        if (error) {
          logger.error("Error fetching products by category", error, { category });
          throw error;
        }

        logger.info("Products by category fetched", { category, count: data?.length || 0 });
        return data || [];
      },
      3,
      1000,
      { component: "productService", action: "getProductsByCategory" }
    );
  },

  async searchProducts(searchTerm: string, category?: string) {
    return errorHandler.retry(
      async () => {
        const { data, error } = await supabase
          .rpc("search_products_optimized", {
            search_term: searchTerm.trim(),
            category_filter: category || null,
            limit_count: 100
          });

        if (error) {
          logger.error("Error searching products", error, { searchTerm, category });
          throw error;
        }

        logger.info("Products search completed", { searchTerm, category, count: data?.length || 0 });
        return data || [];
      },
      3,
      1000,
      { component: "productService", action: "searchProducts" }
    );
  },

  async searchProductsWithSimilarity(searchTerm: string, category?: string) {
    return errorHandler.retry(
      async () => {
        const { data, error } = await supabase
          .rpc("search_products_optimized", {
            search_term: searchTerm.trim(),
            category_filter: category || null,
            limit_count: 50
          });

        if (error) {
          logger.error("Error searching products with similarity", error, { searchTerm, category });
          throw error;
        }

        logger.info("Products similarity search completed", { searchTerm, count: data?.length || 0 });
        return data || [];
      },
      3,
      1000,
      { component: "productService", action: "searchProductsWithSimilarity" }
    );
  },

  async createProduct(productData: ProductData) {
    return errorHandler.retry(
      async () => {
        const { data, error } = await supabase
          .from("products")
          .insert(productData)
          .select()
          .single();

        if (error) {
          logger.error("Error creating product", error, { productData });
          throw error;
        }

        logger.info("Product created successfully", { productId: data.id, name: data.name });
        return data;
      },
      2,
      1500,
      { component: "productService", action: "createProduct" }
    );
  },

  async updateProduct(id: string, productData: Partial<ProductData>) {
    return errorHandler.retry(
      async () => {
        const { data, error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          logger.error("Error updating product", error, { productId: id, productData });
          throw error;
        }

        logger.info("Product updated successfully", { productId: id, name: data.name });
        return data;
      },
      2,
      1500,
      { component: "productService", action: "updateProduct" }
    );
  },

  async deleteProduct(id: string) {
    return errorHandler.retry(
      async () => {
        const { error } = await supabase.from("products").delete().eq("id", id);

        if (error) {
          logger.error("Error deleting product", error, { productId: id });
          throw error;
        }

        logger.info("Product deleted successfully", { productId: id });
      },
      2,
      1000,
      { component: "productService", action: "deleteProduct" }
    );
  },
};
