import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/lib/types";

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      throw error;
    }
  },

  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching category:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Failed to fetch category:", error);
      throw error;
    }
  },

  async createCategory(categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert(categoryData)
        .select()
        .single();

      if (error) {
        console.error("Error creating category:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Failed to create category:", error);
      throw error;
    }
  },

  async updateCategory(id: string, categoryData: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>): Promise<Category> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .update(categoryData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating category:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Failed to update category:", error);
      throw error;
    }
  },

  async deleteCategory(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting category:", error);
        throw error;
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      throw error;
    }
  },

  // Buscar produtos por categoria
  async getProductsByCategory(categoryName: string) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", categoryName)
        .order("name");

      if (error) {
        console.error("Error fetching products by category:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Failed to fetch products by category:", error);
      throw error;
    }
  }
};