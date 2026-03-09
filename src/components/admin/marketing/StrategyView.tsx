import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { contentPillars, postingTimes, hashtagGroups, engagementRoutine, monthlyGoals } from "@/data/marketingStrategy";
import { Target, Clock, Hash, TrendingUp, Zap, Users } from "lucide-react";

export const StrategyView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Content Pillars */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-5 w-5 text-primary" />
            Pilares de Conteúdo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {contentPillars.map((pillar) => (
            <div key={pillar.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{pillar.icon}</span>
                  <span className="font-medium text-foreground">{pillar.name}</span>
                </div>
                <Badge variant="secondary">{pillar.percentage}%</Badge>
              </div>
              <Progress value={pillar.percentage} className="h-2" />
              <p className="text-xs text-muted-foreground">{pillar.description}</p>
              <div className="flex flex-wrap gap-1">
                {pillar.examples.slice(0, 3).map((ex) => (
                  <Badge key={ex} variant="outline" className="text-xs font-normal">
                    {ex}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Posting Schedule */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5 text-primary" />
            Horários de Pico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {postingTimes.map((time) => (
              <div key={time.day} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                <span className="w-16 text-sm font-medium text-foreground">{time.day.slice(0, 3)}</span>
                <span className="flex-1 text-sm text-primary font-medium">{time.best}</span>
                <span className="text-xs text-muted-foreground hidden sm:block">{time.reason}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Engagement Routine */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-5 w-5 text-primary" />
            Rotina de Engajamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {engagementRoutine.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-primary font-bold mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Hashtag Groups */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Hash className="h-5 w-5 text-primary" />
            Grupos de Hashtags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hashtagGroups.map((group) => (
            <div key={group.name}>
              <h5 className="text-sm font-semibold text-foreground mb-2">{group.name}</h5>
              <div className="flex flex-wrap gap-1">
                {group.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs font-normal cursor-pointer hover:bg-primary/10"
                    onClick={() => navigator.clipboard.writeText(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">💡 Clique em uma hashtag para copiar</p>
        </CardContent>
      </Card>

      {/* Monthly Goals */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-primary" />
            Metas Progressivas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">Mês</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Seguidores</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Engaj.</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Alcance</th>
                </tr>
              </thead>
              <tbody>
                {monthlyGoals.map((goal) => (
                  <tr key={String(goal.month)} className="border-b border-border/50">
                    <td className="py-2 font-medium text-foreground">{goal.month}</td>
                    <td className="py-2 text-primary font-medium">{goal.followers}</td>
                    <td className="py-2 text-foreground">{goal.engagement}</td>
                    <td className="py-2 text-muted-foreground">{goal.reach}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
