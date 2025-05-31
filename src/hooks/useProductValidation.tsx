
import { useState } from "react";
import { Product } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

export const useProductValidation = (existingProducts: Product[]) => {
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<{
    newProductName: string;
    existingProduct: Product;
    onReplace: () => void;
    onKeepBoth: () => void;
  } | null>(null);

  const checkForSimilarProducts = (newProductName: string): Product | null => {
    const normalizedNewName = newProductName.toLowerCase().trim();
    
    // Busca por correspondência exata
    const exactMatch = existingProducts.find(
      product => product.name.toLowerCase().trim() === normalizedNewName
    );
    
    if (exactMatch) {
      return exactMatch;
    }

    // Busca por correspondência parcial (uma palavra contém a outra)
    const partialMatch = existingProducts.find(product => {
      const existingName = product.name.toLowerCase().trim();
      
      // Verifica se o novo nome está contido no existente ou vice-versa
      return existingName.includes(normalizedNewName) || normalizedNewName.includes(existingName);
    });

    return partialMatch || null;
  };

  const validateProductName = (
    newProductName: string,
    onProceed: () => void,
    onReplace?: (existingProduct: Product) => void
  ): boolean => {
    if (!newProductName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "O nome do produto não pode estar vazio.",
        variant: "destructive",
      });
      return false;
    }

    const similarProduct = checkForSimilarProducts(newProductName);
    
    if (similarProduct) {
      const isExactMatch = similarProduct.name.toLowerCase().trim() === newProductName.toLowerCase().trim();
      
      if (isExactMatch) {
        // Correspondência exata - oferecer substituição
        setDuplicateInfo({
          newProductName,
          existingProduct: similarProduct,
          onReplace: () => {
            if (onReplace) {
              onReplace(similarProduct);
            }
            setShowDuplicateDialog(false);
            setDuplicateInfo(null);
          },
          onKeepBoth: () => {
            toast({
              title: "Nome deve ser único",
              description: "Por favor, escolha um nome diferente para o produto.",
              variant: "destructive",
            });
            setShowDuplicateDialog(false);
            setDuplicateInfo(null);
          }
        });
      } else {
        // Correspondência parcial - oferecer opções
        setDuplicateInfo({
          newProductName,
          existingProduct: similarProduct,
          onReplace: () => {
            if (onReplace) {
              onReplace(similarProduct);
            }
            setShowDuplicateDialog(false);
            setDuplicateInfo(null);
          },
          onKeepBoth: () => {
            onProceed();
            setShowDuplicateDialog(false);
            setDuplicateInfo(null);
          }
        });
      }
      
      setShowDuplicateDialog(true);
      return false;
    }

    // Não há produtos similares, prosseguir
    onProceed();
    return true;
  };

  const closeDuplicateDialog = () => {
    setShowDuplicateDialog(false);
    setDuplicateInfo(null);
  };

  return {
    validateProductName,
    showDuplicateDialog,
    duplicateInfo,
    closeDuplicateDialog,
  };
};
