
import { supabase } from '@/lib/supabase';
import { ComparisonData } from '@/lib/types';

export const supabaseComparisonService = {
  async getUserComparisons(userId: string) {
    const { data, error } = await supabase
      .from('comparisons')
      .select(`
        *,
        comparison_products (
          product:products (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comparisons:', error);
      throw error;
    }

    return data || [];
  },

  async saveComparison(userId: string, comparisonData: ComparisonData) {
    // Primeiro, salvar a comparação
    const { data: comparison, error: comparisonError } = await supabase
      .from('comparisons')
      .insert({
        user_id: userId,
        date: comparisonData.date?.toISOString() || new Date().toISOString(),
        title: `Comparação ${new Date().toLocaleDateString()}`,
      })
      .select()
      .single();

    if (comparisonError) {
      console.error('Error saving comparison:', comparisonError);
      throw comparisonError;
    }

    // Salvar produtos e lojas se necessário
    for (const product of comparisonData.products) {
      // Verificar se o produto já existe
      let { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('name', product.name)
        .eq('quantity', product.quantity)
        .eq('unit', product.unit)
        .single();

      let productId = existingProduct?.id;

      if (!existingProduct) {
        // Criar novo produto
        const { data: newProduct, error: productError } = await supabase
          .from('products')
          .insert({
            name: product.name,
            quantity: product.quantity,
            unit: product.unit,
          })
          .select()
          .single();

        if (productError) throw productError;
        productId = newProduct.id;
      }

      // Associar produto à comparação
      await supabase
        .from('comparison_products')
        .insert({
          comparison_id: comparison.id,
          product_id: productId,
        });

      // Salvar preços
      for (const store of comparisonData.stores) {
        const price = product.prices[store.id];
        if (price && price > 0) {
          // Verificar se a loja existe
          let { data: existingStore } = await supabase
            .from('stores')
            .select('id')
            .eq('name', store.name)
            .single();

          let storeId = existingStore?.id;

          if (!existingStore) {
            // Criar nova loja
            const { data: newStore, error: storeError } = await supabase
              .from('stores')
              .insert({ name: store.name })
              .select()
              .single();

            if (storeError) throw storeError;
            storeId = newStore.id;
          }

          // Salvar preço
          await supabase
            .from('product_prices')
            .insert({
              product_id: productId,
              store_id: storeId,
              price: price,
              comparison_id: comparison.id,
            });
        }
      }
    }

    return comparison;
  },

  async deleteComparison(comparisonId: string) {
    const { error } = await supabase
      .from('comparisons')
      .delete()
      .eq('id', comparisonId);

    if (error) {
      console.error('Error deleting comparison:', error);
      throw error;
    }
  },
};
