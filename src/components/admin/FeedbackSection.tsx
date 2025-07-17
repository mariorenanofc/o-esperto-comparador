import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { supabaseAdminService } from "@/services/supabase/adminService";
import { toast } from "sonner";

interface Suggestion {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  profiles?: {
    name: string | null;
    email: string | null;
  };
}

export const FeedbackSection = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      console.log("Fetching all suggestions...");

      const data = await supabaseAdminService.getAllSuggestions();
      console.log("Fetched suggestions:", data);
      setSuggestions(data || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast.error("Erro ao carregar sugestões");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleUpdateStatus = async (
    suggestionId: string,
    newStatus: string
  ) => {
    try {
      setActionLoading(suggestionId);
      console.log("Updating suggestion status:", { suggestionId, newStatus });

      await supabaseAdminService.updateSuggestionStatus(
        suggestionId,
        newStatus
      );
      toast.success(`Status da sugestão atualizado para ${newStatus}`);

      // Update local state
      setSuggestions((prev) =>
        prev.map((suggestion) =>
          suggestion.id === suggestionId
            ? { ...suggestion, status: newStatus }
            : suggestion
        )
      );
    } catch (error) {
      console.error("Error updating suggestion status:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao atualizar status: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Aberta
          </Badge>
        );
      case "in-review":
        return (
          <Badge variant="default">
            <AlertCircle className="w-3 h-3 mr-1" />
            Em Análise
          </Badge>
        );
      case "implemented":
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Implementada
          </Badge>
        );
      case "closed":
        return <Badge variant="outline">Fechada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "improvement":
        return (
          <Badge variant="outline" className="bg-blue-50 dark:text-gray-800">
            Melhoria
          </Badge>
        );
      case "feature":
        return (
          <Badge variant="outline" className="bg-green-50 dark:text-gray-800">
            Nova Funcionalidade
          </Badge>
        );
      case "bug":
        return (
          <Badge variant="outline" className="bg-red-50 dark:text-gray-800">
            Bug
          </Badge>
        );
      case "other":
        return (
          <Badge variant="outline" className="bg-gray-50 dark:text-gray-800">
            Outro
          </Badge>
        );
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feedback dos Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Carregando sugestões...</p>
        </CardContent>
      </Card>
    );
  }

  const openSuggestions = suggestions.filter((s) => s.status === "open");
  const inReviewSuggestions = suggestions.filter(
    (s) => s.status === "in-review"
  );
  const implementedSuggestions = suggestions.filter(
    (s) => s.status === "implemented"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Feedback dos Usuários</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchSuggestions}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{suggestions.length}</div>
            <p className="text-xs text-muted-foreground">Total de Sugestões</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {openSuggestions.length}
            </div>
            <p className="text-xs text-muted-foreground">Abertas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {inReviewSuggestions.length}
            </div>
            <p className="text-xs text-muted-foreground">Em Análise</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {implementedSuggestions.length}
            </div>
            <p className="text-xs text-muted-foreground">Implementadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions List */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Sugestões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestions.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-500 mt-2">Nenhuma sugestão encontrada.</p>
            </div>
          ) : (
            suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{suggestion.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {suggestion.description}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 ml-4">
                    {getStatusBadge(suggestion.status)}
                    {getCategoryBadge(suggestion.category)}
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  <p>
                    <strong>Usuário:</strong>{" "}
                    {suggestion.profiles?.name || "Nome não disponível"}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {suggestion.profiles?.email || "Email não disponível"}
                  </p>
                  <p>
                    <strong>Data:</strong>{" "}
                    {new Date(suggestion.created_at).toLocaleDateString(
                      "pt-BR"
                    )}
                  </p>
                </div>

                {suggestion.status !== "implemented" &&
                  suggestion.status !== "closed" && (
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={() =>
                          handleUpdateStatus(suggestion.id, "in-review")
                        }
                        variant="outline"
                        size="sm"
                        disabled={
                          actionLoading === suggestion.id ||
                          suggestion.status === "in-review"
                        }
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Analisar
                      </Button>
                      <Button
                        onClick={() =>
                          handleUpdateStatus(suggestion.id, "implemented")
                        }
                        variant="outline"
                        size="sm"
                        disabled={actionLoading === suggestion.id}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Implementar
                      </Button>
                      <Button
                        onClick={() =>
                          handleUpdateStatus(suggestion.id, "closed")
                        }
                        variant="outline"
                        size="sm"
                        disabled={actionLoading === suggestion.id}
                      >
                        Fechar
                      </Button>
                    </div>
                  )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
