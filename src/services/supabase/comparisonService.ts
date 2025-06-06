
import { supabase } from '@/integrations/supabase/client';
import { ComparisonData } from '@/lib/types';

export const supabaseComparisonService = {
  async getUserComparisons(userId: string) {
    console.log('Fetching comparisons for user:', userId);
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

    console.log('Fetched comparisons:', data);
    return data || [];
  },

  async saveComparison(userId: string, comparisonData: ComparisonData) {
    console.log('Saving comparison for user:', userId, comparisonData);
    
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

    console.log('Comparison saved:', comparison);

    // Salvar produtos e lojas se necessário
    for (const product of comparisonData.products) {
      // Verificar se o produto já existe
      let { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('name', product.name)
        .eq('quantity', product.quantity)
        .eq('unit', product.unit)
        .maybeSingle();

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

        if (productError) {
          console.error('Error creating product:', productError);
          throw productError;
        }
        productId = newProduct.id;
        console.log('Created new product:', newProduct);
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
            .maybeSingle();

          let storeId = existingStore?.id;

          if (!existingStore) {
            // Criar nova loja
            const { data: newStore, error: storeError } = await supabase
              .from('stores')
              .insert({ name: store.name })
              .select()
              .single();

            if (storeError) {
              console.error('Error creating store:', storeError);
              throw storeError;
            }
            storeId = newStore.id;
            console.log('Created new store:', newStore);
          }

          // Salvar preço
          const { error: priceError } = await supabase
            .from('product_prices')
            .insert({
              product_id: productId,
              store_id: storeId,
              price: price,
              comparison_id: comparison.id,
            });

          if (priceError) {
            console.error('Error saving price:', priceError);
            throw priceError;
          }
        }
      }
    }

    console.log('All comparison data saved successfully');
    return comparison;
  },

  async deleteComparison(comparisonId: string) {
    console.log('Deleting comparison:', comparisonId);
    const { error } = await supabase
      .from('comparisons')
      .delete()
      .eq('id', comparisonId);

    if (error) {
      console.error('Error deleting comparison:', error);
      throw error;
    }

    console.log('Comparison deleted successfully');
  },
};
