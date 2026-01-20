import React from "react";
import Navbar from "@/components/Navbar";
import { UserGamificationProfile } from "@/components/gamification/UserGamificationProfile";
import { Leaderboard } from "@/components/gamification/Leaderboard";
import { Trophy, Star, Zap, Target, Gift, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BADGES } from "@/services/gamificationService";

const GamificationPreview: React.FC = () => {
  // Show preview badges (first 6)
  const previewBadges = BADGES.slice(0, 6);
  
  const benefits = [
    {
      icon: Star,
      title: "Suba de Nível",
      description: "Ganhe XP a cada contribuição e desbloqueie novos níveis"
    },
    {
      icon: Trophy,
      title: "Conquiste Badges",
      description: "Colecione conquistas únicas por suas ações"
    },
    {
      icon: Target,
      title: "Apareça no Ranking",
      description: "Competita com outros contribuidores"
    },
    {
      icon: Gift,
      title: "Recompensas Exclusivas",
      description: "Desbloqueie benefícios especiais"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-hero-primary to-hero-accent rounded-full flex items-center justify-center shadow-lg">
          <Trophy className="w-10 h-10 text-white" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Sistema de Gamificação</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Contribua com preços, ganhe pontos, suba de nível e apareça no ranking dos melhores contribuidores!
        </p>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="bg-gradient-to-r from-hero-primary to-hero-accent">
            <Link to="/signup">
              <Zap className="w-4 h-4 mr-2" />
              Criar Conta Grátis
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/login">
              Já tenho conta
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Benefits Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {benefits.map((benefit, index) => (
          <Card key={index} className="text-center hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Preview Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Conquistas Disponíveis
              <Badge variant="secondary">{BADGES.length} badges</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-4">
              {previewBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center text-2xl bg-gradient-to-br ${badge.color} shadow-md`}
                  title={badge.name}
                  role="img"
                  aria-label={badge.name}
                >
                  {badge.icon}
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              E mais {BADGES.length - previewBadges.length} conquistas para desbloquear...
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Leaderboard Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Leaderboard />
      </motion.div>
    </div>
  );
};

const Gamification: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary" aria-hidden="true" />
            Conquistas e Ranking
          </h1>
          <p className="text-muted-foreground mt-2">
            {user 
              ? "Acompanhe seu progresso e compare com outros contribuidores"
              : "Participe da comunidade e ganhe recompensas por suas contribuições"
            }
          </p>
        </motion.div>
        
        {user ? (
          <div className="grid lg:grid-cols-2 gap-8">
            <UserGamificationProfile />
            <Leaderboard />
          </div>
        ) : (
          <GamificationPreview />
        )}
      </div>
    </div>
  );
};

export default Gamification;
