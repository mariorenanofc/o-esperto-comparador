import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { PlanStatus } from "@/components/PlanStatus";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Calendar,
  Activity,
  TrendingUp,
  Bell,
  LogOut,
  Edit,
  Save,
  X,
  Sparkles,
  Star,
  Zap,
  CreditCard,
  Crown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { getPlanById } from "@/lib/plans";
import Navbar from "@/components/Navbar";

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const { currentPlan, manageSubscription, createCheckout, isLoading: subscriptionLoading } = useSubscription();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile?.name || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveProfile = async () => {
    if (!user || !editedName.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name: editedName.trim() })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "✅ Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "❌ Erro ao atualizar",
        description: "Não foi possível salvar suas informações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "👋 Até logo!",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleManageSubscription = async () => {
    try {
      await manageSubscription();
    } catch (error) {
      console.error('Error managing subscription:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível abrir o gerenciamento de assinatura.",
        variant: "destructive",
      });
    }
  };

  const handleUpgrade = async (planId: string) => {
    try {
      await createCheckout(planId as any);
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível iniciar o processo de upgrade.",
        variant: "destructive",
      });
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 flex items-center justify-center">
        <Card className="relative overflow-hidden bg-gradient-to-br from-background/50 to-muted/30 backdrop-blur-sm border-0 shadow-2xl p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 animate-pulse" />
          <div className="relative z-10 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Carregando seu perfil...
              </h3>
              <p className="text-muted-foreground">✨ Preparando uma experiência incrível</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const memberSince = profile.created_at 
    ? format(new Date(profile.created_at), "MMMM 'de' yyyy", { locale: ptBR })
    : "Informação não disponível";

  const lastActivity = profile.last_activity
    ? format(new Date(profile.last_activity), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : "Nunca";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/98 to-muted/10">
      <Navbar />
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-br from-accent/5 to-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-4 md:py-8 max-w-6xl">
        {/* Header Simplificado */}
        <div className="mb-6 md:mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
                ✨ Meu Perfil
              </h1>
              <p className="text-sm text-muted-foreground">
                Gerencie suas informações e configurações
              </p>
            </div>
            {/* Status Badge Inline */}
            <Badge
              variant={profile.is_online ? "default" : "secondary"}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium ${
                profile.is_online 
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-0" 
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${profile.is_online ? "bg-white animate-pulse" : "bg-muted-foreground"}`} />
              {profile.is_online ? "Online" : "Offline"}
            </Badge>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Layout principal - Grid 2 colunas */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Coluna Principal - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Pessoais - Compacto */}
            <Card className="overflow-hidden border-border/50 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      <User className="w-4 h-4" />
                    </div>
                    Informações Pessoais
                  </CardTitle>
                  {!isEditing ? (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4 mr-1" /> Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setEditedName(profile?.name || ""); }}>
                        <X className="w-4 h-4" />
                      </Button>
                      <Button size="sm" onClick={handleSaveProfile} disabled={isLoading} className="bg-green-500 hover:bg-green-600 text-white">
                        <Save className="w-4 h-4 mr-1" /> {isLoading ? "..." : "Salvar"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Star className="w-3 h-3" /> Nome
                    </Label>
                    {isEditing ? (
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        placeholder="Digite seu nome"
                        className="h-10"
                      />
                    ) : (
                      <div className="h-10 px-3 py-2 rounded-md bg-muted/50 flex items-center text-sm font-medium">
                        {profile.name || "Nome não informado"}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email
                    </Label>
                    <div className="h-10 px-3 py-2 rounded-md bg-muted/50 flex items-center text-sm">
                      {user.email}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas - Grid Compacto 2x2 */}
            <Card className="overflow-hidden border-border/50 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 text-white">
                    <Activity className="w-4 h-4" />
                  </div>
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {/* Comparações */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Este Mês</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {profile.comparisons_made_this_month || 0}
                    </p>
                    <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">comparações</p>
                  </div>

                  {/* Membro Desde */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-950/30 dark:to-sky-900/20 border border-sky-200/50 dark:border-sky-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      <span className="text-xs font-medium text-sky-700 dark:text-sky-300">Membro</span>
                    </div>
                    <p className="text-sm font-bold text-sky-600 dark:text-sky-400 capitalize">
                      {memberSince}
                    </p>
                  </div>

                  {/* Última Atividade */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/30 dark:to-violet-900/20 border border-violet-200/50 dark:border-violet-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      <span className="text-xs font-medium text-violet-700 dark:text-violet-300">Atividade</span>
                    </div>
                    <p className="text-xs font-medium text-violet-600 dark:text-violet-400">
                      {lastActivity}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border border-amber-200/50 dark:border-amber-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Status</span>
                    </div>
                    <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                      {profile.is_online ? "⚡ Ativo" : "💤 Inativo"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botão Sair - Simples */}
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full h-11 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair da Conta
            </Button>
          </div>

          {/* Sidebar - Gerenciamento de Plano */}
          <div className="space-y-6">
            {/* Status do Plano */}
            <div className="sticky top-4">
              <PlanStatus />
              
              {/* Ações do Plano */}
              <Card className="mt-4 overflow-hidden border-border/50 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Crown className="w-4 h-4 text-amber-500" />
                    Gerenciar Plano
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentPlan === 'admin' ? (
                    <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-center">
                      <Crown className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Acesso Total</p>
                    </div>
                  ) : currentPlan === 'free' ? (
                    <>
                      <Button
                        onClick={() => handleUpgrade('premium')}
                        disabled={subscriptionLoading}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                        size="sm"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Upgrade Premium
                      </Button>
                      <Button
                        onClick={() => handleUpgrade('pro')}
                        disabled={subscriptionLoading}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade Pro
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleManageSubscription}
                        disabled={subscriptionLoading}
                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                        size="sm"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Gerenciar Assinatura
                      </Button>
                      {currentPlan === 'premium' && (
                        <Button
                          onClick={() => handleUpgrade('pro')}
                          disabled={subscriptionLoading}
                          variant="outline"
                          className="w-full"
                          size="sm"
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade Pro
                        </Button>
                      )}
                    </>
                  )}
                  
                  <Link to="/plans">
                    <Button variant="ghost" className="w-full text-xs text-muted-foreground" size="sm">
                      Ver todos os planos
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
