import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { PendingContributionsSection } from "@/components/admin/PendingContributionsSection";
import { FeedbackSection } from "@/components/admin/FeedbackSection";

const Content: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Conteúdo</h1>
        <p className="text-muted-foreground">
          Gerencie contribuições, ofertas diárias e feedback dos usuários
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Contribuições
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">2,341</div>
            <p className="text-xs text-muted-foreground">
              +15% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aprovadas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">1,987</div>
            <p className="text-xs text-muted-foreground">
              84.9% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">298</div>
            <p className="text-xs text-muted-foreground">
              12.7% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rejeitadas
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">56</div>
            <p className="text-xs text-muted-foreground">
              2.4% do total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6">
        {/* Pending Contributions */}
        <Card>
          <CardHeader>
            <CardTitle>Contribuições Pendentes</CardTitle>
            <CardDescription>
              Ofertas diárias que precisam de aprovação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PendingContributionsSection />
          </CardContent>
        </Card>

        {/* Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback e Sugestões</CardTitle>
            <CardDescription>
              Sugestões dos usuários para melhorias na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeedbackSection />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Content;