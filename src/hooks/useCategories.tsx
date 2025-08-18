import { useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/categoryService';
import { useToast } from '@/hooks/use-toast';
import { Category } from '@/lib/types';

export const CATEGORY_QUERY_KEYS = {
  all: ['categories'],
  byId: (id: string) => ['categories', id],
  products: (categoryName: string) => ['categories', categoryName, 'products']
} as const;

export const useCategories = () => {
  const { toast } = useToast();

  const {
    data: categories = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: CATEGORY_QUERY_KEYS.all,
    queryFn: categoryService.getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2
  });

  // Tratamento de erro separado
  if (error) {
    console.error('Erro ao carregar categorias:', error);
    toast({
      title: 'Erro ao carregar categorias',
      description: 'Não foi possível carregar as categorias. Tente novamente.',
      variant: 'destructive'
    });
  }

  return {
    categories,
    isLoading,
    error,
    refetch
  };
};

export const useCategory = (id: string) => {
  const { toast } = useToast();

  const {
    data: category,
    isLoading,
    error
  } = useQuery({
    queryKey: CATEGORY_QUERY_KEYS.byId(id),
    queryFn: () => categoryService.getCategoryById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  });

  // Tratamento de erro separado
  if (error) {
    console.error('Erro ao carregar categoria:', error);
    toast({
      title: 'Erro ao carregar categoria',
      description: 'Não foi possível carregar a categoria.',
      variant: 'destructive'
    });
  }

  return {
    category,
    isLoading,
    error
  };
};

export const useCategoryProducts = (categoryName: string) => {
  const { toast } = useToast();

  const {
    data: products = [],
    isLoading,
    error
  } = useQuery({
    queryKey: CATEGORY_QUERY_KEYS.products(categoryName),
    queryFn: () => categoryService.getProductsByCategory(categoryName),
    enabled: !!categoryName,
    staleTime: 3 * 60 * 1000 // 3 minutos
  });

  // Tratamento de erro separado
  if (error) {
    console.error('Erro ao carregar produtos da categoria:', error);
    toast({
      title: 'Erro ao carregar produtos',
      description: 'Não foi possível carregar os produtos da categoria.',
      variant: 'destructive'
    });
  }

  return {
    products,
    isLoading,
    error
  };
};

export const useCategoryMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidateCategories = () => {
    queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
  };

  const createCategory = async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newCategory = await categoryService.createCategory(categoryData);
      invalidateCategories();
      toast({
        title: 'Categoria criada',
        description: 'A categoria foi criada com sucesso.'
      });
      return newCategory;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast({
        title: 'Erro ao criar categoria',
        description: 'Não foi possível criar a categoria.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const updatedCategory = await categoryService.updateCategory(id, categoryData);
      invalidateCategories();
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.byId(id) });
      toast({
        title: 'Categoria atualizada',
        description: 'A categoria foi atualizada com sucesso.'
      });
      return updatedCategory;
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast({
        title: 'Erro ao atualizar categoria',
        description: 'Não foi possível atualizar a categoria.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await categoryService.deleteCategory(id);
      invalidateCategories();
      queryClient.removeQueries({ queryKey: CATEGORY_QUERY_KEYS.byId(id) });
      toast({
        title: 'Categoria excluída',
        description: 'A categoria foi excluída com sucesso.'
      });
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast({
        title: 'Erro ao excluir categoria',
        description: 'Não foi possível excluir a categoria.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    invalidateCategories
  };
};