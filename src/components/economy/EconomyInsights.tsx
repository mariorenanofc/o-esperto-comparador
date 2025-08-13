import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Target, 
  Award, 
  Calculator, 
  PiggyBank, 
  ShoppingBag,
  Calendar,
  Star
} from "lucide-react";

interface EconomyInsight {
  type: 'achievement' | 'trend' | 'recommendation' | 'goal';
  title: string;
  description: string;
  value?: string | number;
  trend?: 'up' | 'down' | 'stable';
  priority: 'high' | 'medium' | 'low';
  icon: any;
}

interface EconomyInsightsProps {
  totalSavings: number;
  monthlyData: Array<{ monthKey: string; label: string; savings: number }>;
  comparisonCount: number;
  avgSavingsPerComparison: number;
}

const EconomyInsights: React.FC<EconomyInsightsProps> = ({
  totalSavings,
  monthlyData,
  comparisonCount,
  avgSavingsPerComparison,
}) => {
  // Calcular insights automaticamente
  const generateInsights = (): EconomyInsight[] => {
    const insights: EconomyInsight[] = [];
    
    // Análise de tendência
    if (monthlyData.length >= 2) {
      const lastMonth = monthlyData[monthlyData.length - 1]?.savings || 0;
      const previousMonth = monthlyData[monthlyData.length - 2]?.savings || 0;
      const trend = lastMonth > previousMonth ? 'up' : lastMonth < previousMonth ? 'down' : 'stable';
      
      if (trend === 'up') {
        insights.push({
          type: 'trend',
          title: 'Economia em Alta! 📈',
          description: `Sua economia aumentou ${((lastMonth - previousMonth) / previousMonth * 100).toFixed(1)}% no último mês.`,
          trend: 'up',
          priority: 'high',
          icon: TrendingUp
        });
      }
    }

    // Conquistas baseadas em economia total
    if (totalSavings >= 100) {
      insights.push({
        type: 'achievement',
        title: 'Marco Alcançado! 🎉',
        description: `Você já economizou mais de R$ ${totalSavings.toFixed(0)}! Continue assim!`,
        value: `R$ ${totalSavings.toFixed(2)}`,
        priority: 'high',
        icon: Award
      });
    }

    // Recomendações baseadas em padrões
    if (avgSavingsPerComparison > 15) {
      insights.push({
        type: 'recommendation',
        title: 'Excelente Eficiência! ⭐',
        description: `Você economiza em média R$ ${avgSavingsPerComparison.toFixed(2)} por comparação. Isso é acima da média!`,
        priority: 'medium',
        icon: Star
      });
    }

    // Meta de economia mensal
    const avgMonthlySavings = monthlyData.length > 0 
      ? monthlyData.reduce((sum, m) => sum + m.savings, 0) / monthlyData.length 
      : 0;
    
    if (avgMonthlySavings > 0) {
      const nextMonthGoal = avgMonthlySavings * 1.2; // Meta 20% maior
      insights.push({
        type: 'goal',
        title: 'Meta do Próximo Mês 🎯',
        description: `Baseado no seu histórico, tente economizar R$ ${nextMonthGoal.toFixed(2)} no próximo mês.`,
        value: `R$ ${nextMonthGoal.toFixed(2)}`,
        priority: 'medium',
        icon: Target
      });
    }

    // Insight sobre frequência
    if (comparisonCount >= 10) {
      insights.push({
        type: 'achievement',
        title: 'Comparador Expert! 🔍',
        description: `Você já fez ${comparisonCount} comparações. Sua dedicação está valendo a pena!`,
        priority: 'medium',
        icon: Calculator
      });
    }

    // Projeção anual
    if (monthlyData.length >= 3) {
      const avgMonthlySavings = monthlyData.reduce((sum, m) => sum + m.savings, 0) / monthlyData.length;
      const yearlyProjection = avgMonthlySavings * 12;
      
      insights.push({
        type: 'trend',
        title: 'Projeção Anual 📊',
        description: `Mantendo esse ritmo, você pode economizar R$ ${yearlyProjection.toFixed(2)} este ano!`,
        value: `R$ ${yearlyProjection.toFixed(2)}`,
        priority: 'high',
        icon: PiggyBank
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const insights = generateInsights();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getInsightTypeLabel = (type: string) => {
    switch (type) {
      case 'achievement': return 'Conquista';
      case 'trend': return 'Tendência';
      case 'recommendation': return 'Dica';
      case 'goal': return 'Meta';
      default: return 'Insight';
    }
  };

  // Calcular o progresso para o próximo milestone
  const getNextMilestone = () => {
    const milestones = [50, 100, 250, 500, 1000, 2500, 5000];
    const nextMilestone = milestones.find(m => m > totalSavings);
    if (!nextMilestone) return null;
    
    const progress = (totalSavings / nextMilestone) * 100;
    return { target: nextMilestone, progress };
  };

  const milestone = getNextMilestone();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold flex items-center justify-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          Insights Inteligentes
        </h3>
        <p className="text-sm text-muted-foreground">
          Análises personalizadas do seu comportamento de economia
        </p>
      </div>

      {/* Progresso para próximo marco */}
      {milestone && (
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="w-4 h-4 text-primary" />
              Próximo Marco: R$ {milestone.target}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={milestone.progress} className="h-3" />
            <div className="flex justify-between text-sm">
              <span>R$ {totalSavings.toFixed(2)}</span>
              <span className="text-muted-foreground">
                Faltam R$ {(milestone.target - totalSavings).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Insights */}
      <div className="space-y-3">
        {insights.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Faça mais comparações para gerar insights personalizados!
              </p>
            </CardContent>
          </Card>
        ) : (
          insights.map((insight, index) => {
            const IconComponent = insight.icon;
            return (
              <Card key={index} className="transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(insight.priority)} mt-2`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <IconComponent className="w-4 h-4 text-primary" />
                        <Badge variant="outline" className="text-xs">
                          {getInsightTypeLabel(insight.type)}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      {insight.value && (
                        <div className="mt-2">
                          <span className="text-lg font-bold text-primary">{insight.value}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Resumo Estatístico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="w-4 h-4" />
            Resumo Estatístico
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{comparisonCount}</div>
            <div className="text-xs text-muted-foreground">Comparações feitas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              R$ {avgSavingsPerComparison.toFixed(0)}
            </div>
            <div className="text-xs text-muted-foreground">Economia média</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{monthlyData.length}</div>
            <div className="text-xs text-muted-foreground">Meses ativos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {monthlyData.length > 0 ? Math.max(...monthlyData.map(m => m.savings)).toFixed(0) : '0'}
            </div>
            <div className="text-xs text-muted-foreground">Melhor mês (R$)</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EconomyInsights;