import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { marketingCalendar, getWeekForDate, getDayIndex } from "@/data/marketingCalendar";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

export const WeeklyCalendar: React.FC = () => {
  const currentWeek = getWeekForDate(new Date());
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const todayDayIdx = getDayIndex(new Date());

  const week = marketingCalendar.find((w) => w.week === selectedWeek);

  const pillarColors: Record<string, string> = {
    Educativo: "bg-primary/10 text-primary border-primary/30",
    Engajamento: "bg-orange-500/10 text-orange-600 border-orange-500/30",
    "Prova Social": "bg-green-500/10 text-green-600 border-green-500/30",
    Bastidores: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  };

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
              disabled={selectedWeek <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <h3 className="text-lg font-bold text-foreground">Semana {selectedWeek}</h3>
              <p className="text-sm text-muted-foreground">Mês {week?.month || 1}</p>
              {selectedWeek === currentWeek && (
                <Badge variant="default" className="mt-1">Semana atual</Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedWeek(Math.min(52, selectedWeek + 1))}
              disabled={selectedWeek >= 52}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Week Focus */}
      {week && (
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-foreground">Foco da Semana</h4>
            </div>
            <p className="text-muted-foreground">{week.focus}</p>
          </CardContent>
        </Card>
      )}

      {/* Days */}
      <div className="grid gap-3">
        {week?.days.map((day, idx) => {
          const isToday = selectedWeek === currentWeek && idx === todayDayIdx;
          return (
            <Card
              key={idx}
              className={isToday ? "border-primary bg-primary/5 ring-1 ring-primary/20" : ""}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-16 text-center p-2 rounded-lg ${isToday ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <p className="text-xs font-medium">{day.dayOfWeek.slice(0, 3)}</p>
                    <p className="text-lg">{day.formatEmoji}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="outline" className={`text-xs ${pillarColors[day.pillar] || ""}`}>
                        {day.pillar}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{day.format}</span>
                      {isToday && <Badge className="text-xs">Hoje</Badge>}
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">{day.theme}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Jump */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ir para semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {[1, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 43, 48, 52].map((w) => (
              <Button
                key={w}
                variant={w === selectedWeek ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => setSelectedWeek(w)}
              >
                S{w}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
