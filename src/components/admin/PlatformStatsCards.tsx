import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  TrendingUp, 
  Activity, 
  MessageSquare, 
  ShoppingCart,
  Database,
  AlertTriangle
} from "lucide-react";

interface PlatformStatsProps {
  analytics: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    userGrowthRate: number;
    premiumUsers: number;
    freeUsers: number;
    totalContributions: number;
    pendingContributions: number;
    totalSuggestions: number;
    openSuggestions: number;
    totalComparisons: number;
    comparisonsThisMonth: number;
  };
  dbUsage?: {
    percent_used: number;
    db_size_bytes: number;
    limit_bytes: number;
  };
}

export const PlatformStatsCards: React.FC<PlatformStatsProps> = ({ 
  analytics, 
  dbUsage 
}) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getGrowthBadge = (rate: number) => {
    if (rate > 0) {
      return <Badge className="bg-green-100 text-green-800">+{rate.toFixed(1)}%</Badge>;
    } else if (rate < 0) {
      return <Badge variant="destructive">-{Math.abs(rate).toFixed(1)}%</Badge>;
    }
    return <Badge variant="outline">0%</Badge>;
  };

  const statsCards = [
    {
      title: "Total de Usuários",
      value: analytics.totalUsers.toLocaleString(),
      description: `${analytics.activeUsers} ativos`,
      icon: Users,
      trend: getGrowthBadge(analytics.userGrowthRate),
      color: "text-blue-600",
    },
    {
      title: "Usuários Premium",
      value: analytics.premiumUsers.toLocaleString(),
      description: `${((analytics.premiumUsers / analytics.totalUsers) * 100).toFixed(1)}% conversão`,
      icon: TrendingUp,
      trend: <Badge className="bg-purple-100 text-purple-800">
        {analytics.premiumUsers}/{analytics.totalUsers}
      </Badge>,
      color: "text-purple-600",
    },
    {
      title: "Contribuições",
      value: analytics.totalContributions.toLocaleString(),
      description: `${analytics.pendingContributions} pendentes`,
      icon: ShoppingCart,
      trend: analytics.pendingContributions > 0 
        ? <Badge variant="outline">{analytics.pendingContributions} ⏳</Badge>
        : <Badge className="bg-green-100 text-green-800">✓ Em dia</Badge>,
      color: "text-green-600",
    },
    {
      title: "Sugestões",
      value: analytics.totalSuggestions.toLocaleString(),
      description: `${analytics.openSuggestions} abertas`,
      icon: MessageSquare,
      trend: analytics.openSuggestions > 0 
        ? <Badge variant="outline">{analytics.openSuggestions} 📝</Badge>
        : <Badge className="bg-green-100 text-green-800">✓ Em dia</Badge>,
      color: "text-orange-600",
    },
    {
      title: "Comparações",
      value: analytics.totalComparisons.toLocaleString(),
      description: `${analytics.comparisonsThisMonth} este mês`,
      icon: Activity,
      trend: <Badge variant="outline">{analytics.comparisonsThisMonth} 📊</Badge>,
      color: "text-indigo-600",
    },
  ];

  if (dbUsage) {
    statsCards.push({
      title: "Uso do Banco",
      value: `${dbUsage.percent_used}%`,
      description: `${formatBytes(dbUsage.db_size_bytes)} / ${formatBytes(dbUsage.limit_bytes)}`,
      icon: Database,
      trend: dbUsage.percent_used > 80 
        ? <Badge variant="destructive">⚠️ Alto</Badge>
        : dbUsage.percent_used > 50
        ? <Badge variant="outline">⚠️ Médio</Badge>
        : <Badge className="bg-green-100 text-green-800">✓ OK</Badge>,
      color: dbUsage.percent_used > 80 ? "text-red-600" : "text-blue-600",
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {statsCards.map((card, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">
              {card.value}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
              {card.trend}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};