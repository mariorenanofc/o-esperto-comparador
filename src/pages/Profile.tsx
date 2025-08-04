import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { PlanStatus } from "@/components/PlanStatus";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Calendar,
  Settings,
  Activity,
  TrendingUp,
  Shield,
  Bell,
  LogOut,
  Edit,
  Save,
  X,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const { currentPlan } = useSubscription();
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
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-br from-accent/5 to-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-to-br from-secondary/5 to-accent/5 rounded-full blur-2xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
                ✨ Meu Perfil
              </h1>
              <p className="text-lg text-muted-foreground">
                Gerencie suas informações e configurações da conta
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-full blur-lg animate-pulse" />
              <Badge
                variant={profile.is_online ? "default" : "secondary"}
                className={`relative flex items-center gap-2 px-4 py-2 text-sm font-semibold shadow-lg ${
                  profile.is_online 
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-green-500/25" 
                    : "bg-gradient-to-r from-gray-500/10 to-gray-600/10 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    profile.is_online ? "bg-white animate-pulse" : "bg-gray-400"
                  }`}
                />
                {profile.is_online ? (
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Online
                  </div>
                ) : (
                  "Offline"
                )}
              </Badge>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Informações do Perfil */}
          <div className="lg:col-span-2 space-y-8">
            {/* Informações Básicas */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-muted/20 backdrop-blur-sm border border-border/50 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.01] group animate-scale-in">
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl animate-pulse" />
              
              <CardHeader className="relative z-10 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-sm animate-pulse" />
                      <div className="relative p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                        <User className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Informações Pessoais
                      </span>
                      <p className="text-sm text-muted-foreground font-normal mt-1">
                        Seus dados principais da conta
                      </p>
                    </div>
                  </CardTitle>
                  {!isEditing ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 group/btn"
                    >
                      <Edit className="w-4 h-4 mr-2 group-hover/btn:rotate-12 transition-transform duration-300" />
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false);
                          setEditedName(profile?.name || "");
                        }}
                        className="hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-green-500/25 transition-all duration-300"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading ? "Salvando..." : "Salvar"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-6">
                <div className="grid gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Nome
                    </Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        placeholder="Digite seu nome"
                        className="h-12 border-border/50 focus:border-blue-500 transition-all duration-300 bg-background/50 backdrop-blur-sm"
                      />
                    ) : (
                      <div className="h-12 p-4 rounded-lg bg-gradient-to-r from-muted/30 to-muted/10 border border-border/30 flex items-center">
                        <span className="text-foreground font-medium">
                          {profile.name || "Nome não informado"}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-500" />
                      Email
                    </Label>
                    <div className="h-12 p-4 rounded-lg bg-gradient-to-r from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 border border-blue-200/30 dark:border-blue-800/30 flex items-center gap-3">
                      <div className="p-1 rounded-md bg-blue-500/10">
                        <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-foreground font-medium">{user.email}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas da Conta */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-muted/20 backdrop-blur-sm border border-border/50 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.01] group animate-scale-in">
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-xl animate-pulse delay-500" />
              
              <CardHeader className="relative z-10 pb-4">
                <CardTitle className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl blur-sm animate-pulse" />
                    <div className="relative p-3 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 text-white shadow-lg">
                      <Activity className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      Estatísticas da Conta
                    </span>
                    <p className="text-sm text-muted-foreground font-normal mt-1">
                      Seu desempenho e atividade
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/20 dark:to-emerald-900/10 border border-emerald-200/30 dark:border-emerald-800/30 hover:shadow-lg transition-all duration-300 group/card">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg group-hover/card:scale-110 transition-transform duration-300">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-foreground">Comparações Este Mês</span>
                        <p className="text-xs text-muted-foreground">Pesquisas realizadas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                        {profile.comparisons_made_this_month || 0}
                      </p>
                      <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70">
                        ótimo progresso! 🎉
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-6 rounded-xl bg-gradient-to-r from-sky-50/50 to-sky-100/30 dark:from-sky-950/20 dark:to-sky-900/10 border border-sky-200/30 dark:border-sky-800/30 hover:shadow-lg transition-all duration-300 group/card">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-lg group-hover/card:scale-110 transition-transform duration-300">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-foreground">Membro Desde</span>
                        <p className="text-xs text-muted-foreground">Data de cadastro</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-sky-600 dark:text-sky-400 capitalize">
                        {memberSince}
                      </p>
                      <p className="text-sm text-sky-600/70 dark:text-sky-400/70">
                        bem-vindo! 👋
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 rounded-xl bg-gradient-to-r from-violet-50/50 to-violet-100/30 dark:from-violet-950/20 dark:to-violet-900/10 border border-violet-200/30 dark:border-violet-800/30 hover:shadow-lg transition-all duration-300 group/card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg group-hover/card:scale-110 transition-transform duration-300">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-foreground">Última Atividade</span>
                        <p className="text-xs text-muted-foreground">Seu último acesso</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-violet-600 dark:text-violet-400">
                        {lastActivity}
                      </p>
                      <p className="text-xs text-violet-600/70 dark:text-violet-400/70">
                        {profile.is_online ? "agora online! ⚡" : "volte em breve! 💜"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configurações da Conta */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-muted/20 backdrop-blur-sm border border-border/50 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.01] group animate-scale-in">
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-orange-400/10 to-red-400/10 rounded-full blur-xl animate-pulse delay-700" />
              
              <CardHeader className="relative z-10 pb-4">
                <CardTitle className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl blur-sm animate-pulse" />
                    <div className="relative p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
                      <Settings className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Configurações da Conta
                    </span>
                    <p className="text-sm text-muted-foreground font-normal mt-1">
                      Gerencie suas preferências e segurança
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-50/50 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10 border border-amber-200/30 dark:border-amber-800/30 hover:shadow-lg transition-all duration-300 group/item">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">Notificações por email</span>
                        <p className="text-xs text-muted-foreground">Receba alertas importantes</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700">
                      🚀 Em breve
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-indigo-50/50 to-indigo-100/30 dark:from-indigo-950/20 dark:to-indigo-900/10 border border-indigo-200/30 dark:border-indigo-800/30 hover:shadow-lg transition-all duration-300 group/item">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">Autenticação de dois fatores</span>
                        <p className="text-xs text-muted-foreground">Proteja ainda mais sua conta</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-gradient-to-r from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700">
                      🔐 Em breve
                    </Badge>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6" />
                  <Button
                    variant="destructive"
                    onClick={handleSignOut}
                    className="w-full h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-red-500/25 transition-all duration-300 hover:scale-[1.02] group/btn"
                  >
                    <LogOut className="w-5 h-5 mr-3 group-hover/btn:scale-110 transition-transform duration-300" />
                    <span>Sair da Conta</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Status do Plano */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 animate-fade-in">
              <PlanStatus />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}