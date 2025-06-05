
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useState } from "react";

export const useContributionActions = () => {
  const { user } = useAuth();
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);

  const handleSharePrices = () => {
    if (!user) {
      toast.error("Você precisa estar logado para compartilhar preços.");
      return;
    }
    
    setIsPriceModalOpen(true);
    console.log("Share prices modal opened by user:", user.id);
  };

  const handleSuggestImprovement = () => {
    if (!user) {
      toast.error("Você precisa estar logado para enviar sugestões.");
      return;
    }
    
    setIsSuggestionModalOpen(true);
    console.log("Suggest improvement modal opened by user:", user.id);
  };

  const handleShareApp = () => {
    // Esta ação não precisa de login
    const shareText = "Confira o O Esperto Comparador - Compare preços e economize nas suas compras!";
    const shareUrl = window.location.origin;
    
    if (navigator.share) {
      navigator.share({
        title: "O Esperto Comparador",
        text: shareText,
        url: shareUrl,
      }).catch(() => {
        // Fallback para clipboard
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast.success("Link copiado para a área de transferência!");
      });
    } else {
      // Fallback para clipboard
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  const handleStartContributing = () => {
    // Redireciona para o grupo do WhatsApp
    const whatsappUrl = "https://chat.whatsapp.com/J3MNd2rtXey2ULOTifkbf";
    window.open(whatsappUrl, '_blank');
    toast.success("Redirecionando para o grupo do WhatsApp...");
    console.log("WhatsApp group opened");
  };

  const closePriceModal = () => setIsPriceModalOpen(false);
  const closeSuggestionModal = () => setIsSuggestionModalOpen(false);

  return {
    handleSharePrices,
    handleSuggestImprovement,
    handleShareApp,
    handleStartContributing,
    isPriceModalOpen,
    isSuggestionModalOpen,
    closePriceModal,
    closeSuggestionModal,
  };
};
