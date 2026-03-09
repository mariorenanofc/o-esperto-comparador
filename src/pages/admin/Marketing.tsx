import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TodayView } from "@/components/admin/marketing/TodayView";
import { WeeklyCalendar } from "@/components/admin/marketing/WeeklyCalendar";
import { StrategyView } from "@/components/admin/marketing/StrategyView";
import { DesignGuide } from "@/components/admin/marketing/DesignGuide";
import { CalendarDays, Sparkles, Target, Palette } from "lucide-react";

const Marketing: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Marketing</h1>
        <p className="text-muted-foreground">Gerencie o plano de marketing e calendário editorial do Instagram</p>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Hoje</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Calendário</span>
          </TabsTrigger>
          <TabsTrigger value="strategy" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Estratégia</span>
          </TabsTrigger>
          <TabsTrigger value="design" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Design</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <TodayView />
        </TabsContent>
        <TabsContent value="calendar">
          <WeeklyCalendar />
        </TabsContent>
        <TabsContent value="strategy">
          <StrategyView />
        </TabsContent>
        <TabsContent value="design">
          <DesignGuide />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Marketing;
