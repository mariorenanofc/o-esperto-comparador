import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Target, 
  Award, 
  Calculator, 
  PiggyBank, 
  ShoppingBag,
  Calendar,
  Star,
  Sparkles,
  Zap,
  Trophy,
  Flame
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
  const generateInsights = (): EconomyInsight[] => {
    const insights: EconomyInsight[] = [];
    
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

    if (avgSavingsPerComparison > 15) {
      insights.push({
        type: 'recommendation',
        title: 'Excelente Eficiência! ⭐',
        description: `Você economiza em média R$ ${avgSavingsPerComparison.toFixed(2)} por comparação. Isso é acima da média!`,
        priority: 'medium',
        icon: Star
      });
    }

    const avgMonthlySavings = monthlyData.length > 0 
      ? monthlyData.reduce((sum, m) => sum + m.savings, 0) / monthlyData.length 
      : 0;
    
    if (avgMonthlySavings > 0) {
      const nextMonthGoal = avgMonthlySavings * 1.2;
      insights.push({
        type: 'goal',
        title: 'Meta do Próximo Mês 🎯',
        description: `Baseado no seu histórico, tente economizar R$ ${nextMonthGoal.toFixed(2)} no próximo mês.`,
        value: `R$ ${nextMonthGoal.toFixed(2)}`,
        priority: 'medium',
        icon: Target
      });
    }

    if (comparisonCount >= 10) {
      insights.push({
        type: 'achievement',
        title: 'Comparador Expert! 🔍',
        description: `Você já fez ${comparisonCount} comparações. Sua dedicação está valendo a pena!`,
        priority: 'medium',
        icon: Calculator
      });
    }

    if (monthlyData.length >= 3) {
      const avgMonthly = monthlyData.reduce((sum, m) => sum + m.savings, 0) / monthlyData.length;
      const yearlyProjection = avgMonthly * 12;
      
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

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high': return { 
        dot: 'bg-emerald-500', 
        border: 'border-emerald-500/30',
        bg: 'from-emerald-500/10 to-transparent'
      };
      case 'medium': return { 
        dot: 'bg-amber-500', 
        border: 'border-amber-500/30',
        bg: 'from-amber-500/10 to-transparent'
      };
      case 'low': return { 
        dot: 'bg-blue-500', 
        border: 'border-blue-500/30',
        bg: 'from-blue-500/10 to-transparent'
      };
      default: return { 
        dot: 'bg-muted-foreground', 
        border: 'border-muted',
        bg: 'from-muted/50 to-transparent'
      };
    }
  };

  const getInsightTypeLabel = (type: string) => {
    switch (type) {
      case 'achievement': return { label: 'Conquista', color: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30' };
      case 'trend': return { label: 'Tendência', color: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' };
      case 'recommendation': return { label: 'Dica', color: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30' };
      case 'goal': return { label: 'Meta', color: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30' };
      default: return { label: 'Insight', color: 'bg-muted text-muted-foreground' };
    }
  };

  const getNextMilestone = () => {
    const milestones = [50, 100, 250, 500, 1000, 2500, 5000];
    const nextMilestone = milestones.find(m => m > totalSavings);
    if (!nextMilestone) return null;
    
    const progress = (totalSavings / nextMilestone) * 100;
    return { target: nextMilestone, progress };
  };

  const milestone = getNextMilestone();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Análise Inteligente</span>
        </div>
        <h3 className="text-2xl font-bold mb-2">Insights Personalizados</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Análises automáticas do seu comportamento de economia para ajudá-lo a economizar mais
        </p>
      </motion.div>

      {/* Milestone Progress */}
      {milestone && (
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-purple-500/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">Próximo Marco: R$ {milestone.target}</h4>
                  <p className="text-sm text-muted-foreground">
                    Faltam R$ {(milestone.target - totalSavings).toFixed(2).replace(".", ",")} para alcançar!
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-primary">{milestone.progress.toFixed(0)}%</span>
                </div>
              </div>
              <div className="relative">
                <Progress value={milestone.progress} className="h-4 bg-muted/50" />
                <div className="absolute -top-1 left-0 flex items-center gap-1" style={{ left: `${Math.min(milestone.progress, 95)}%` }}>
                  <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                </div>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="font-medium">R$ {totalSavings.toFixed(2).replace(".", ",")}</span>
                <span className="text-muted-foreground">R$ {milestone.target.toFixed(2).replace(".", ",")}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Insights Grid */}
      <motion.div variants={itemVariants}>
        {insights.length === 0 ? (
          <Card className="bg-gradient-to-br from-muted/50 to-background">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Sem insights ainda</h4>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Faça mais comparações para gerar insights personalizados e dicas de economia!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {insights.map((insight, index) => {
              const IconComponent = insight.icon;
              const priorityStyles = getPriorityStyles(insight.priority);
              const typeInfo = getInsightTypeLabel(insight.type);
              
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={`h-full overflow-hidden group hover:shadow-xl transition-all duration-300 border ${priorityStyles.border}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${priorityStyles.bg} opacity-50`} />
                    <CardContent className="p-5 relative">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${
                            insight.priority === 'high' ? 'from-emerald-500 to-green-600' :
                            insight.priority === 'medium' ? 'from-amber-500 to-orange-600' :
                            'from-blue-500 to-indigo-600'
                          } shadow-lg group-hover:scale-110 transition-transform`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={`text-xs ${typeInfo.color}`}>
                              {typeInfo.label}
                            </Badge>
                          </div>
                          <h4 className="font-bold text-base mb-1">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
                          {insight.value && (
                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10">
                              <Zap className="w-4 h-4 text-primary" />
                              <span className="text-lg font-bold text-primary">{insight.value}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Stats Summary */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              Resumo Estatístico
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <Calculator className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{comparisonCount}</div>
                <div className="text-sm text-muted-foreground mt-1">Comparações</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                  <PiggyBank className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  R$ {avgSavingsPerComparison.toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Economia Média</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{monthlyData.length}</div>
                <div className="text-sm text-muted-foreground mt-1">Meses Ativos</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  R$ {monthlyData.length > 0 ? Math.max(...monthlyData.map(m => m.savings)).toFixed(0) : '0'}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Melhor Mês</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default EconomyInsights;