
import { supabase } from '@/integrations/supabase/client';
import { ComparisonData } from '@/lib/types';
import { errorHandler } from '@/lib/errorHandler';
import { logger } from '@/lib/logger';

export const supabaseComparisonService = {
  async getUserComparisons(userId: string) {
    try {
      logger.info('Fetching comparisons for user', { userId });
      
      // Query otimizada com JOIN para evitar N+1
      const { data, error } = await supabase
        .from('comparisons')
        .select(`
          *,
          comparison_products (
            id,
            product:products (
              id,
              name,
              quantity,
              unit,
              category
            )
          ),
          prices:product_prices (
            price,
            product:products(id, name, quantity, unit),
            store:stores(id, name)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching comparisons', error);
        throw error;
      }

      logger.info('Fetched comparisons with prices', { count: data?.length });
      
      // Garantir que cada comparação tenha o array de prices
      return (data || []).map(comparison => ({
        ...comparison,
        prices: comparison.prices || []
      }));
    } catch (error) {
      logger.error('Failed to fetch user comparisons', error);
      // Retornar array vazio em vez de propagar o erro para evitar loading infinito
      return [];
    }
  },

  async saveComparison(userId: string, comparisonData: ComparisonData) {
    return errorHandler.handleAsync(
      async () => {
        logger.info('Saving comparison', { userId, productCount: comparisonData.products.length });
        
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

        if (comparisonError) throw comparisonError;

        logger.info('Comparison created', { comparisonId: comparison.id });

        // Salvar produtos, lojas e preços com rollback em caso de erro
        try {
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
                  category: product.category || 'outros',
                })
                .select()
                .single();

              if (productError) throw productError;
              productId = newProduct.id;
              logger.info('Created new product', { productId, name: product.name });
            }

            // Associar produto à comparação
            await supabase
              .from('comparison_products')
              .insert({
                comparison_id: comparison.id,
                product_id: productId,
              });

            // Salvar preços para TODOS os estabelecimentos na comparação
            for (const store of comparisonData.stores) {
              const price = product.prices[store.id];
              
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

                if (storeError) throw storeError;
                storeId = newStore.id;
                logger.info('Created new store', { storeId, name: store.name });
              }

              // Salvar preço com referência à comparação
              const priceValue = price || 0;
              const { error: priceError } = await supabase
                .from('product_prices')
                .insert({
                  product_id: productId,
                  store_id: storeId,
                  price: priceValue,
                  comparison_id: comparison.id,
                });

              if (priceError) throw priceError;
            }
          }

          logger.info('Comparison saved successfully', { comparisonId: comparison.id });
          return comparison;
        } catch (error) {
          // Rollback: deletar a comparação se algo falhou
          logger.error('Error saving comparison details, rolling back', error);
          await supabase.from('comparisons').delete().eq('id', comparison.id);
          throw error;
        }
      },
      { component: 'comparisonService', action: 'salvar comparação', userId },
      { severity: 'high', showToast: true }
    );
  },

  async deleteComparison(comparisonId: string) {
    return errorHandler.handleAsync(
      async () => {
        logger.info('Deleting comparison', { comparisonId });
        
        // Deletar preços associados primeiro
        await supabase
          .from('product_prices')
          .delete()
          .eq('comparison_id', comparisonId);

        // Deletar produtos da comparação
        await supabase
          .from('comparison_products')
          .delete()
          .eq('comparison_id', comparisonId);

        // Deletar a comparação
        const { error } = await supabase
          .from('comparisons')
          .delete()
          .eq('id', comparisonId);

        if (error) throw error;

        logger.info('Comparison deleted successfully', { comparisonId });
      },
      { component: 'comparisonService', action: 'deletar comparação', metadata: { comparisonId } },
      { severity: 'high', showToast: true }
    );
  },

  async updateComparison(comparisonId: string, comparisonData: Partial<ComparisonData>) {
    return errorHandler.handleAsync(
      async () => {
        const { data, error } = await supabase
          .from('comparisons')
          .update({
            location: comparisonData.location,
            updated_at: new Date().toISOString()
          })
          .eq('id', comparisonId)
          .select()
          .single();

        if (error) throw error;

        logger.info('Comparison updated', { comparisonId });
        return data;
      },
      { component: 'comparisonService', action: 'atualizar comparação', metadata: { comparisonId } },
      { severity: 'medium', showToast: true }
    );
  },
};
