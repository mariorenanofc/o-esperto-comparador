import { supabase } from "@/integrations/supabase/client";

export interface UserStats {
  user_id: string;
  total_contributions: number;
  total_verified: number;
  total_savings_generated: number;
  contribution_streak: number;
  last_contribution_date: string | null;
  xp_points: number;
  level: number;
  updated_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: "contributions" | "verified" | "streak" | "savings" | "special";
  color: string;
}

export const BADGES: Badge[] = [
  {
    id: "first_step",
    name: "Primeiro Passo",
    description: "Fez sua primeira contribuição",
    icon: "🎯",
    requirement: 1,
    type: "contributions",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "contributor_bronze",
    name: "Contribuidor Bronze",
    description: "Fez 10 contribuições",
    icon: "🥉",
    requirement: 10,
    type: "contributions",
    color: "from-amber-600 to-orange-500",
  },
  {
    id: "contributor_silver",
    name: "Contribuidor Prata",
    description: "Fez 50 contribuições",
    icon: "🥈",
    requirement: 50,
    type: "contributions",
    color: "from-gray-400 to-slate-500",
  },
  {
    id: "contributor_gold",
    name: "Contribuidor Ouro",
    description: "Fez 100 contribuições",
    icon: "🥇",
    requirement: 100,
    type: "contributions",
    color: "from-yellow-400 to-amber-500",
  },
  {
    id: "verified_hunter",
    name: "Caçador de Ofertas",
    description: "5 contribuições verificadas",
    icon: "🎖️",
    requirement: 5,
    type: "verified",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "precision_master",
    name: "Precisão Total",
    description: "10 contribuições verificadas sem rejeição",
    icon: "🏆",
    requirement: 10,
    type: "verified",
    color: "from-purple-500 to-indigo-500",
  },
  {
    id: "streak_3",
    name: "Consistente",
    description: "3 dias consecutivos contribuindo",
    icon: "🔥",
    requirement: 3,
    type: "streak",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "streak_7",
    name: "Streak Semanal",
    description: "7 dias consecutivos contribuindo",
    icon: "⚡",
    requirement: 7,
    type: "streak",
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "streak_30",
    name: "Imbatível",
    description: "30 dias consecutivos contribuindo",
    icon: "💎",
    requirement: 30,
    type: "streak",
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "savings_100",
    name: "Ajudante",
    description: "Ajudou a economizar R$100",
    icon: "💰",
    requirement: 100,
    type: "savings",
    color: "from-green-400 to-emerald-500",
  },
  {
    id: "savings_1000",
    name: "Mestre da Economia",
    description: "Ajudou a economizar R$1.000",
    icon: "💵",
    requirement: 1000,
    type: "savings",
    color: "from-emerald-500 to-teal-500",
  },
];

export interface LeaderboardEntry {
  user_id: string;
  name: string;
  xp_points: number;
  level: number;
  total_contributions: number;
  rank: number;
}

export const gamificationService = {
  async getUserStats(userId: string): Promise<UserStats | null> {
    const { data, error } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from("user_achievements")
      .select("*")
      .eq("user_id", userId)
      .order("earned_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async checkAndAwardBadges(userId: string): Promise<Badge[]> {
    const stats = await this.getUserStats(userId);
    if (!stats) return [];

    const existingAchievements = await this.getUserAchievements(userId);
    const existingBadgeIds = new Set(existingAchievements.map((a) => a.badge_id));
    
    const newBadges: Badge[] = [];

    for (const badge of BADGES) {
      if (existingBadgeIds.has(badge.id)) continue;

      let earned = false;
      
      switch (badge.type) {
        case "contributions":
          earned = stats.total_contributions >= badge.requirement;
          break;
        case "verified":
          earned = stats.total_verified >= badge.requirement;
          break;
        case "streak":
          earned = stats.contribution_streak >= badge.requirement;
          break;
        case "savings":
          earned = stats.total_savings_generated >= badge.requirement;
          break;
      }

      if (earned) {
        await supabase.from("user_achievements").insert({
          user_id: userId,
          badge_id: badge.id,
        });
        newBadges.push(badge);
      }
    }

    return newBadges;
  },

  async getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    // Try to get from cache first
    const { data: cached } = await supabase
      .from("leaderboard_cache")
      .select("rankings")
      .eq("period", "alltime")
      .single();

    if (cached && cached.rankings) {
      return (cached.rankings as unknown as LeaderboardEntry[]).slice(0, limit);
    }

    // Calculate fresh leaderboard
    const { data, error } = await supabase
      .from("user_stats")
      .select(`
        user_id,
        xp_points,
        level,
        total_contributions
      `)
      .order("xp_points", { ascending: false })
      .limit(limit);

    if (error) throw error;
    if (!data) return [];

    // Get user names
    const userIds = data.map((s) => s.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name")
      .in("id", userIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p.name]) || []);

    return data.map((entry, index) => ({
      user_id: entry.user_id,
      name: profileMap.get(entry.user_id) || "Usuário",
      xp_points: entry.xp_points,
      level: entry.level,
      total_contributions: entry.total_contributions,
      rank: index + 1,
    }));
  },

  getBadgeById(badgeId: string): Badge | undefined {
    return BADGES.find((b) => b.id === badgeId);
  },

  getXpForNextLevel(currentLevel: number): number {
    return Math.pow(currentLevel, 2) * 100;
  },

  getLevelProgress(xpPoints: number, level: number): number {
    const currentLevelXp = Math.pow(level - 1, 2) * 100;
    const nextLevelXp = Math.pow(level, 2) * 100;
    const progress = ((xpPoints - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
    return Math.min(100, Math.max(0, progress));
  },
};
