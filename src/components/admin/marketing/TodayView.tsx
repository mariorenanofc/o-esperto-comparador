import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { getTodayContent } from "@/data/marketingCalendar";
import { postingTimes, hashtagGroups, dailyChecklist, engagementRoutine } from "@/data/marketingStrategy";
import { CalendarDays, Clock, Hash, CheckCircle2, Sparkles, Target, Palette } from "lucide-react";

const STORAGE_KEY = "marketing-checklist";

interface ChecklistState {
  [key: string]: boolean;
}

const getDateKey = () => new Date().toISOString().split("T")[0];

export const TodayView: React.FC = () => {
  const todayContent = getTodayContent();
  const today = new Date();
  const dayName = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][today.getDay()];
  const todayTime = postingTimes.find((t) => t.day === dayName);

  const [checklist, setChecklist] = useState<ChecklistState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.date === getDateKey()) return parsed.items;
      }
    } catch {}
    return {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: getDateKey(), items: checklist }));
  }, [checklist]);

  const toggleCheck = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalTasks = dailyChecklist.reduce((acc, p) => acc + p.tasks.length, 0) + 5; // +5 for content tasks

  const pillarColors: Record<string, string> = {
    Educativo: "bg-primary/10 text-primary",
    Engajamento: "bg-chart-4/10 text-orange-600",
    "Prova Social": "bg-chart-2/10 text-green-600",
    Bastidores: "bg-chart-5/10 text-purple-600",
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {today.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </h3>
              <p className="text-sm text-muted-foreground">
                {completedCount} de {totalTasks} tarefas concluídas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">
                  {Math.round((completedCount / totalTasks) * 100)}%
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / totalTasks) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Today's Content */}
      {todayContent && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-5 w-5 text-primary" />
              Conteúdo do Dia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={pillarColors[todayContent.day.pillar] || ""}>
                  {todayContent.day.pillar}
                </Badge>
                <Badge variant="secondary">
                  {todayContent.day.formatEmoji} {todayContent.day.format}
                </Badge>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Semana {todayContent.week.week}
                </Badge>
              </div>
              <h4 className="text-lg font-semibold text-foreground">{todayContent.day.theme}</h4>
              <p className="text-sm text-muted-foreground">
                <Target className="inline h-4 w-4 mr-1" />
                Foco da semana: <span className="font-medium text-foreground">{todayContent.week.focus}</span>
              </p>
            </div>

            {/* Content creation checklist */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-muted-foreground">Produção do conteúdo:</h5>
              {[
                "Criar arte no Canva",
                "Escrever legenda",
                "Publicar no feed",
                "Publicar stories",
                "Responder comentários",
              ].map((task) => {
                const key = `content-${task}`;
                return (
                  <label
                    key={key}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                  >
                    <Checkbox checked={!!checklist[key]} onCheckedChange={() => toggleCheck(key)} />
                    <span className={checklist[key] ? "line-through text-muted-foreground" : "text-foreground text-sm"}>
                      {task}
                    </span>
                  </label>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posting Time */}
      {todayTime && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-primary" />
              Melhor Horário para Postar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted-foreground">Horário principal</p>
                <p className="text-lg font-bold text-primary">{todayTime.best}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Alternativo</p>
                <p className="text-lg font-bold text-foreground">{todayTime.second}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">📌 {todayTime.reason}</p>
          </CardContent>
        </Card>
      )}

      {/* Daily Engagement Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Rotina Diária
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dailyChecklist.map((period) => (
            <div key={period.period}>
              <h5 className="text-sm font-semibold text-foreground mb-2">{period.period}</h5>
              <div className="space-y-1">
                {period.tasks.map((task) => {
                  const key = `routine-${task}`;
                  return (
                    <label
                      key={key}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                    >
                      <Checkbox checked={!!checklist[key]} onCheckedChange={() => toggleCheck(key)} />
                      <span className={checklist[key] ? "line-through text-muted-foreground" : "text-foreground text-sm"}>
                        {task}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Hashtags */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Hash className="h-5 w-5 text-primary" />
            Hashtags Recomendadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayContent && (
            <div className="space-y-3">
              {hashtagGroups.slice(0, 2).map((group) => (
                <div key={group.name}>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{group.name}</p>
                  <p className="text-sm text-foreground bg-muted/50 p-2 rounded-md break-all">
                    {group.tags.join(" ")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
