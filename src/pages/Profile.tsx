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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Meu Perfil
              </h1>
              <p className="text-muted-foreground">
                Gerencie suas informações e configurações da conta
              </p>
            </div>
            <Badge
              variant={profile.is_online ? "default" : "secondary"}
              className="flex items-center gap-1 px-3 py-1"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  profile.is_online ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              {profile.is_online ? "Online" : "Offline"}
            </Badge>
          </div>
          <Separator />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Informações do Perfil */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-muted/20">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-2xl" />
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                      <User className="w-5 h-5" />
                    </div>
                    Informações Pessoais
                  </CardTitle>
                  {!isEditing ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="hover:bg-muted/50"
                    >
                      <Edit className="w-4 h-4 mr-2" />
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
                        className="hover:bg-muted/50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">
                      Nome
                    </Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        placeholder="Digite seu nome"
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 p-3 rounded-lg bg-muted/30 text-foreground">
                        {profile.name || "Nome não informado"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <div className="mt-1 p-3 rounded-lg bg-muted/30 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{user.email}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas da Conta */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-muted/20">
              <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-xl" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <Activity className="w-5 h-5" />
                  </div>
                  Estatísticas da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-green-50/50 to-green-100/30 dark:from-green-950/20 dark:to-green-900/10 border border-green-200/30 dark:border-green-800/30">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-foreground">Comparações Este Mês</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {profile.comparisons_made_this_month || 0}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 border border-blue-200/30 dark:border-blue-800/30">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-foreground">Membro Desde</span>
                    </div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 capitalize">
                      {memberSince}
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50/50 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10 border border-purple-200/30 dark:border-purple-800/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold text-foreground">Última Atividade</span>
                  </div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    {lastActivity}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Configurações da Conta */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-muted/20">
              <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-orange-400/10 to-red-400/10 rounded-full blur-xl" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
                    <Settings className="w-5 h-5" />
                  </div>
                  Configurações da Conta
                </CardTitle>
                <CardDescription>
                  Gerencie suas preferências e configurações de segurança
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Bell className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Notificações por email</span>
                    </div>
                    <Badge variant="secondary">Em breve</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Autenticação de dois fatores</span>
                    </div>
                    <Badge variant="secondary">Em breve</Badge>
                  </div>
                </div>

                <Separator />

                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair da Conta
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Status do Plano */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <PlanStatus />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}