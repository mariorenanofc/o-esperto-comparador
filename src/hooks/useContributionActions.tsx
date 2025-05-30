
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";

export const useContributionActions = () => {
  const { user } = useUser();

  const handleSharePrices = () => {
    if (!user) {
      toast.error("Você precisa estar logado para compartilhar preços.");
      return;
    }
    
    // TODO: Implementar modal/formulário para compartilhar preços
    toast.success("Funcionalidade de compartilhamento de preços em desenvolvimento!");
    console.log("Share prices action triggered by user:", user.id);
  };

  const handleSuggestImprovement = () => {
    if (!user) {
      toast.error("Você precisa estar logado para enviar sugestões.");
      return;
    }
    
    // TODO: Implementar modal/formulário para sugestões
    toast.success("Funcionalidade de sugestões em desenvolvimento!");
    console.log("Suggest improvement action triggered by user:", user.id);
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
    if (!user) {
      toast.error("Você precisa estar logado para começar a contribuir.");
      return;
    }
    
    // TODO: Implementar modal com opções de contribuição
    toast.success("Obrigado por querer contribuir! Funcionalidade em desenvolvimento.");
    console.log("Start contributing action triggered by user:", user.id);
  };

  return {
    handleSharePrices,
    handleSuggestImprovement,
    handleShareApp,
    handleStartContributing,
  };
};
