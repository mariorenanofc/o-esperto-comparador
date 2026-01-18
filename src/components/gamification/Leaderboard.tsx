import React from "react";
import { Trophy, Medal, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { gamificationService, LeaderboardEntry } from "@/services/gamificationService";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

const RankDisplay: React.FC<{ rank: number }> = ({ rank }) => {
  if (rank === 1) {
    return <span className="text-2xl">🥇</span>;
  }
  if (rank === 2) {
    return <span className="text-2xl">🥈</span>;
  }
  if (rank === 3) {
    return <span className="text-2xl">🥉</span>;
  }
  return (
    <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
      {rank}
    </span>
  );
};

export const Leaderboard: React.FC = () => {
  const { user } = useAuth();

  const { data: leaders = [], isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => gamificationService.getLeaderboard(10),
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (leaders.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">Nenhum contribuidor ainda</h3>
          <p className="text-muted-foreground">
            Seja o primeiro a contribuir e aparecer no ranking!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Ranking de Contribuidores
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {leaders.map((entry) => (
            <div
              key={entry.user_id}
              className={`p-4 flex items-center gap-4 transition-colors ${
                entry.user_id === user?.id
                  ? "bg-hero-primary/5"
                  : "hover:bg-muted/50"
              }`}
            >
              <RankDisplay rank={entry.rank} />

              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-br from-hero-primary to-hero-accent text-white">
                  {entry.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{entry.name}</span>
                  {entry.user_id === user?.id && (
                    <Badge variant="secondary" className="text-xs">Você</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>Nível {entry.level}</span>
                  <span>•</span>
                  <span>{entry.total_contributions} contribuições</span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-hero-primary flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {entry.xp_points}
                </div>
                <p className="text-xs text-muted-foreground">XP</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
