import React from "react";
import { Trophy, Zap, Star, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { gamificationService, BADGES, Badge as BadgeType } from "@/services/gamificationService";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const BadgeIcon: React.FC<{ badge: BadgeType; earned: boolean }> = ({ badge, earned }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all cursor-pointer ${
            earned
              ? `bg-gradient-to-br ${badge.color} shadow-lg hover:scale-110`
              : "bg-muted text-muted-foreground grayscale opacity-40"
          }`}
        >
          {badge.icon}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-center">
          <p className="font-semibold">{badge.name}</p>
          <p className="text-xs text-muted-foreground">{badge.description}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const UserGamificationProfile: React.FC = () => {
  const { user, profile } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["user-stats", user?.id],
    queryFn: () => gamificationService.getUserStats(user!.id),
    enabled: !!user,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["user-achievements", user?.id],
    queryFn: () => gamificationService.getUserAchievements(user!.id),
    enabled: !!user,
  });

  const earnedBadgeIds = new Set(achievements.map((a) => a.badge_id));

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Faça login para ver seu progresso.
        </CardContent>
      </Card>
    );
  }

  if (statsLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const level = stats?.level || 1;
  const xp = stats?.xp_points || 0;
  const progress = gamificationService.getLevelProgress(xp, level);
  const xpForNext = gamificationService.getXpForNextLevel(level);

  return (
    <div className="space-y-6">
      {/* Level & XP Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-hero-primary to-hero-accent p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
              <span className="text-3xl font-bold">{level}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{profile?.name || "Usuário"}</h2>
              <p className="text-white/80">Nível {level}</p>
              <div className="mt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>{xp} XP</span>
                  <span>{xpForNext} XP</span>
                </div>
                <Progress value={progress} className="h-2 bg-white/20" />
              </div>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-hero-primary">
                {stats?.total_contributions || 0}
              </div>
              <p className="text-xs text-muted-foreground">Contribuições</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-orange-500 flex items-center justify-center gap-1">
                <Flame className="w-5 h-5" />
                {stats?.contribution_streak || 0}
              </div>
              <p className="text-xs text-muted-foreground">Dias Seguidos</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-green-600">
                R$ {(stats?.total_savings_generated || 0).toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">Economia Gerada</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Conquistas
            <Badge variant="secondary">{achievements.length}/{BADGES.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
            {BADGES.map((badge) => (
              <BadgeIcon
                key={badge.id}
                badge={badge}
                earned={earnedBadgeIds.has(badge.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserGamificationProfile;
