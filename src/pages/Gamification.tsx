import React from "react";
import Navbar from "@/components/Navbar";
import { UserGamificationProfile } from "@/components/gamification/UserGamificationProfile";
import { Leaderboard } from "@/components/gamification/Leaderboard";
import { Trophy } from "lucide-react";

const Gamification: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Conquistas e Ranking
          </h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe seu progresso e compare com outros contribuidores
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <UserGamificationProfile />
          <Leaderboard />
        </div>
      </div>
    </div>
  );
};

export default Gamification;
