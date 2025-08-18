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
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", category)
      .order("name");

    if (error) {
      console.error("Error fetching products by category:", error);
      throw error;
    }

    return data || [];
  },

  async searchProducts(searchTerm: string) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .ilike("name", `%${searchTerm}%`)
      .order("name");

    if (error) {
      console.error("Error searching products:", error);
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
